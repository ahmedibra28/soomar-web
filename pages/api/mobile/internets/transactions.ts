import nc from 'next-connect'
import db from '../../../../config/db'
import { isAuth } from '../../../../utils/auth'
import InternetTransaction from '../../../../models/InternetTransaction'

const handler = nc()
handler.use(isAuth)
handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const transactions = await InternetTransaction.find({
        user: req.user._id,
      })
        .sort({ createdAt: -1 })
        .lean()
        .select('createdAt provider category bundle _id')
        .populate('provider', 'name')
        .populate('category', 'name')
        .populate('bundle', 'amount label description quantity')

      return res.json(transactions)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
