import nc from 'next-connect'
import db from '../../../../config/db'
import Profile from '../../../../models/Profile'
import { isAuth } from '../../../../utils/auth'
import User from '../../../../models/User'
import { Markets } from '../../../../utils/Markets'
import { ProviderNumberValidation } from '../../../../utils/ProviderNumber'
import { encryptPassword } from '../../../../utils/encryptPassword'

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
      const { name, points, settings, address, password, mobile } = req.body

      const platform = req.headers['platform'] || 'soomar'

      // @ts-ignore
      const market = req.body?.market || req.query?.market

      const profile = await Profile.findOne({ user: req.user._id })

      if (!profile) return res.status(404).json({ error: 'Profile not found' })

      const checkMarket = Markets.find(
        (item) =>
          item.product &&
          item.name?.toLowerCase() === market?.split(' ')?.[0]?.toLowerCase()
      )

      if (market && !checkMarket)
        return res.status(400).json({ error: 'Invalid market' })

      const provider = ProviderNumberValidation(mobile).validOTP
      if (!provider)
        return res.status(400).json({ error: 'Invalid mobile number' })

      const exist = await User.findOne({
        mobile,
        platform,
        _id: { $ne: req.user._id },
      })

      if (exist)
        return res.status(400).json({ error: 'Duplicate mobile detected' })

      await User.updateOne(
        { _id: req.user._id },
        { mobile, platform, name, email: req.user.email }
      )

      if (password) {
        await User.updateOne(
          { _id: req.user._id },
          { password: await encryptPassword(password) }
        )
      }

      profile.name = name || profile.name
      profile.market = market || profile.market
      profile.points = points || profile.points
      profile.address = address || profile.address
      profile.mobile = mobile || profile.mobile
      profile.settings = {
        pushToken: settings?.pushToken || profile.settings?.pushToken,
      }

      await profile.save()

      const user = await User.findById(req.user._id)

      const newProfile = JSON.parse(JSON.stringify(profile))
      newProfile.dealerCode = user.dealerCode

      res.status(200).json(newProfile)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
