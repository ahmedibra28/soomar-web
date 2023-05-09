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

handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()

    try {
      let { branch } = req.query
      branch = branch.split(' ')[0]
      const deliveryAddress = req.body.deliveryAddress
      req.body = {
        products: req.body.cartItems?.map((item: any) => ({
          _id: item._id,
          warehouse: item.warehouse,
          product: {
            _id: item.product._id,
            sku: item.product.sku,
            name: item.product.name,
          },
          cost: item.cost,
          price: item.price,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          weight: item.weight,
          name: item.product.name,
          currentQuantity: item.newQuantity,
          discount: item.discount || 0,
        })),
        warehouse: req.body.cartItems[0].warehouse,
        extra: false,
        customer: req.body.customer,
        payInFull: true,
        account: req.body.account,
        reference: '',
        description: '',
      }

      const url = `${process.env.API_URL}/mobile/orders?branch=${branch}`

      const { data } = await axios.post(url, req.body, config())

      res.status(200).json(data)
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.response?.data?.error || error?.message })
    }
  }
)

export default handler
