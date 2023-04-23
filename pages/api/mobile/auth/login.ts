import nc from 'next-connect'
import db from '../../../../config/db'
import User from '../../../../models/User'
import UserRole from '../../../../models/UserRole'

const handler = nc()

handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    try {
      await db()

      const { mobile } = req.body

      const user = await User.findOne({ mobile })

      if (!user) return res.status(404).json({ error: 'User not found' })

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

      return res.json(user)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
