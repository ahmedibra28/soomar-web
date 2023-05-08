import nc from 'next-connect'
import db from '../../../../config/db'
import { isAuth } from '../../../../utils/auth'
import axios from 'axios'

const handler = nc()

// handler.use(isAuth)

const config = () => {
  return {
    headers: {
      'x-db-key': 3020,
    },
  }
}

handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()

    try {
      const { page, limit, q, category } = req.query

      let { branch } = req.query
      branch = branch.split(' ')[0]

      const url = `${process.env.API_URL}/mobile/inventories?page=${page}&limit=${limit}&q=${q}&category=${category}&branch=${branch}`

      const { data } = await axios.get(url, config())

      res.status(200).json(data)
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.response?.data?.error || error?.message })
    }
  }
)

export default handler
