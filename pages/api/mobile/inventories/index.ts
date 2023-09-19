import nc from 'next-connect'
import db from '../../../../config/db'
import { isAuth } from '../../../../utils/auth'
import axios from 'axios'

const handler = nc()

handler.use(isAuth)

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
      const { page, q, category } = req.query

      let { branch } = req.query
      branch = branch.split(' ')[0]

      const url = `${
        process.env.API_URL
      }/mobile/inventories?page=${page}&limit=${500}&q=${q}&category=${category}&branch=${branch}`

      const { data } = await axios.get(url, config())

      let filter = data?.data?.map((item: any) => ({
        ...item,
        _id: item.id,
        product: {
          ...item.product,
          image:
            data?.data
              ?.map(
                (pro: any) =>
                  pro?.productId === item?.productId && pro?.product?.images
              )
              ?.filter((item: any) => item)
              ?.flat() || [],
        },
      }))

      const mergedData: any = {}
      for (const item of filter) {
        if (mergedData[item.productId]) {
          mergedData[item.productId].quantity += item.quantity
        } else {
          mergedData[item.productId] = { ...item }
        }
      }

      filter = Object.values(mergedData)

      res.status(200).json({ ...data, data: filter })
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.response?.data?.error || error?.message })
    }
  }
)

export default handler
