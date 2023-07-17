import nc from 'next-connect'
import db from '../../../../../config/db'
import InternetProvider, {
  IInternetProvider,
} from '../../../../../models/InternetProvider'

const handler = nc()
handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { q } = req.query

      const queryCondition = q
        ? { name: { $regex: q, $options: 'i' }, status: 'active' }
        : { status: 'active' }

      let query = InternetProvider.find(queryCondition)

      const page = parseInt(req.query.page) || 1
      const pageSize = parseInt(req.query.limit) || 25
      const skip = (page - 1) * pageSize
      const total = await InternetProvider.countDocuments(queryCondition)

      const pages = Math.ceil(total / pageSize)

      query = query
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: -1 })
        .lean()
        .select(
          '-createdAt -updatedAt -__v -createdBy -updatedBy -status -branch'
        )

      let result: IInternetProvider[] = await query

      result = result.map((providers) => ({
        ...providers,
        image: `https://app.soomar.so${providers?.image}`,
      }))

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
