import nc from 'next-connect'
import db from '../../../../config/db'
import Notification from '../../../../models/Notification'
import { isAuth } from '../../../../utils/auth'

const schemaName = Notification

const handler = nc()
handler.use(isAuth)
handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const q = req.query && req.query.q

      const queryBuilder = q
        ? { title: { $regex: q, $options: 'i' }, type: 'system' }
        : { type: 'system' }

      let query = schemaName.find(queryBuilder)

      const page = parseInt(req.query.page) || 1
      const pageSize = parseInt(req.query.limit) || 25
      const skip = (page - 1) * pageSize
      const total = await schemaName.countDocuments(queryBuilder)

      const pages = Math.ceil(total / pageSize)

      query = query.skip(skip).limit(pageSize).sort({ createdAt: -1 }).lean()

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
