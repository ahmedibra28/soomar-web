import nc from 'next-connect'
import db from '../../../../config/db'
import InternetCategory from '../../../../models/InternetCategory'

const handler = nc()
handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { id: provider } = req.query

      if (!provider) {
        return res.status(400).json({ error: 'Internet provider is required' })
      }

      const categories = await InternetCategory.find({
        internetProvider: provider,
        status: 'active',
      })
        .populate('internetProvider', ['name', 'image'])
        .sort({ createdAt: -1 })
        .lean()
        .select('name image _id')

      return res.json(categories)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
