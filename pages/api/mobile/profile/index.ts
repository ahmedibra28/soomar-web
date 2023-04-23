import nc from 'next-connect'
import db from '../../../../config/db'
import Profile from '../../../../models/Profile'

const handler = nc()

handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { name } = req.body

      res.status(200).json('')
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
