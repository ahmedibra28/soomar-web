import nc from 'next-connect'
import db from '../../../../config/db'
import User from '../../../../models/User'
import UserRole from '../../../../models/UserRole'
import Profile from '../../../../models/Profile'
import { Markets } from '../../../../utils/Markets'
import { getToken, sendSMS } from '../../../../utils/SMS'
import { ProviderNumberValidation } from '../../../../utils/ProviderNumber'

const handler = nc()

handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    try {
      await db()

      const { market } = req.body

      let mobile = req.body?.mobile

      if (mobile?.length === 12 && mobile?.startsWith('252')) {
        mobile = mobile?.slice(3)
      }
      if (mobile?.length === 10 && mobile?.startsWith('0')) {
        mobile = mobile?.slice(1)
      }

      const checkMarket = Markets.find(
        (item) =>
          item.product &&
          item.name?.toLowerCase() === market?.split(' ')?.[0]?.toLowerCase()
      )

      if (!checkMarket) return res.status(400).json({ error: 'Invalid market' })

      const provider = ProviderNumberValidation(mobile).validOTP
      if (!provider)
        return res.status(400).json({ error: 'Invalid mobile number' })

      const user = await User.findOne({ mobile, platform: 'soomar' })

      // Register user if not found
      if (!user) {
        const email = `${mobile}@soomar.app`
        const confirmed = true
        const blocked = false

        const object = await User.create({
          name: mobile,
          email,
          mobile,
          confirmed,
          blocked,
          isReal: false,
          platform: 'soomar',
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
          market: req.body.market,
        })

        await UserRole.create({
          user: object._id,
          role: '5e0af1c63b6482125c1b44cc', // Customer role
        })

        const token = await getToken()
        const sms = await sendSMS({
          token: token.access_token,
          mobile,
          message: `Your OTP is ${object.otp}`,
        })

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

      await Profile.findOneAndUpdate(
        { user: user._id },
        {
          market: req.body.market,
        }
      )

      user.getRandomOtp()
      const otpGenerate = await user.save()
      if (!otpGenerate)
        return res.status(400).json({ error: 'OTP not generated' })

      const token = await getToken()
      const sms = await sendSMS({
        token: token.access_token,
        mobile,
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
