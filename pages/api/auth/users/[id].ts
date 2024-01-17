import nc from 'next-connect'
import db from '../../../../config/db'
import Profile from '../../../../models/Profile'
import User from '../../../../models/User'
import UserRole from '../../../../models/UserRole'
import { isAuth } from '../../../../utils/auth'
import { ProviderNumberValidation } from '../../../../utils/ProviderNumber'
import { encryptPassword } from '../../../../utils/encryptPassword'

const schemaName = User
const schemaNameString = 'User'

const handler = nc()
handler.use(isAuth)
handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { id } = req.query
      const objects = await schemaName
        .findById(id)
        .lean()
        .sort({ createdAt: -1 })
        .select('-password')

      if (!objects)
        return res.status(404).json({ error: `${schemaNameString} not found` })
      res.status(200).send(objects)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

handler.put(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { id } = req.query
      const {
        name,
        confirmed,
        blocked,
        password,
        email,
        platform,
        mobile,
        dealerBanner,
        productLimit,
        internetLimit,
      } = req.body

      const object = await schemaName.findById(id)
      if (!object)
        return res.status(400).json({ error: `${schemaNameString} not found` })

      const provider = ProviderNumberValidation(mobile).validOTP
      if (!provider)
        return res.status(400).json({ error: 'Invalid mobile number' })

      const checkDuplicateMobile = await User.findOne({
        mobile: req.body.mobile,
        platform: req.body.platform,
        _id: { $ne: id },
      })
      if (checkDuplicateMobile)
        return res.status(400).json({ error: 'Mobile number already exists' })

      object.name = name
      object.email = email
      object.confirmed = confirmed
      object.blocked = blocked
      object.platform = platform
      object.mobile = mobile
      object.dealerBanner = dealerBanner
      object.productLimit = productLimit
      object.internetLimit = internetLimit

      password && (object.password = await encryptPassword(password))

      if (name) {
        await Profile.findOneAndUpdate({ user: id }, { name })
      }

      await object.save()

      res.status(200).json({ message: `${schemaNameString} updated` })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

handler.delete(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { id } = req.query
      const object = await schemaName.findById(id)
      if (!object)
        return res.status(400).json({ error: `${schemaNameString} not found` })

      await Profile.findOneAndDelete({
        user: object._id,
      })

      await UserRole.findOneAndDelete({
        user: object._id,
      })

      await schemaName.findOneAndDelete({
        _id: id,
      })

      res.status(200).json({ message: `${schemaNameString} removed` })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
