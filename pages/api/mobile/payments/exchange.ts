import nc from 'next-connect'
import db from '../../../../config/db'
import { isAuth } from '../../../../utils/auth'
// @ts-ignore
import Profile from '../../../../models/Profile'
import { useEVCPayment } from '../../../../hooks/useEVCPayment'

const handler = nc()

handler.use(isAuth)

handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()

    try {
      const { _id } = req.body

      const profile = await Profile.findOne({ user: _id })

      if (!profile) return res.status(400).json({ error: 'Profile not found' })
      if (profile.points <= 0)
        return res.status(400).json({ error: 'Insufficient points' })

      const { MERCHANT_U_ID, API_USER_ID, API_KEY } = process.env

      const paymentInfo = await useEVCPayment({
        merchantUId: MERCHANT_U_ID,
        apiUserId: API_USER_ID,
        apiKey: API_KEY,
        customerMobileNumber: `252${profile.mobile}`,
        description: `${req.user.name} has got ${
          profile.points * 0.01
        } for points exchange`,
        amount: profile.points * 0.01,
        withdrawTo: 'TEL',
        withdrawNumber: `252${profile.mobile}`,
      })

      if (paymentInfo.responseCode !== '2001')
        return res.status(401).json({ error: `Payment failed` })

      const updatedProfile = await Profile.findOneAndUpdate(
        { user: _id },
        {
          $inc: { points: -profile.points },
        }
      )

      return res.status(200).json(updatedProfile)
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.response?.data?.error || error?.message })
    }
  }
)

export default handler
