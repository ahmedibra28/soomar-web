import nc from 'next-connect'
import db from '../../../../config/db'
// import InternetTransaction from '../../../../models/InternetTransaction'
// import Bundle from '../../../../models/Bundle'
import { isAuth } from '../../../../utils/auth'
import { ProviderNumberValidation } from '../../../../utils/ProviderNumber'

const handler = nc()
handler.use(isAuth)
handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const {
        senderMobile,
        receiverMobile,
        selectBundle: {
          _id: bundleId,
          internetCategory: {
            _id: categoryId,
            internetProvider: { _id: providerId, name: provider },
          },
        },
      } = req.body

      console.log({
        senderMobile,
        receiverMobile,
        bundleId,
        categoryId,
        providerId,
      })

      const providerSender = ProviderNumberValidation(senderMobile).validSender
      if (!providerSender)
        return res.status(400).json({ error: 'Invalid sender mobile number' })

      const providerReceiver =
        ProviderNumberValidation(receiverMobile).validReceiver
      if (!providerReceiver)
        return res.status(400).json({ error: 'Invalid receiver mobile number' })

      const providerName =
        ProviderNumberValidation(receiverMobile).validProviderName
      if (!providerName || providerName !== provider.toLowerCase())
        return res.status(400).json({
          error: 'Invalid receiver mobile number or mismatch provider name',
        })

      //   const { id: category } = req.query

      //   if (!category) {
      //     return res.status(400).json({ error: 'Category is required' })
      //   }

      //   const bundles = await Bundle.find({
      //     internetCategory: category,
      //     status: 'active',
      //   })
      //     .sort({ createdAt: -1 })
      //     .lean()
      //     .populate({
      //       path: 'internetCategory',
      //       select: ['name', 'image', 'internetProvider'],
      //       populate: {
      //         path: 'internetProvider',
      //         select: ['name', 'image'],
      //       },
      //     })
      //     .select('-createdAt -updatedAt -__v -createdBy')

      //   return res.json(bundles)
      return res.json('success')
      // return res.status(400).json({ error: 'srry' })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler

// const SOMLINK = '6421558efb02b13e6b5f0ace'
// const HORMUUD = '6421552afb02b13e6b5f07cc'
// const SOMTEL = '6422f8e54f44fa88647f2587'
// const SOMNET = '64215500fb02b13e6b5efeac'
// const AMTEL = null
