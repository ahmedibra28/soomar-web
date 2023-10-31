import nc from 'next-connect'
import db from '../../../../config/db'
import { isAuth } from '../../../../utils/auth'
import DealerTransaction from '../../../../models/DealerTransaction'

const handler = nc()
handler.use(isAuth)
handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const transactions = await DealerTransaction.find({
        user: req.user._id,
      })
        .sort({ createdAt: -1 })
        .lean()
        .select('createdAt amount type')
        .limit(15)

      return res.json(transactions)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
