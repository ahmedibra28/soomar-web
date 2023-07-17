import nc from 'next-connect'
import db from '../../../../../../config/db'
import InternetProvider, {
  IInternetProvider,
} from '../../../../../../models/InternetProvider'

const handler = nc()
handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { id } = req.query

      let query = (await InternetProvider.findOne({ status: 'active', _id: id })
        .lean()
        .select(
          '-createdAt -updatedAt -__v -createdBy -updatedBy -status -branch'
        )) as IInternetProvider

      if (!query)
        return res.status(404).json({ error: 'Internet provider not found' })

      query = { ...query, image: `https://app.soomar.so${query?.image}` }

      res.status(200).json(query)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
