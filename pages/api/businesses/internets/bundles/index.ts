import nc from 'next-connect'
import db from '../../../../../config/db'
import Bundle, { IBundle } from '../../../../../models/Bundle'

const handler = nc()
handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { q } = req.query

      const queryCondition = q
        ? {
            $or: [
              { label: { $regex: q as string, $options: 'i' } },
              { description: { $regex: q as string, $options: 'i' } },
            ],
            status: 'active',
          }
        : { status: 'active' }

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
        .select(
          '-createdAt -updatedAt -__v -createdBy -updatedBy -status -branch -quantity'
        )
        .populate({
          path: 'internetCategory',
          select: ['name', 'image', 'internetProvider'],
          populate: {
            path: 'internetProvider',
            select: ['name', 'image'],
          },
        })

      let result: IBundle[] = await query

      result = result.map((bundle) => ({
        ...bundle,
        internetCategory: {
          ...bundle.internetCategory,
          image: `https://app.soomar.so${bundle.internetCategory.image}`,
          internetProvider: {
            ...bundle.internetCategory.internetProvider,
            image: `https://app.soomar.so${bundle.internetCategory.internetProvider.image}`,
          },
        },
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
