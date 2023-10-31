import nc from 'next-connect'
import db from '../../../../config/db'
import { isAuth } from '../../../../utils/auth'
import Order from '../../../../models/Order'

const handler = nc()
handler.use(isAuth)
handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const transactions = await Order.find({
        dealer: req.user._id,
      })
        .sort({ createdAt: -1 })
        .lean()
        .select('createdAt _id products')
        .limit(15)

      // get all points
      const profit = await Order.aggregate([
        {
          $match: {
            dealer: req.user._id,
          },
        },
        {
          $unwind: '$products',
        },
        {
          $group: {
            _id: null,
            totalPoints: { $sum: '$products.points' },
          },
        },
      ])

      const totalProfit = profit?.reduce((a, b) => a + b.totalPoints, 0)

      type Product = {
        _id: string
        name: string
        variations?: string
        points?: number
        createdAt?: Date
      }

      const results: Product[] = []

      transactions?.forEach((transaction) => {
        transaction.products.forEach((product: Product) => {
          results.push({
            _id: product?._id,
            name: product?.name,
            variations: product?.variations,
            points: product?.points,
            createdAt: transaction?.createdAt,
          })
        })
      })

      return res.json({
        transactions: results,
        profit: totalProfit,
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
