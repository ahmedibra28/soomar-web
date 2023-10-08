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
      const { page, q, category, limit } = req.query

      let { branch } = req.query
      branch = branch.split(' ')[0]

      const url = `${process.env.API_URL}/mobile/inventories?page=${page}&limit=${limit}&q=${q}&category=${category}&branch=${branch}`

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

      const uniqueProducts = filter?.reduce(
        (accumulator: any, product: any) => {
          const existingProduct = accumulator.find(
            (item: any) =>
              item?.product?.name?.trim()?.toLowerCase() ===
              product.product?.name?.trim()?.toLowerCase()
          )

          if (!existingProduct) {
            accumulator.push(product)
          }

          if (existingProduct) {
            existingProduct.product?.image?.push(product?.product?.image)
          }

          return accumulator?.map((item: any) => ({
            ...item,
            product: { ...item?.product, image: item?.product?.image?.flat() },
          }))
        },
        []
      )

      filter = uniqueProducts?.map((item: any) => {
        delete item?.status
        return {
          ...item,
          product: {
            ...item?.product,
            // @ts-ignore
            image: [...new Set(item?.product?.image)],
          },
        }
      })

      res.status(200).json({ ...data, data: filter })
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.response?.data?.error || error?.message })
    }
  }
)

export default handler
