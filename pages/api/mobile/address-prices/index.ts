import nc from 'next-connect'
import { getAddresses } from '../../../../utils/cities'

const handler = nc()

handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    try {
      // @ts-ignore
      const addresses = getAddresses(req.query?.address || 'Mogadishu') as any

      res.status(200).json(addresses)
    } catch (error: any) {
      res.status(500).json({ error: error?.message })
    }
  }
)

export default handler
