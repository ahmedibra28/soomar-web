import nc from 'next-connect'
import db from '../../../../config/db'
import InternetTransaction, {
  IInternetTransaction,
} from '../../../../models/InternetTransaction'
import Business from '../../../../models/Business'

const handler = nc()
handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { apikey } = req.query as any

      const business = await Business.findOne({
        apiKey: apikey,
        status: 'active',
      })
      if (!business)
        return res
          .status(400)
          .json({ error: 'Invalid business apikey or business is not active' })

      let transactions = (await InternetTransaction.find({
        business: business._id,
      })
        .sort({ createdAt: -1 })
        .lean()
        .select(
          'createdAt provider category bundle _id business senderMobile, receiverMobile'
        )
        .populate('provider', ['name', 'image'])
        .populate('category', ['name', 'image'])
        .populate('business', ['name', 'mobile', 'address'])
        .populate(
          'bundle',
          'amount label description'
        )) as IInternetTransaction[]

      transactions = transactions?.map((transaction) => ({
        ...transaction,
        provider: {
          ...transaction.provider,
          image: `https://app.soomar.so${transaction.provider.image}`,
        },
        category: {
          ...transaction.category,
          image: `https://app.soomar.so${transaction.category.image}`,
        },
      }))

      return res.json(transactions)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
