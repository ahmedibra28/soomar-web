import nc from 'next-connect'
import db from '../../../../config/db'
import { isAuth } from '../../../../utils/auth'
// @ts-ignore
import Profile from '../../../../models/Profile'
import { useEVCPayment } from '../../../../hooks/useEVCPayment'
import { ProviderNumberValidation } from '../../../../utils/ProviderNumber'
import DealerTransaction from '../../../../models/DealerTransaction'

const handler = nc()

handler.use(isAuth)

handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()

    try {
      const { _id } = req.user
      const { amount } = req.body

      const profile = await Profile.findOne({
        user: _id,
        points: { $gte: Number(amount) },
      })

      if (!profile)
        return res.status(400).json({ error: 'Insufficient balance' })

      const { DANKAAB_MERCHANT_U_ID, DANKAAB_API_USER_ID, DANKAAB_API_KEY } =
        process.env

      const provider = ProviderNumberValidation(profile.mobile).validEVCReceiver
      if (!provider)
        return res
          .status(400)
          .json({ error: 'Invalid payment receiver mobile number' })

      const paymentInfo = await useEVCPayment({
        merchantUId: DANKAAB_MERCHANT_U_ID,
        apiUserId: DANKAAB_API_USER_ID,
        apiKey: DANKAAB_API_KEY,
        customerMobileNumber: `252${profile.mobile}`,
        description: `Dealer ${req.user.name} has got ${amount} for profit withdraw`,
        amount: amount,
        withdrawTo: 'TEL',
        withdrawNumber: `252${profile.mobile}`,
      })

      if (paymentInfo.responseCode !== '2001')
        return res.status(401).json({ error: `Payment failed` })

      const updatedProfile = await Profile.findOneAndUpdate(
        { user: _id },
        {
          $inc: { points: -amount },
        }
      )
      await DealerTransaction.create({
        amount: amount,
        type: 'WITHDRAWAL',
        user: req.user._id,
      })

      return res
        .status(200)
        .json({ message: 'Payment success', points: updatedProfile?.points })
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.response?.data?.error || error?.message })
    }
  }
)

export default handler
