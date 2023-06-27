import nc from 'next-connect'
import { addressPricing } from '../../../../utils/addressPricing'

const handler = nc()

handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    try {
      // @ts-ignore
      const address = req.query?.address || 'Mogadishu'

      const getAddresses = addressPricing?.find(
        (item) => item.name === address
      )?.districts

      if (!getAddresses) {
        return res.status(404).json({ error: 'Address not found' })
      }

      res.status(200).json(getAddresses)
    } catch (error: any) {
      res.status(500).json({ error: error?.message })
    }
  }
)

export default handler
