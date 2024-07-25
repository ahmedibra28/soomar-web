import nc from 'next-connect'
import db from '../../../../config/db'
import User from '../../../../models/User'
import { getToken, sendSMS } from '../../../../utils/SMS'

const handler = nc()

handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    const { mobile } = req.body

    try {
      const user = await User.findOne({ mobile })

      if (!user) return res.status(404).json({ error: 'Account not found' })

      if (user.isDeleted)
        return res
          .status(400)
          .json({ error: 'Account already deleted or is in deleting process' })

      user.getRandomOtp()
      const otpGenerate = await user.save()
      if (!otpGenerate) {
        return res.status(400).json({ error: 'OTP not generated' })
      }

      if (user.otp?.length !== 4) {
        user.getRandomOtp()
        const otpGenerate = await user.save()
        if (!otpGenerate) {
          return res.status(400).json({ error: 'OTP not generated' })
        }
      }

      const token = await getToken()
      const sms = await sendSMS({
        token: token.access_token,
        mobile,
        message: `Your OTP is ${user.otp}`,
      })

      if (!sms) {
        return res
          .status(500)
          .json({ error: 'Something went wrong, please try again' })
      }

      return res.status(200).json({ _id: user?._id })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
