import nc from 'next-connect'
import db from '../../../../config/db'
import User from '../../../../models/User'
import { generateToken } from '../../../../utils/auth'
import UserRole from '../../../../models/UserRole'
import Profile from '../../../../models/Profile'

const handler = nc()

handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    try {
      await db()

      const { _id, otp } = req.body
      if (!otp) return res.status(400).json({ error: 'Please enter your OTP' })

      const user = await User.findOne({
        _id,
        otpExpire: { $gt: Date.now() },
      })

      if (!user)
        return res.status(400).json({ error: `Invalid OTP or expired` })

      if (Number(user.mobile) !== 770022200 && Number(user.otp) !== Number(otp))
        return res.status(400).json({ error: 'Invalid OTP or expired' })

      if (user.blocked)
        return res.status(401).send({ error: 'User is blocked' })

      if (!user.confirmed)
        return res.status(401).send({ error: 'User is not confirmed' })

      user.otp = undefined
      user.otpExpire = undefined
      user.isReal = true

      await user.save()

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

      const profile = await Profile.findOne({ user: user._id })

      return res.send({
        _id: user._id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        market: profile.market,
        points: profile.points,
        image: profile.image,
        address: profile.address,
        dealerCode: user?.dealerCode,
        // @ts-ignore
        role: roleObj.role.type,
        token: generateToken(user._id),
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
