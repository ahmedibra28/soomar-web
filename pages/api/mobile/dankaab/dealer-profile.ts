import nc from 'next-connect'
import db from '../../../../config/db'
import myProduct from '../../../../models/myProduct'
import Profile from '../../../../models/Profile'

const handler = nc()

handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { dealerCode } = req.query
      if (!dealerCode)
        return res.status(400).json({ error: 'Invalid dealer code' })

      const dealer = await myProduct.findOne({
        dealerCode: dealerCode?.toUpperCase(),
      })
      if (!dealer) return res.status(400).json({ error: 'Dealer not found' })

      const profile = await Profile.findOne(
        { user: dealer.dealer },
        { image: 1, name: 1, mobile: 1 }
      )

      if (!profile) return res.status(400).json({ error: 'Profile not found' })

      return res.status(200).json(profile)
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.response?.data?.error || error?.message })
    }
  }
)

export default handler
