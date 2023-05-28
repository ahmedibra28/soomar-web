import nc from 'next-connect'
import db from '../../../../config/db'
import Profile from '../../../../models/Profile'
import User from '../../../../models/User'
import UserRole from '../../../../models/UserRole'
import { Markets } from '../../../../utils/Markets'
import { getToken, sendSMS } from '../../../../utils/SMS'
import { ProviderNumberValidation } from '../../../../utils/ProviderNumber'

const handler = nc()

handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { market, mobile } = req.body

      const provider = ProviderNumberValidation(mobile).validRegistration
      if (!provider)
        return res.status(400).json({ error: 'Invalid mobile number' })

      if (market && !Markets.includes(market))
        return res.status(400).json({ error: 'Invalid market' })

      const email = `${mobile}@soomar.app`
      const confirmed = true
      const blocked = false

      const object = await User.create({
        name: mobile,
        email,
        mobile,
        confirmed,
        blocked,
      })

      object.getRandomOtp()
      const otpGenerate = await object.save()
      if (!otpGenerate) {
        await object.remove()
        return res.status(400).json({ error: 'OTP not generated' })
      }

      await Profile.create({
        user: object._id,
        name: object.name,
        image: `https://ui-avatars.com/api/?uppercase=true&name=${object.name}&background=random&color=random&size=128`,
        mobile,
        market,
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
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
