import nc from 'next-connect'
import db from '../../../../config/db'
import myProduct from '../../../../models/myProduct'
import User from '../../../../models/User'

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

      const user = await User.findOne(
        { _id: dealer.dealer },
        { dealerBanner: 1, name: 1, mobile: 1, dealerCode: 1 }
      )

      if (!user) return res.status(400).json({ error: 'Dealer not found' })

      return res.status(200).json(user)
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.response?.data?.error || error?.message })
    }
  }
)

export default handler
