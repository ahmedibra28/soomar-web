import nc from 'next-connect'
import amtel from '../../utils/amtelRecharge'

const handler = nc()

handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    try {
      amtel()

      res.status(200).json({ status: 'success' })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
