import nc from 'next-connect'
import db from '../../../../config/db'
import Bundle from '../../../../models/Bundle'
import { InternetPriceIncrement } from '../../../../utils/InternetPriceIncrement'

const handler = nc()
handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { id: category } = req.query
      const platform = (req.headers['platform'] || 'soomar') as string

      if (!category) {
        return res.status(400).json({ error: 'Category is required' })
      }

      let bundles = await Bundle.find({
        internetCategory: category,
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
        .select('-createdAt -updatedAt -__v -createdBy')

      bundles = bundles?.map((item) => ({
        ...item,
        amount: InternetPriceIncrement({
          amount: item?.amount,
          provider: item?.internetCategory?.internetProvider?.name,
          platform,
        }),
      }))

      return res.json(bundles)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
