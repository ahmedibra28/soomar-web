import nc from 'next-connect'
import db from '../../../../config/db'
import User from '../../../../models/User'
import { getToken, sendSMS } from '../../../../utils/SMS'

const handler = nc()

handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    try {
      await db()

      const { _id } = req.body

      const user = await User.findOne({ _id })

      if (!user) return res.status(404).json({ error: 'User not found' })

      if (user.blocked)
        return res.status(401).send({ error: 'User is blocked' })

      if (!user.confirmed)
        return res.status(401).send({ error: 'User is not confirmed' })

      if (user.otp?.length !== 4) {
        user.getRandomOtp()
        const otpGenerate = await user.save()
        if (!otpGenerate)
          return res.status(400).json({ error: 'OTP not generated' })

        const token = await getToken()
        const sms = await sendSMS({
          token: token.access_token,
          mobile: user.mobile,
          message: `Your OTP is ${user.otp}`,
        })

        if (sms) return res.status(200).json({ _id: user?._id, otp: user?.otp })
      }

      if (new Date(user.otpExpire) < new Date()) {
        user.getRandomOtp()
        const otpGenerate = await user.save()
        if (!otpGenerate)
          return res.status(400).json({ error: 'OTP not generated' })

        const token = await getToken()
        const sms = await sendSMS({
          token: token.access_token,
          mobile: user.mobile,
          message: `Your OTP is ${user.otp}`,
        })

        if (sms) return res.status(200).json({ _id: user?._id, otp: user?.otp })
      }

      const token = await getToken()
      const sms = await sendSMS({
        token: token.access_token,
        mobile: user.mobile,
        message: `Your OTP is ${user.otp}`,
      })

      if (sms) return res.status(200).json({ _id: user?._id, otp: user?.otp })

      return res
        .status(500)
        .json({ error: 'Something went wrong, please try again' })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
