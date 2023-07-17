import nc from 'next-connect'
import db from '../../../../../../config/db'
import InternetCategory, {
  IInternetCategory,
} from '../../../../../../models/InternetCategory'

const handler = nc()
handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { id } = req.query

      let query = (await InternetCategory.findOne({ status: 'active', _id: id })
        .lean()
        .populate('internetProvider', 'name image')
        .select(
          '-createdAt -updatedAt -__v -createdBy -updatedBy -status -branch'
        )) as IInternetCategory

      if (!query)
        return res.status(404).json({ error: 'Internet category not found' })

      query = {
        ...query,
        image: `https://app.soomar.so${query?.image}`,
        internetProvider: {
          ...query?.internetProvider,
          image: `https://app.soomar.so${query?.internetProvider?.image}`,
        },
      }

      res.status(200).json(query)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
