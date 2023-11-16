import nc from 'next-connect'
import db from '../../../config/db'
import Business from '../../../models/Business'

const handler = nc()

handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { apikey } = req.query

      const business = await Business.findOne({
        apiKey: apikey,
        status: 'active',
      }).select('balance')

      if (!business)
        return res
          .status(400)
          .json({ error: 'Invalid business apikey or business is not active' })

      res.status(200).json(business)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
