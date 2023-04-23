import nc from 'next-connect'
import db from '../../../../config/db'
import { isAuth } from '../../../../utils/auth'
import axios from 'axios'

const handler = nc()

handler.use(isAuth)

handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { page, limit, q } = req.query

      const products = await axios.get(
        `${process.env.API_URL}/inventories?page=${page}&limit=${limit}&q=${q}`
      )

      res.status(200).json(products)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
