import nc from 'next-connect'
import db from '../../../../config/db'
import { ProviderNumberValidation } from '../../../../utils/ProviderNumber'
import InternetProvider from '../../../../models/InternetProvider'
import InternetCategory from '../../../../models/InternetCategory'
import Bundle from '../../../../models/Bundle'
import { rechargeData } from '../../../../utils/InternetRecharge'
import InternetTransaction from '../../../../models/InternetTransaction'
import { useSomLinkRecharge } from '../../../../hooks/useSomLinkRecharge'
import Business from '../../../../models/Business'

const handler = nc()
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
      const { apikey, city } = req.query as any
      if (!['Mogadishu', 'Hargeisa'].includes(city))
        return res.status(400).json({ error: 'Invalid city' })

      const business = await Business.findOne({
        apiKey: apikey,
        status: 'active',
      })
      if (!business)
        return res
          .status(400)
          .json({ error: 'Invalid business apikey or business is not active' })

      const providerSender = ProviderNumberValidation(senderMobile).validSender
      if (!providerSender)
        return res.status(400).json({ error: 'Invalid sender mobile number' })

      const providerReceiver =
        ProviderNumberValidation(receiverMobile).validReceiver
      if (!providerReceiver)
        return res.status(400).json({ error: 'Invalid receiver mobile number' })

      const providerName =
        ProviderNumberValidation(receiverMobile).validProviderName

      if (
        !providerName ||
        providerName?.toString()?.toLowerCase() !==
          provider.toLowerCase()?.replaceAll(' ', '')
      )
        return res.status(400).json({
          error: 'Invalid receiver mobile number or mismatch provider name',
        })

      // check provider if exist and active
      const checkProvider = await InternetProvider.findOne({
        _id: providerId,
        status: 'active',
      })
      if (!checkProvider)
        return res.status(400).json({ error: 'Invalid provider' })

      // check category if exist and active
      const checkCategory = await InternetCategory.findOne({
        _id: categoryId,
        status: 'active',
        internetProvider: providerId,
      })
      if (!checkCategory)
        return res.status(400).json({ error: 'Invalid internet category' })

      // check bundle if exist and active
      const checkBundle = await Bundle.findOne({
        _id: bundleId,
        status: 'active',
        internetCategory: categoryId,
      })
      if (!checkBundle) return res.status(400).json({ error: 'Invalid bundle' })

      const validateBundleId = (provider: string) => {
        const somlink = '6421558efb02b13e6b5f0ace'
        const hormuud = '6421552afb02b13e6b5f07cc'
        const somtel = '6422f8e54f44fa88647f2587'
        const somtelSL = '6422f8e54f44fa88647f2589'
        const somnet = '64215500fb02b13e6b5efeac'
        const amtel = null

        if (provider == 'somtel') return somtel
        if (provider == 'somnet') return somnet
        if (provider == 'amtel') return amtel
        if (provider == 'hormuud') return hormuud
        if (provider == 'somlink') return somlink
        if (provider == 'somtel sl') return somtelSL

        return false
      }

      // implement IMS sales here...
      if (!validateBundleId(provider?.toLowerCase()))
        return res.status(400).json({ error: 'Invalid bundle reference' })

      // implement SOMALI LAND DATA here...
      if (provider === 'Somtel SL') {
        if (!senderMobile || senderMobile.toString().length !== 9)
          return res.status(400).json({ error: 'Invalid sender mobile number' })

        const key = senderMobile.toString().substring(0, 2)

        if (key !== '63')
          return res.status(400).json({
            error: 'Invalid sender mobile number or provider is not Telesom',
          })
      }

      if (provider?.toLowerCase() === 'somlink') {
        const data = await useSomLinkRecharge({
          msisdn: receiverMobile, // 252645104047
          offerid: checkBundle?.offerId, //20061
        })

        if (data?.status !== 'Success')
          return res.status(400).json({ error: data?.message })

        await InternetTransaction.create({
          business: business._id,
          provider: providerId,
          category: categoryId,
          bundle: bundleId,
        })
        return res.json({ message: 'success' })
      }

      const rechargeResponse = await rechargeData({
        sender: senderMobile,
        receiver: receiverMobile,
        amount: checkBundle.amount,
        branch: city,
      })

      if (rechargeResponse.resultCode !== 200) {
        return res.status(401).json({ error: `Internet recharge failed` })
      }

      await InternetTransaction.create({
        business: business._id,
        provider: providerId,
        category: categoryId,
        bundle: bundleId,
      })

      return res.json({ message: 'success' })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
