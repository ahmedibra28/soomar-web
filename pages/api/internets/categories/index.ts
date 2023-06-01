import nc from 'next-connect'
import db from '../../../../config/db'
import InternetCategory from '../../../../models/InternetCategory'
import { isAuth } from '../../../../utils/auth'

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

      let query = InternetCategory.find(queryCondition)

      const page = parseInt(req.query.page) || 1
      const pageSize = parseInt(req.query.limit) || 25
      const skip = (page - 1) * pageSize
      const total = await InternetCategory.countDocuments(queryCondition)

      const pages = Math.ceil(total / pageSize)

      query = query
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: -1 })
        .lean()
        .populate('internetProvider', ['name', 'image', 'branch'])

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
      const { internetProvider, name, image, status } = req.body

      const exist = await InternetCategory.findOne({
        name: { $regex: `^${name?.trim()}$`, $options: 'i' },
        internetProvider,
      })
      if (exist)
        return res
          .status(400)
          .json({ error: 'Duplicate internet category detected' })

      const object = await InternetCategory.create({
        internetProvider,
        name,
        image,
        status,
        createdBy: req.user._id,
      })
      res.status(200).send(object)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
