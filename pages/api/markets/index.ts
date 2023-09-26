import nc from 'next-connect'
import { Markets } from '../../../utils/Markets'

const handler = nc()
handler.get(async (_, res: NextApiResponseExtended) => {
  try {
    res.status(200).json(Markets)
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default handler
