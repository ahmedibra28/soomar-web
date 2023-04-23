import nc from 'next-connect'
import db from '../../../../config/db'
import Profile from '../../../../models/Profile'
import User from '../../../../models/User'
import UserRole from '../../../../models/UserRole'

const handler = nc()

handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { name } = req.body

      let mobile = req.body.mobile

      if (mobile.length !== 9) {
        if (mobile.startsWith('0')) {
          mobile = mobile.slice(1)
        } else if (mobile.startsWith('252')) {
          mobile = mobile.slice(3)
        } else {
          mobile = mobile.slice(0, 9)
        }
      }

      if (mobile.length !== 9)
        return res.status(400).json({ error: 'Invalid mobile number' })

      const email = `${mobile}@soomar.app`
      const confirmed = true
      const blocked = false

      //   return res.status(200).json({ mobile })

      const object = await User.create({
        name,
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
      })

      await UserRole.create({
        user: object._id,
        role: '5e0af1c63b6482125c1b44ce', // Agent role
      })

      res.status(200).json(object)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
