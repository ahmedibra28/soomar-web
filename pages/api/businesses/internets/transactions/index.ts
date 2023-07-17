import nc from 'next-connect'
import db from '../../../../../config/db'
import InternetTransaction, {
  IInternetTransaction,
} from '../../../../../models/InternetTransaction'
import moment from 'moment'
import Business from '../../../../../models/Business'

const handler = nc()
handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      let { startDate, endDate } = req.query
      const { senderMobile, receiverMobile } = req.query as any
      const { apikey } = req.query as any

      startDate = startDate || new Date()
      endDate = endDate || new Date()

      const start = moment(startDate).startOf('day').format('YYYY-MM-DD HH:mm')
      const end = moment(endDate).endOf('day').format('YYYY-MM-DD HH:mm')

      const business = await Business.findOne({
        apiKey: apikey,
        status: 'active',
      })
      if (!business)
        return res
          .status(400)
          .json({ error: 'Invalid business apikey or business is not active' })

      const queryCondition =
        receiverMobile || senderMobile
          ? {
              ...((senderMobile && { senderMobile }) ||
                (receiverMobile && { receiverMobile })),
              createdAt: {
                $gte: start,
                $lte: end,
              },
              business: business._id,
            }
          : { business: business._id }

      let query = InternetTransaction.find(queryCondition)

      const page = parseInt(req.query.page) || 1
      const pageSize = parseInt(req.query.limit) || 25
      const skip = (page - 1) * pageSize
      const total = await InternetTransaction.countDocuments(queryCondition)

      const pages = Math.ceil(total / pageSize)

      query = query
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: -1 })
        .lean()
        .select(
          'createdAt provider category bundle _id business senderMobile receiverMobile'
        )
        .populate('provider', ['name', 'image'])
        .populate('category', ['name', 'image'])
        .populate('business', ['name', 'mobile', 'address'])
        .populate('bundle', 'amount label description')

      let result: IInternetTransaction[] = await query

      result = result?.map((transaction) => ({
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
