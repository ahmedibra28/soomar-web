import nc from 'next-connect'
import db from '../../../../../config/db'
import InternetTransaction, {
  IInternetTransaction,
} from '../../../../../models/InternetTransaction'
import Business from '../../../../../models/Business'

const handler = nc()
handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { apikey, id } = req.query as any

      const business = await Business.findOne({
        apiKey: apikey,
        status: 'active',
      })
      if (!business)
        return res
          .status(400)
          .json({ error: 'Invalid business apikey or business is not active' })

      const queryCondition = { business: business._id, _id: id }

      let query = (await InternetTransaction.findOne(queryCondition)
        .lean()
        .select(
          'createdAt provider category bundle _id business senderMobile receiverMobile'
        )
        .populate('provider', ['name', 'image'])
        .populate('category', ['name', 'image'])
        .populate('business', ['name', 'mobile', 'address'])
        .populate('bundle', 'amount label description')) as IInternetTransaction

      if (!query)
        return res.status(404).json({ error: 'Transaction not found' })

      query = {
        ...query,
        provider: {
          ...query.provider,
          image: `https://app.soomar.so${query.provider.image}`,
        },
        category: {
          ...query.category,
          image: `https://app.soomar.so${query.category.image}`,
        },
      }

      res.status(200).json(query)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
