import nc from 'next-connect'
import db from '../../../../config/db'
import { isAuth } from '../../../../utils/auth'
import axios from 'axios'

const handler = nc()

handler.use(isAuth)

const config = () => {
  return {
    headers: {
      'x-db-key': 4812,
    },
  }
}

handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()

    try {
      const { page, limit, q } = req.query

      const url = `${process.env.API_URL}/mobile/categories?page=${page}&limit=${limit}&q=${q}`

      const { data } = await axios.get(url, config())

      const filter = data?.data?.map((item: any) => ({
        _id: item._id,
        name: item.name,
        image: item.image,
      }))

      res.status(200).json({ ...data, data: filter })
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.response?.data?.error || error?.message })
    }
  }
)

export default handler
