import nc from 'next-connect'
import db from '../../../../config/db'
import Profile from '../../../../models/Profile'
import { isAuth } from '../../../../utils/auth'
import User from '../../../../models/User'
import { Markets } from '../../../../utils/Markets'

const handler = nc()

handler.use(isAuth)

handler.get(
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
      const { name, points, settings } = req.body
      // @ts-ignore
      const market = req.body.market || req.query.market

      const profile = await Profile.findOne({ user: req.user._id })

      if (!profile) return res.status(404).json({ error: 'Profile not found' })

      const checkMarket = Markets.find(
        (item) =>
          item.product &&
          item.name?.toLowerCase() === market?.split(' ')?.[0]?.toLowerCase()
      )

      if (!checkMarket) return res.status(400).json({ error: 'Invalid market' })

      profile.name = name || profile.name
      profile.market = market || profile.market
      profile.points = points || profile.points
      profile.settings = {
        pushToken: settings?.pushToken || profile.settings?.pushToken,
      }

      await profile.save()

      await User.findByIdAndUpdate(req.user._id, { name: profile.name })

      res.status(200).json(profile)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
