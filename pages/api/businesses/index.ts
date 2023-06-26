import nc from 'next-connect'
import db from '../../../config/db'
import Business from '../../../models/Business'
import { isAuth } from '../../../utils/auth'
import { v4 as uuidv4 } from 'uuid'

const handler = nc()
handler.use(isAuth)
handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const q = req.query && req.query.q

      const queryCondition = q
        ? { name: { $regex: q, $options: 'i' }, status: { $ne: 'deleted' } }
        : { status: { $ne: 'deleted' } }

      let query = Business.find(queryCondition)

      const page = parseInt(req.query.page) || 1
      const pageSize = parseInt(req.query.limit) || 25
      const skip = (page - 1) * pageSize
      const total = await Business.countDocuments(queryCondition)

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

handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { name, status, address, mobile } = req.body

      const exist = await Business.findOne({
        name: { $regex: `^${name?.trim()}$`, $options: 'i' },
      })
      if (exist)
        return res.status(400).json({ error: 'Duplicate business detected' })

      const object = await Business.create({
        name,
        status,
        address,
        mobile,
        apiKey: uuidv4(),
        createdBy: req.user._id,
      })
      res.status(200).send(object)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
