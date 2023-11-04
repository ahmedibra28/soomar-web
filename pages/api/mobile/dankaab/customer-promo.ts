import nc from 'next-connect'
import db from '../../../../config/db'
import User from '../../../../models/User'
import { isAuth } from '../../../../utils/auth'
import Profile from '../../../../models/Profile'

const handler = nc()

handler.use(isAuth)
handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    try {
      await db()

      const { promo } = req.body

      const dealerCodeObj = await User.findOne({
        dealerCode: `${promo}`.toUpperCase(),
        platform: 'dankaab',
      })

      if (!dealerCodeObj) {
        return res.status(400).json({ error: 'Invalid shop code' })
      }

      await User.findOneAndUpdate(
        { _id: req.user._id },
        {
          dealerCode: promo?.toUpperCase(),
        }
      )

      const profile = await Profile.findOne({ user: dealerCodeObj?._id })

      return res.status(200).json({
        message: 'Shop code applied successfully',
        dealerCode: dealerCodeObj.dealerCode,
        name: dealerCodeObj?.name,
        image: profile?.image,
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
