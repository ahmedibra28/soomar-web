import nc from 'next-connect'
import db from '../../../../config/db'
import Version from '../../../../models/Version'

const handler = nc()

handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    try {
      await db()
      const version = await Version.findOne({}).sort({ createdAt: -1 })
      res.status(200).json(version)
    } catch (error: any) {
      res.status(500).json({ error: error?.message })
    }
  }
)

export default handler
