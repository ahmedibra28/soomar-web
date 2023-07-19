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

const handler = nc()

handler.use(isAuth)

const login = async (branch: string) => {
  const email = `${branch}@soomar.so`
  const password = process.env.LOGIN_PASSWORD

  const { data } = await axios.post(`${process.env.API_URL}/auth/login`, {
    email,
    password,
    dbCode: 4812,
  })

  delete data.routes
  return data
}

const config = async (branch: string) => {
  const { token } = await login(branch)

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-db-key': 4812,
    },
  }
}

handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()

    try {
      let { branch } = req.query
      branch = branch.split(' ')[0]

      const deliveryAddress = req.body.deliveryAddress

      const provider = ProviderNumberValidation(
        deliveryAddress.mobile
      ).validSender
      if (!provider)
        return res.status(400).json({ error: 'Invalid payment mobile number' })

      const localFormat = {
        products: req.body.cartItems?.map((item: any) => ({
          _id: item._id,
          warehouse: item.warehouse,
          product: {
            _id: item.product._id,
            sku: item.product.sku,
            name: item.product.name,
            image: item.product.image,
          },
          cost: item.cost,
          price: item.price,
          quantity: item.newQuantity,
          color: item.color,
          size: item.size,
          weight: item.weight,
          name: item.product.name,
        })),
        user: req.user._id,
        deliveryAddress,
      }

      const points = req.body?.cartItems?.reduce(
        (acc: number, cur: any) => acc + cur.product?.points * cur.newQuantity,
        0
      )

      const inventoryIds = localFormat.products.map((item: any) => item._id)

      const reFormattingQuantity = localFormat.products.map((item: any) => ({
        _id: item._id,
        quantity: item.quantity,
      }))

      const { data } = await axios.post(
        `${process.env.API_URL}/mobile/inventories/quantity?branch=${branch}`,
        { inventoryIds },
        await config(branch)
      )

      if (!data || data.length === 0)
        return res.status(400).json({ error: 'No inventory found' })

      const quantityComparison = reFormattingQuantity.map((check: any) => {
        const db = data.find((db: any) => db._id === check._id)

        if (db?.quantity < check.quantity) return false
        return true
      })

      if (quantityComparison?.includes(false))
        return res
          .status(400)
          .json({ error: 'Ordered quantity is not available' })

      req.body = {
        products: req.body.cartItems?.map((item: any) => ({
          _id: item._id,
          warehouse: item.warehouse,
          product: {
            _id: item.product._id,
            sku: item.product.sku,
            name: item.product.name,
          },
          cost: item.cost,
          price: item.price,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          weight: item.weight,
          name: item.product.name,
          currentQuantity: item.newQuantity,
          discount: item.discount || 0,
        })),
        warehouse: req.body.cartItems[0].warehouse,
        extra: false,
        customer: branch,
        payInFull: true,
        account: '',
        reference: '',
        description: '',
      }

      const amount = localFormat.products.reduce(
        (acc: number, cur: any) => acc + cur.price * cur.quantity,
        0
      )

      const url = `${process.env.API_URL}/mobile/orders`

      const { MERCHANT_U_ID, API_USER_ID, API_KEY, MERCHANT_ACCOUNT_NO } =
        process.env

      const paymentInfo = await useEVCPayment({
        merchantUId: MERCHANT_U_ID,
        apiUserId: API_USER_ID,
        apiKey: API_KEY,
        customerMobileNumber: `252${deliveryAddress.mobile}`,
        description: `${req.user.name} has paid ${amount?.toFixed(
          2
        )} for product price and ${deliveryAddress.deliveryPrice?.toFixed(
          2
        )} for delivery cost from ${branch} branch`,
        amount: amount + deliveryAddress.deliveryPrice,
        withdrawTo: 'MERCHANT',
        withdrawNumber: MERCHANT_ACCOUNT_NO,
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

      axios
        .post(url, req.body, await config(branch))
        .then(() => {
          Order.create(localFormat)
            .then(async () => {
              if (req.user.role === 'CUSTOMER') {
                await Profile.findOneAndUpdate(
                  { user: req.user._id },
                  {
                    $inc: { points: points / 2 },
                  }
                )
              }

              if (req.user.role === 'AGENT') {
                await Profile.findOneAndUpdate(
                  { user: req.user._id },
                  {
                    $inc: { points: points },
                  }
                )
              }
              const profile = await Profile.findOne({ user: req.user._id })

              const token = await getToken()
              await sendSMS({
                token: token.access_token,
                mobile: profile.mobile,
                message: `Mahadsanid macmiil, dalabkaaga wuu nasoo gaaray, waxaana kula soo xiriiri doona qeybta delivery-ga 0619988338, waxaadna heshay ${profile.points} dhibcood.`,
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
