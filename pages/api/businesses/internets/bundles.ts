import nc from 'next-connect'
import db from '../../../../config/db'
import Bundle, { IBundle } from '../../../../models/Bundle'

const handler = nc()
handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      let bundles = (await Bundle.find({
        status: 'active',
      })
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
        .select(
          '-createdAt -updatedAt -__v -createdBy -quantity -status -updatedBy'
        )) as IBundle[]

      bundles = bundles?.map((bundle) => ({
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

      return res.json(bundles)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
