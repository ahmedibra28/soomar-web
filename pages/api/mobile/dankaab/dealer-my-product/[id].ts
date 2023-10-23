import nc from 'next-connect'
import db from '../../../../../config/db'
import { isAuth } from '../../../../../utils/auth'
import myProduct from '../../../../../models/myProduct'

const handler = nc()

handler.use(isAuth)

handler.delete(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()

    try {
      const { id } = req.query
      const platform = req.headers['platform']

      if (platform !== 'dankaab')
        return res.status(400).json({ error: 'Invalid platform' })

      await myProduct.deleteOne({
        ...(id?.length === 21 ? { product: id } : { _id: id }),
      })

      return res.status(200).json({ message: 'Item removed successfully' })
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.response?.data?.error || error?.message })
    }
  }
)
export default handler
