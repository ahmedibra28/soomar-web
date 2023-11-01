import nc from 'next-connect'
import db from '../../../../../config/db'
import User, { IUser } from '../../../../../models/User'
import myProduct from '../../../../../models/myProduct'
import { isAuth } from '../../../../../utils/auth'
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
      const { q, type } = req.query
      const platform = req.headers['platform']

      if (platform !== 'dankaab')
        return res.status(400).json({ error: 'Invalid platform' })

      const queryCondition = q
        ? {
            name: { $regex: q, $options: 'i' },
            dealer: req.user._id,
            ...(type === 'Internet'
              ? { internet: { $exists: true } }
              : { product: { $exists: true } }),
          }
        : {
            dealer: req.user._id,
            ...(type === 'Internet'
              ? { internet: { $exists: true } }
              : { product: { $exists: true } }),
          }

      let query = myProduct.find(queryCondition)

      const page = parseInt(req.query.page) || 1
      const pageSize = parseInt(req.query.limit) || 25
      const skip = (page - 1) * pageSize
      const total = await myProduct.countDocuments(queryCondition)

      const pages = Math.ceil(total / pageSize)

      query = query.skip(skip).limit(pageSize).sort({ createdAt: -1 }).lean()

      if (type === 'Internet') {
        query = query.populate('internet', ['name', 'image'])
      }

      let result = await query

      if (type === 'Internet') {
        result = result.map((provider) => ({
          ...provider,
          image: provider?.internet?.image,
        }))
      }

      if (type === 'Product') {
        const url = `${process.env.API_URL}/mobile/inventories/bulk?branch=Mogadishu`
        const ids = result.map((item) => item.product)

        const { data } = await axios.post(url, { ids }, config())

        let filter = data?.map((item: any) => ({
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
              product: {
                ...item?.product,
                image: item?.product?.image?.flat(),
              },
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

        return res.status(200).json({
          startIndex: skip + 1,
          endIndex: skip + result.length,
          count: result.length,
          page,
          pages,
          total,
          data: filter,
        })
      }

      res.status(200).json({
        startIndex: skip + 1,
        endIndex: skip + result.length,
        count: result.length,
        page,
        pages,
        total,
        data: result,
      })
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.response?.data?.error || error?.message })
    }
  }
)

handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    try {
      await db()

      const { type, product, internet } = req.body
      const platform = req.headers['platform']

      if (platform !== 'dankaab')
        return res.status(400).json({ error: 'Invalid platform' })

      if (!['Internet', 'Product'].includes(type))
        return res.status(400).json({ error: 'Invalid type' })

      const user = (await User.findOne({
        _id: req.user._id,
        dealerCode: { $exists: true },
      }).lean()) as IUser
      if (!user) return res.status(400).json({ error: 'User not found' })

      if (type === 'Internet') {
        const object = await myProduct.findOneAndUpdate(
          { internet },
          {
            internet,
            dealer: user._id,
            dealerCode: user.dealerCode?.toUpperCase(),
          },
          { upsert: true, new: true }
        )

        if (!object)
          return res.status(400).json({ error: 'Internet not found' })
        return res.status(200).json({ message: 'Internet updated' })
      }
      if (type === 'Product') {
        const object = await myProduct.findOneAndUpdate(
          { product },
          {
            product,
            dealer: user._id,
            dealerCode: user.dealerCode?.toUpperCase(),
          },
          { upsert: true, new: true }
        )

        if (!object) return res.status(400).json({ error: 'Product not found' })
        return res.status(200).json({ message: 'Product updated' })
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
