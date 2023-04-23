import nc from 'next-connect'
import db from '../../../../config/db'
import Profile from '../../../../models/Profile'
import { isAuth } from '../../../../utils/auth'

const handler = nc()

handler.use(isAuth)

handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const profile = await Profile.findOne({ user: req.user._id })

      res.status(200).json(profile)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { name, address, points } = req.body

      const profile = await Profile.findOne({ user: req.user._id })

      if (!profile) return res.status(404).json({ msg: 'Profile not found' })

      profile.name = name || profile.name
      profile.address = address || profile.address
      profile.points = points || profile.points

      await profile.save()

      res.status(200).json(profile)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
