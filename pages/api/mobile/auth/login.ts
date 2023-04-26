import nc from 'next-connect'
import db from '../../../../config/db'
import User from '../../../../models/User'
import UserRole from '../../../../models/UserRole'
import Profile from '../../../../models/Profile'

const handler = nc()

handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    try {
      await db()

      let { mobile } = req.body

      const user = await User.findOne({ mobile })

      // Register user if not found
      if (!user) {
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
          market: req.body.market,
        })

        await UserRole.create({
          user: object._id,
          role: '5e0af1c63b6482125c1b44cc', // Customer role
        })

        return res.status(200).json({ _id: object._id })
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

      console.log(user)

      return res.status(200).json({ _id: user._id })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
