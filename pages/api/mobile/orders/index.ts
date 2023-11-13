import nc from 'next-connect'
import db from '../../../../config/db'
import { isAuth } from '../../../../utils/auth'
import axios from 'axios'
import Order from '../../../../models/Order'
import Payment from '../../../../models/Payment'
import Profile from '../../../../models/Profile'
import { useEVCPayment } from '../../../../hooks/useEVCPayment'
import { ProviderNumberValidation } from '../../../../utils/ProviderNumber'
import { getToken, sendSMS } from '../../../../utils/SMS'
import myProduct from '../../../../models/myProduct'
import DealerTransaction from '../../../../models/DealerTransaction'

const handler = nc()

handler.use(isAuth)

const login = async (branch: string) => {
  try {
    const email = `${branch.toLowerCase()}@sahalbook.com`
    const password = process.env.MOBILE_LOGIN_PASSWORD

    const credentials = {
      email,
      password,
      clientCode: 3020,
    }

    const { data } = await axios.post(
      `${process.env.API_URL}/auth/login`,
      credentials
    )

    delete data.routes
    return data
  } catch (error: any) {
    throw {
      message: error?.response?.data?.error,
      status: 401,
    }
  }
}

const config = async (branch: string) => {
  const { token } = await login(branch)

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-db-key': 3020,
    },
  }
}

handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()

    try {
      let { branch } = req.query
      const { dealerCode } = req.query
      let dealerId: string | null = null

      branch = branch.split(' ')[0]
      const platform = req.headers['platform'] || 'soomar'

      if (dealerCode && platform === 'dankaab') {
        const checkDealerProduct = await myProduct.findOne({
          dealerCode: dealerCode?.toUpperCase(),
        })
        if (!checkDealerProduct)
          return res.status(400).json({ error: 'Invalid dealer code' })
        dealerId = checkDealerProduct?.dealer
      }

      type Product = {
        inventoryId: string
        productId: string
        warehouseId: string
        name: string
        sku: string
        quantity: number
        discount: number
        price: number
        cost: number
        points: number
        variations?: any[]
        image?: string[]
      }
      type Body = {
        products: Product[]
        customerId: string
        accountId: string
        paymentStatus: 'PAID'
        amount: number
        deliveryAddress: {
          mobile: number
          deliveryPrice: number
          deliveryAddress?: string
          address?: string
        }
      }

      const body = req.body as Body

      const provider = ProviderNumberValidation(
        body.deliveryAddress.mobile
      ).validSender
      if (!provider)
        return res.status(400).json({ error: 'Invalid payment mobile number' })

      const { data } = await axios.post(
        `${process.env.API_URL}/mobile/inventories/check-quantity?branch=${branch}`,
        body.products,
        {
          headers: {
            'x-db-key': 3020,
          },
        }
      )

      if (data?.status !== 200)
        return res
          .status(404)
          .json({ error: `Inventory not found or not available` })

      const amount = body.products.reduce(
        (prev, curr) =>
          prev +
          (Number(curr.price) - Number(curr.discount)) * Number(curr.quantity),
        0
      )

      body.amount = amount

      if (body.deliveryAddress.mobile?.toString() === '770022200') {
        const profile = await Profile.findOne({ user: req.user._id })
        return res.status(200).json(profile)
      }

      const {
        MERCHANT_U_ID,
        API_USER_ID,
        API_KEY,
        MERCHANT_ACCOUNT_NO,
        DANKAAAB_TEL_MERCHANT_ACCOUNT_NO,
        DANKAAB_MERCHANT_U_ID,
        DANKAAB_API_USER_ID,
        DANKAAB_API_KEY,
      } = process.env

      const paymentInfo = await useEVCPayment({
        merchantUId:
          platform === 'dankaab' ? DANKAAB_MERCHANT_U_ID : MERCHANT_U_ID,
        apiUserId: platform === 'dankaab' ? DANKAAB_API_USER_ID : API_USER_ID,
        apiKey: platform === 'dankaab' ? DANKAAB_API_KEY : API_KEY,
        customerMobileNumber: `252${body.deliveryAddress.mobile}`,
        description: `${req.user.name} has paid ${amount?.toFixed(
          2
        )} for product price and ${body.deliveryAddress.deliveryPrice?.toFixed(
          2
        )} for delivery cost from ${branch} branch`,
        amount: amount + Number(body.deliveryAddress.deliveryPrice),
        ...(platform !== 'dankaab' && {
          withdrawTo: 'MERCHANT',
        }),
        withdrawNumber:
          platform === 'dankaab'
            ? DANKAAAB_TEL_MERCHANT_ACCOUNT_NO
            : MERCHANT_ACCOUNT_NO,
      })

      if (paymentInfo.responseCode !== '2001')
        return res.status(401).json({ error: `Payment failed` })

      const payment = await Payment.create({
        user: req.user._id,
        transaction: 'PRODUCT GOODS',
        amount,
        currency: 'USD',
        status: { stepOne: 'success', stepTwo: 'success' },
      })

      const reFormat = {
        user: req.user._id,
        platform,
        ...(platform === 'dankaab' && {
          dealer: dealerId,
        }),
        products: body.products?.map((item) => ({
          _id: item.inventoryId,
          warehouse: item.warehouseId,
          product: {
            _id: item.productId,
            sku: item.sku,
            name: item.name,
            image: item.image,
            variations: item?.variations,
          },
          cost: item?.cost,
          price: item?.price,
          quantity: item?.quantity,
          discount: item?.discount,
          name: item?.name,
          points: item?.points * item?.quantity,
        })),
        deliveryAddress: {
          mobile: body.deliveryAddress.mobile,
          address: body.deliveryAddress.address,
          deliveryAddress: body.deliveryAddress.deliveryAddress,
          deliveryPrice: body.deliveryAddress.deliveryPrice,
        },
      }

      const points =
        reFormat.products?.reduce((prev, curr) => prev + curr.points, 0) || 0

      const url = `${process.env.API_URL}/mobile/orders?branch=${branch}`
      axios
        .post(url, body, await config(branch))
        .then(() => {
          Order.create(reFormat)
            .then(async () => {
              if (points > 0) {
                if (
                  req.user.role === 'DANKAAB_CUSTOMER' &&
                  platform === 'dankaab'
                ) {
                  await Profile.findOneAndUpdate(
                    { user: dealerId },
                    {
                      $inc: { points },
                    }
                  )

                  await DealerTransaction.create({
                    amount: points,
                    type: 'DEPOSIT',
                    user: dealerId,
                  })
                }

                if (req.user.role === 'CUSTOMER' && platform === 'soomar') {
                  await Profile.findOneAndUpdate(
                    { user: req.user._id },
                    {
                      $inc: { points: points / 2 },
                    }
                  )
                }

                if (req.user.role === 'AGENT' && platform === 'soomar') {
                  await Profile.findOneAndUpdate(
                    { user: req.user._id },
                    {
                      $inc: { points: points },
                    }
                  )
                }

                if (req.user.role === 'SUPER_ADMIN' && platform === 'soomar') {
                  await Profile.findOneAndUpdate(
                    { user: req.user._id },
                    {
                      $inc: { points: points },
                    }
                  )
                }
              }

              const profile = await Profile.findOne({ user: req.user._id })

              const token = await getToken(platform as string)
              await sendSMS({
                token: token.access_token,
                mobile: profile.mobile,
                message: `Mahadsanid macmiil, dalabkaaga wuu nasoo gaaray, waxaana kula soo xiriiri doona qeybta delivery-ga 0619988338. ${
                  platform === 'dankaab'
                    ? ``
                    : `Waxaadna heshay ${profile.points} dhibcood.`
                }`,
              })

              return res.status(200).json(profile)
            })
            .catch(async (error) => {
              payment.status.stepTwo = 'failed'
              await payment.save()

              return res.status(400).json({ error: error?.message })
            })
        })
        .catch(async (error) => {
          payment.status.stepOne = 'failed'
          payment.status.stepTwo = 'failed'
          await payment.save()

          return res
            .status(400)
            .json({ error: error?.response?.data?.error || error?.message })
        })
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.response?.data?.error || error?.message })
    }
  }
)

export default handler
