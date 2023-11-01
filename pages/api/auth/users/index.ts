import nc from 'next-connect'
import db from '../../../../config/db'
import Profile from '../../../../models/Profile'
import User from '../../../../models/User'
import { isAuth } from '../../../../utils/auth'
import Role from '../../../../models/Role'
import UserRole from '../../../../models/UserRole'
import { ProviderNumberValidation } from '../../../../utils/ProviderNumber'
import { encryptPassword } from '../../../../utils/encryptPassword'

const schemaName = User

const handler = nc()
handler.use(isAuth)
handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const q = req.query && req.query.q

      let query = schemaName.find(
        q ? { email: { $regex: q, $options: 'i' } } : {}
      )

      const page = parseInt(req.query.page as string) || 1
      const pageSize = parseInt(req.query.limit as string) || 25
      const skip = (page - 1) * pageSize
      const total = await schemaName.countDocuments(
        q ? { email: { $regex: q, $options: 'i' } } : {}
      )

      const pages = Math.ceil(total / pageSize)

      query = query
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: -1 })
        .select('-password')
        .lean()

      let result = await query

      result = await Promise.all(
        result.map(async (user) => {
          const role = await UserRole.findOne(
            { user: user._id },
            { role: 1 }
          ).populate('role', 'name')
          user.role = role?.role || null
          return user
        })
      )

      res.status(200).json({
        startIndex: skip + 1,
        endIndex: skip + result.length,
        count: result.length,
        page,
        pages,
        total,
        data: result,
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const provider = ProviderNumberValidation(req.body.mobile).validOTP
      if (!provider)
        return res.status(400).json({ error: 'Invalid mobile number' })

      const checkDuplicateMobile = await User.findOne({
        mobile: req.body.mobile,
        platform: req.body.platform,
      })
      if (checkDuplicateMobile)
        return res.status(400).json({ error: 'Mobile number already exists' })

      if (req.body?.platform === 'dankaab' && !req.body?.dealerCode)
        return res.status(400).json({ error: 'Dealer code is required' })

      if (req.body?.dealerCode) {
        const checkDealer = await Profile.findOne({
          dealerCode: req.body.dealerCode?.toUpperCase(),
        })
        if (checkDealer)
          return res.status(400).json({ error: 'Dealer code already exists' })
      }

      const object = await schemaName.create({
        ...req.body,
        password: await encryptPassword(req.body.password),
      })
      await Profile.create({
        user: object._id,
        name: object.name,
        image: `https://ui-avatars.com/api/?uppercase=true&name=${object.name}&background=random&color=random&size=128`,
      })

      res.status(200).send(object)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
