import nc from 'next-connect'
import db from '../../../../config/db'
import Profile from '../../../../models/Profile'
import { isAuth } from '../../../../utils/auth'
import UserRole from '../../../../models/UserRole'

const handler = nc()

handler.use(isAuth)

handler.put(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { id } = req.query

      const profile = await Profile.findOne({ user: id })

      if (!profile) {
        return res.status(404).json({
          error: 'You are not a customer or you do not have a profile',
        })
      }

      const userRole = await UserRole.findOneAndUpdate(
        {
          user: id,
        },
        { $set: { role: '5e0af1c63b6482125c1b44ce' } } // Agent role
      )

      if (!userRole)
        return res.status(404).json({ error: 'User role did not upgraded' })

      const roleObj = await UserRole.findOne({ user: id }).lean().populate({
        path: 'role',
        select: 'type',
      })

      return res.send({
        points: profile.points,
        // @ts-ignore
        role: roleObj.role.type,
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
