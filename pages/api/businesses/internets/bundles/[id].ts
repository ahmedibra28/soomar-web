import nc from 'next-connect'
import db from '../../../../../config/db'
import Bundle, { IBundle } from '../../../../../models/Bundle'

const handler = nc()
handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { id } = req.query

      let query = (await Bundle.findOne({ status: 'active', _id: id })
        .lean()
        .select(
          '-createdAt -updatedAt -__v -createdBy -updatedBy -status -branch'
        )
        .populate({
          path: 'internetCategory',
          select: ['name', 'image', 'internetProvider'],
          populate: {
            path: 'internetProvider',
            select: ['name', 'image'],
          },
        })) as IBundle

      if (!query)
        return res.status(404).json({ error: 'Internet bundle not found' })

      query = {
        ...query,
        internetCategory: {
          ...query.internetCategory,
          image: `https://app.soomar.so${query.internetCategory.image}`,
          internetProvider: {
            ...query.internetCategory.internetProvider,
            image: `https://app.soomar.so${query.internetCategory.internetProvider.image}`,
          },
        },
      }

      res.status(200).json(query)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
