import nc from 'next-connect'
import db from '../../../../config/db'
import { isAuth } from '../../../../utils/auth'
import { ProviderNumberValidation } from '../../../../utils/ProviderNumber'
import { useEVCPayment } from '../../../../hooks/useEVCPayment'
import InternetProvider from '../../../../models/InternetProvider'
import InternetCategory from '../../../../models/InternetCategory'
import Bundle from '../../../../models/Bundle'
import Payment from '../../../../models/Payment'
import { rechargeData } from '../../../../utils/InternetRecharge'
import InternetTransaction from '../../../../models/InternetTransaction'
import { useSomLinkRecharge } from '../../../../hooks/useSomLinkRecharge'

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
            name: categoryName,
            internetProvider: { _id: providerId, name: provider },
          },
        },
      } = req.body
      let { branch } = req.query
      branch = branch?.split(' ')[0]

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
      if (branch === 'Hargeisa' && provider === 'Somtel SL') {
        if (!senderMobile || senderMobile.toString().length !== 9)
          return res.status(400).json({ error: 'Invalid sender mobile number' })

        const key = senderMobile.toString().substring(0, 2)

        if (key !== '63')
          return res.status(400).json({
            error: 'Invalid sender mobile number or provider is not Telesom',
          })
      }

      // Payment Implementation
      const {
        MERCHANT_U_ID,
        API_USER_ID,
        API_KEY,
        DATA_MERCHANT_ACCOUNT_NO,
        SL_MERCHANT_U_ID,
        SL_API_USER_ID,
        SL_API_KEY,
        SL_MERCHANT_ACCOUNT_NO,
      } = process.env

      const paymentInfo = await useEVCPayment({
        merchantUId:
          branch === 'Hargeisa' && provider === 'Somtel SL'
            ? SL_MERCHANT_U_ID
            : MERCHANT_U_ID,
        apiUserId:
          branch === 'Hargeisa' && provider === 'Somtel SL'
            ? SL_API_USER_ID
            : API_USER_ID,
        apiKey:
          branch === 'Hargeisa' && provider === 'Somtel SL'
            ? SL_API_KEY
            : API_KEY,
        customerMobileNumber: `252${senderMobile}`,
        description: `${req.user.name} has paid ${checkBundle.amount?.toFixed(
          2
        )} for ${provider} internet data`,
        amount: checkBundle.amount,
        withdrawTo: 'MERCHANT',
        withdrawNumber:
          branch === 'Hargeisa' && provider === 'Somtel SL'
            ? SL_MERCHANT_ACCOUNT_NO
            : DATA_MERCHANT_ACCOUNT_NO,
        currency:
          branch === 'Hargeisa' && provider === 'Somtel SL' ? 'SLSH' : 'USD',
      })

      if (paymentInfo.responseCode !== '2001')
        return res.status(401).json({ error: `Payment failed` })

      const payment = await Payment.create({
        user: req.user._id,
        transaction: 'INTERNET',
        amount: checkBundle.amount,
        currency:
          branch === 'Hargeisa' && provider === 'Somtel SL' ? 'SLSH' : 'USD',
        status: { stepOne: 'success', stepTwo: 'success' },
      })

      if (provider?.toLowerCase() === 'somlink') {
        const data = await useSomLinkRecharge({
          msisdn: receiverMobile, // 252645104047
          offerid: checkBundle?.offerId, //20061
        })

        if (data?.status !== 'Success')
          return res.status(400).json({ error: data?.message })

        await InternetTransaction.create({
          user: req.user._id,
          provider: providerId,
          category: categoryId,
          bundle: bundleId,
          senderMobile,
          receiverMobile,
        })
        return res.json('success')
      }

      const rechargeResponse = await rechargeData({
        sender: senderMobile,
        receiver: receiverMobile,
        amount: checkBundle.amount,
        branch,
      })

      if (rechargeResponse.resultCode !== 200) {
        payment.status.stepTwo = 'failed'
        await payment.save()
        return res.status(401).json({ error: `Internet recharge failed` })
      }

      await InternetTransaction.create({
        user: req.user._id,
        provider: providerId,
        category: categoryId,
        bundle: bundleId,
        senderMobile,
        receiverMobile,
      })

      return res.json('success')
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
