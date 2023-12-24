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
import { Markets } from '../../../../utils/Markets'

const handler = nc()
handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const {
        reference,
        senderMobile,
        receiverMobile,
        selectBundle: {
          _id: bundleId,
          internetCategory: {
            _id: categoryId,
            name: categoryName,
            internetProvider: { _id: providerId, name: provider },
          },
        },
      } = req.body
      const { apikey, city } = req.query as any
      const mode = req.query?.mode

      const checkCity = Markets.find(
        (item) =>
          item.internet && item.name?.toLowerCase() === city?.toLowerCase()
      )

      if (!checkCity) return res.status(400).json({ error: 'Invalid city' })

      if (
        !senderMobile ||
        !receiverMobile ||
        !bundleId ||
        !categoryId ||
        !categoryName ||
        !providerId ||
        !provider
      )
        return res.status(400).json({
          error: `[senderMobile, receiverMobile, bundleId, categoryId, categoryName, providerId, provider] are required`,
        })

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

      // ADSL PLUS validation
      if (categoryName === 'ADSL PLUS') {
        if (!receiverMobile)
          return res
            .status(400)
            .json({ error: 'Invalid receiver mobile number' })

        const numberLength = receiverMobile.toString().length
        const key = receiverMobile.toString().substring(0, 1)

        if (numberLength !== 7 && numberLength !== 6)
          return res
            .status(400)
            .json({ error: 'Invalid receiver mobile number' })

        if (numberLength === 7 && key !== '1')
          return res
            .status(400)
            .json({ error: 'Invalid receiver mobile number' })

        if (
          ProviderNumberValidation(senderMobile).validProviderName !== 'hormuud'
        )
          return res.status(400).json({
            error: 'Invalid sender mobile number or mismatch provider name',
          })
      }
      // END ADSL PLUS validation

      const providerReceiver =
        ProviderNumberValidation(receiverMobile).validReceiver
      if (categoryName !== 'ADSL PLUS' && !providerReceiver)
        return res.status(400).json({ error: 'Invalid receiver mobile number' })

      const providerName =
        ProviderNumberValidation(receiverMobile).validProviderName

      if (
        categoryName !== 'ADSL PLUS' &&
        (!providerName ||
          providerName?.toString()?.toLowerCase() !==
            provider.toLowerCase()?.replaceAll(' ', ''))
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

      if (reference) {
        const checkReferenceExistence = await InternetTransaction.findOne({
          reference,
        })
        if (checkReferenceExistence) {
          return res.status(400).json({ error: 'Reference already exists' })
        }
      }

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

      const isDT = business.name === 'DT One'

      const checkBalance = await Business.findOne({
        _id: business._id,
        balance: { $gte: isDT ? checkBundle.quantity : checkBundle.amount },
      })

      if (!checkBalance && isDT)
        return res.status(400).json({ error: 'Insufficient balance' })

      if (mode === 'development') {
        return res.json({
          business: business._id,
          provider: providerId,
          category: categoryId,
          bundle: bundleId,
          senderMobile,
          receiverMobile,
          reference,
          message: 'success',
        })
      }

      if (provider?.toLowerCase() === 'somlink') {
        const data = await useSomLinkRecharge({
          msisdn: receiverMobile, // 252645104047
          offerid: checkBundle?.offerId, //20061
        })

        if (data?.status !== 'Success')
          return res.status(400).json({ error: data?.message })

        await Business.updateOne(
          { _id: business._id },
          {
            $inc: {
              balance: isDT ? -checkBundle.quantity : -checkBundle.amount,
            },
          }
        )

        const result = await InternetTransaction.create({
          business: business._id,
          provider: providerId,
          category: categoryId,
          bundle: bundleId,
          amount: checkBundle.amount,
          quantity: checkBundle.quantity,
          senderMobile,
          receiverMobile,
          reference,
        })

        const parseResult = JSON.parse(JSON.stringify(result))
        delete parseResult.__v

        return res.json({
          message: 'success',
          ...parseResult,
        })
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

      await Business.updateOne(
        { _id: business._id },
        {
          $inc: {
            balance: isDT ? -checkBundle.quantity : -checkBundle.amount,
          },
        }
      )

      const result = await InternetTransaction.create({
        business: business._id,
        provider: providerId,
        category: categoryId,
        bundle: bundleId,
        amount: checkBundle.amount,
        quantity: checkBundle.quantity,
        senderMobile,
        receiverMobile,
        reference,
      })

      const parseResult = JSON.parse(JSON.stringify(result))
      delete parseResult.__v

      return res.json({
        message: 'success',
        ...parseResult,
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
