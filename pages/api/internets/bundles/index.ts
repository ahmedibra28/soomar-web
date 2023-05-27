import nc from 'next-connect'
import db from '../../../../config/db'
import Bundle from '../../../../models/Bundle'
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

      let query = Bundle.find(queryCondition)

      const page = parseInt(req.query.page) || 1
      const pageSize = parseInt(req.query.limit) || 25
      const skip = (page - 1) * pageSize
      const total = await Bundle.countDocuments(queryCondition)

      const pages = Math.ceil(total / pageSize)

      query = query
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: -1 })
        .lean()
        .populate({
          path: 'internetCategory',
          select: ['name', 'image', 'internetProvider'],
          populate: {
            path: 'internetProvider',
            select: ['name', 'image'],
          },
        })

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
      const { internetCategory, quantity, amount, label, description, status } =
        req.body

      const exist = await Bundle.findOne({
        label: { $regex: `^${label?.trim()}$`, $options: 'i' },
        internetCategory,
        amount,
      })
      if (exist)
        return res
          .status(400)
          .json({ error: 'Duplicate internet category detected' })

      const object = await Bundle.create({
        internetCategory,
        quantity,
        amount,
        label,
        description,
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
