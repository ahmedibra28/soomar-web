import nc from 'next-connect'
import db from '../../../../config/db'
import User from '../../../../models/User'
import UserRole from '../../../../models/UserRole'
import Profile from '../../../../models/Profile'
import { getToken, sendSMS } from '../../../../utils/SMS'
import { ProviderNumberValidation } from '../../../../utils/ProviderNumber'

const handler = nc()

handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    try {
      await db()

      const { mobile, name } = req.body

      const provider = ProviderNumberValidation(mobile).validOTP
      if (!provider)
        return res.status(400).json({ error: 'Invalid mobile number' })

      const user = await User.findOne({ mobile, platform: 'dankaab' })

      // Register user if not found
      if (!user) {
        const email = `${mobile}@dankaab.app`
        const confirmed = true
        const blocked = false

        const object = await User.create({
          name,
          email,
          mobile,
          confirmed,
          blocked,
          isReal: false,
          platform: 'dankaab',
        })

        object.getRandomOtp()
        const otpGenerate = await object.save()
        if (!otpGenerate) {
          await object.remove()
          return res.status(400).json({ error: 'OTP not generated' })
        }

        if (object.otp?.length !== 4) {
          object.getRandomOtp()
          const otpGenerate = await object.save()
          if (!otpGenerate) {
            await object.remove()
            return res.status(400).json({ error: 'OTP not generated' })
          }
        }

        await Profile.create({
          user: object._id,
          name: object.name,
          image: `https://ui-avatars.com/api/?uppercase=true&name=${object.name}&background=random&color=random&size=128`,
          mobile,
          market: 'Mogadishu Market',
        })

        await UserRole.create({
          user: object._id,
          role: '5e0af1c63b6482125c1b44cb', // Customer role
        })

        // const token = await getToken()
        // const sms = await sendSMS({
        //   token: token.access_token,
        //   mobile,
        //   message: `Dankaab Your OTP is ${object.otp}`,
        // })

        const sms = true

        if (sms)
          return res.status(200).json({ _id: object?._id, otp: object?.otp })

        return res
          .status(500)
          .json({ error: 'Something went wrong, please try again' })
      }

      if (user.blocked)
        return res.status(401).send({ error: 'User is blocked' })

      if (!user.confirmed)
        return res.status(401).send({ error: 'User is not confirmed' })

      const roleObj = await UserRole.findOne({ user: user?._id })
        .lean()
        .populate({
          path: 'role',
          select: 'type',
        })

      if (!roleObj)
        return res
          .status(404)
          .json({ error: 'This user does not have associated role' })

      user.getRandomOtp()
      const otpGenerate = await user.save()
      if (!otpGenerate)
        return res.status(400).json({ error: 'OTP not generated' })

      const token = await getToken()
      const sms = await sendSMS({
        token: token.access_token,
        mobile,
        message: `Dankaab Your OTP is ${user.otp}`,
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
