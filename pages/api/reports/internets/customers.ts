import nc from 'next-connect'
import db from '../../../../config/db'
import InternetTransaction from '../../../../models/InternetTransaction'
import { isAuth } from '../../../../utils/auth'

const handler = nc()
handler.use(isAuth)
handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const q = req.query && req.query.q

      const queryCondition = q
        ? {
            business: { $exists: false },
            $or: [
              { senderMobile: { $regex: q, $options: 'i' } },
              { receiverMobile: { $regex: q, $options: 'i' } },
            ],
          }
        : {
            business: { $exists: false },
          }

      let query = InternetTransaction.find(queryCondition)

      const page = parseInt(req.query.page) || 1
      const pageSize = parseInt(req.query.limit) || 25
      const skip = (page - 1) * pageSize
      const total = await InternetTransaction.countDocuments(queryCondition)

      const pages = Math.ceil(total / pageSize)

      query = query
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: -1 })
        .lean()
        .populate('user', ['name'])
        .populate('provider', ['name'])
        .populate('bundle', ['name', 'label', 'amount'])

      const result = await query

      res.status(200).json({
        startIndex: skip + 1,
        endIndex: skip + result.length,
        count: result.length,
        page,
        pages,
        total,
        data: result,
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
