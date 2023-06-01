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
      let { branch } = req.query
      branch = branch?.split(' ')[0]

      // console.log({
      //   senderMobile,
      //   receiverMobile,
      //   bundleId,
      //   categoryId,
      //   providerId,
      //   provider,
      //   branch,
      // })

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
      if (branch === 'Hargeisa' && provider === 'Somtel SL') {
        if (!senderMobile || senderMobile.toString().length !== 9)
          return res.status(400).json({ error: 'Invalid sender mobile number' })

        const key = senderMobile.toString().substring(0, 2)

        if (key !== '62')
          return res.status(400).json({
            error: 'Invalid sender mobile number or provider is not Telesom',
          })
      }

      // return res.status(406).json({ error: 'sorr' })

      // Payment Implementation
      const { MERCHANT_U_ID, API_USER_ID, API_KEY, MERCHANT_ACCOUNT_NO } =
        process.env

      const paymentInfo = await useEVCPayment({
        merchantUId: MERCHANT_U_ID,
        apiUserId: API_USER_ID,
        apiKey: API_KEY,
        customerMobileNumber: `252${senderMobile}`,
        description: `${req.user.name} has paid ${checkBundle.amount?.toFixed(
          2
        )} for ${provider} internet data`,
        amount: checkBundle.amount,
        withdrawTo: 'MERCHANT',
        withdrawNumber: MERCHANT_ACCOUNT_NO,
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
      })

      return res.json('success')
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
