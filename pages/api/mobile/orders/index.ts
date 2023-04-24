import nc from 'next-connect'
import db from '../../../../config/db'
import { isAuth } from '../../../../utils/auth'
import axios from 'axios'
import Order from '../../../../models/Order'

const handler = nc()

handler.use(isAuth)

handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { orderItems, address, deliveryAddress } = req.body

      const { data } = await axios.post(`${process.env.API_URL}/sales`, {
        orderItems,
      })

      if (!data) return res.status(400).json({ error: 'Order not created' })

      const objectOrder = await Order.create({
        orderItems,
        user: req.user._id,
        shippingAddress: {
          address,
          deliveryAddress,
        },
      })

      if (!objectOrder)
        return res
          .status(400)
          .json({ error: 'Order process has not been completed' })

      res.status(201).json(objectOrder)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
