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

      const email = req.body.email?.toLowerCase()
      const password = req.body.password

      const user = await User.findOne({ email, platform: 'dankaab' })

      if (user && (await user.matchPassword(password))) {
        if (user.blocked)
          return res.status(401).send({ error: 'User is blocked' })

        if (!user.confirmed)
          return res.status(401).send({ error: 'User is not confirmed' })

        const roleObj = await UserRole.findOne({ user: user?._id })
          .lean()
          .sort({ createdAt: -1 })
          .populate({
            path: 'role',
            populate: {
              path: 'clientPermission',
              model: 'ClientPermission',
            },
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
          blocked: user.blocked,
          confirmed: user.confirmed,
          image: profile.image,
          market: profile.market,
          address: profile.address,
          points: profile.points,
          dealerCode: user.dealerCode,
          // @ts-ignore
          role: roleObj.role.type,
          token: generateToken(user._id),
        })
      } else {
        return res.status(401).send({ error: 'Invalid credentials' })
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
