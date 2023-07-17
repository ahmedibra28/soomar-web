import nc from 'next-connect'
import db from '../../../../../../config/db'
import Bundle, { IBundle } from '../../../../../../models/Bundle'
import InternetCategory from '../../../../../../models/InternetCategory'

const handler = nc()
handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { id } = req.query
      const categories = await InternetCategory.find({
        _id: id,
        status: 'active',
      })

      if (!categories || categories?.length === 0)
        return res.status(404).json({ error: 'Internet category not found' })

      const catIds = categories.map((cat) => cat?._id)

      let query = (await Bundle.find({
        status: 'active',
        internetCategory: { $in: catIds },
      })
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
        })) as IBundle[]

      query = query.map((bundle) => ({
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

      res.status(200).json(query)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
