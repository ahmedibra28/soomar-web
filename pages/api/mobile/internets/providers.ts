import nc from 'next-connect'
import db from '../../../../config/db'
import InternetProvider from '../../../../models/InternetProvider'

const handler = nc()
handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { q } = req.query

      const branch = req.query?.branch?.split(' ')[0]

      const queryCondition = q
        ? { name: { $regex: q, $options: 'i' }, status: 'active', branch }
        : { status: 'active', branch }

      let query = InternetProvider.find(queryCondition)

      const page = parseInt(req.query.page) || 1
      const pageSize = parseInt(req.query.limit) || 25
      const skip = (page - 1) * pageSize
      const total = await InternetProvider.countDocuments(queryCondition)

      const pages = Math.ceil(total / pageSize)

      query = query
        .skip(skip)
        .limit(pageSize)
        // .sort({ createdAt: -1 })
        .lean()
        .select('name image _id')

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
