import nc from 'next-connect'
import db from '../../../../config/db'
import { isAuth } from '../../../../utils/auth'
import Order from '../../../../models/Order'

const handler = nc()
handler.use(isAuth)
handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const transactions = await Order.find({
        dealer: req.user._id,
      })
        .sort({ createdAt: -1 })
        .lean()
        .select('createdAt _id products')
        .limit(1)

      return res.json(transactions)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
