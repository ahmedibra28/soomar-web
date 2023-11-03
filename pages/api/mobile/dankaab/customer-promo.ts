import nc from 'next-connect'
import db from '../../../../config/db'
import User from '../../../../models/User'
import { isAuth } from '../../../../utils/auth'

const handler = nc()

handler.use(isAuth)
handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    try {
      await db()

      const { promo } = req.body

      const dealerCodeObj = await User.findOne({
        dealerCode: promo?.toUpperCase(),
        platform: 'dankaab',
      })

      if (!dealerCodeObj) {
        return res.status(400).json({ error: 'Invalid promo code' })
      }

      await User.findOneAndUpdate(
        { _id: req.user._id },
        {
          dealerCode: promo?.toUpperCase(),
        }
      )

      return res.status(200).json({
        message: 'Promo code applied successfully',
        dealerCode: dealerCodeObj.dealerCode,
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
