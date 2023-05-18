import nc from 'next-connect'
import db from '../../../../config/db'
import { isAuth } from '../../../../utils/auth'
import axios from 'axios'
import Order from '../../../../models/Order'
import Payment from '../../../../models/Payment'
// @ts-ignore
import evc from 'evc-api'

const handler = nc()

handler.use(isAuth)

const login = async (branch: string) => {
  const email = `${branch}@soomar.so`
  const password = process.env.LOGIN_PASSWORD

  const { data } = await axios.post(`${process.env.API_URL}/auth/login`, {
    email,
    password,
    dbCode: 3020,
  })

  delete data.routes
  return data
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
      branch = branch.split(' ')[0]

      const deliveryAddress = req.body.deliveryAddress

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

      // hear check if inventory is available before payment

      const amount = localFormat.products.reduce(
        (acc: number, cur: any) => acc + cur.price * cur.quantity,
        0
      )

      const url = `${process.env.API_URL}/mobile/orders`

      const { MERCHANT_U_ID, API_USER_ID, API_KEY } = process.env

      const paymentInfo = await evc({
        merchantUId: MERCHANT_U_ID,
        apiUserId: API_USER_ID,
        apiKey: API_KEY,
        customerMobileNumber: `252${deliveryAddress.mobile}`,
        // customerMobileNumber: `252770022200`,
        description: `${req.user.name} has paid ${amount?.toFixed(
          2
        )} for product price and ${deliveryAddress.deliveryPrice?.toFixed(
          2
        )} for delivery cost from ${branch} branch`,
        amount: amount + deliveryAddress.deliveryPrice,
        // amount: 0.01,
        autoWithdraw: false,
        merchantNo: '*********',
      })

      console.log(paymentInfo)

      if (paymentInfo.responseCode !== '2001')
        return res.status(401).json({ error: `Payment failed` })

      const payment = await Payment.create({
        user: req.user._id,
        amount,
        currency: 'USD',
        status: { stepOne: 'success', stepTwo: 'success' },
      })

      axios
        .post(url, req.body, await config(branch))
        .then(() => {
          Order.create(localFormat)
            .then(() => {
              return res.status(200).json('success')
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
