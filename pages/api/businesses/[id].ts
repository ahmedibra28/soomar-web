import nc from 'next-connect'
import db from '../../../config/db'
import Business from '../../../models/Business'
import { isAuth } from '../../../utils/auth'

const handler = nc()

handler.use(isAuth)
handler.put(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { id } = req.query
      const { name, status, address, mobile, balance } = req.body

      const object = await Business.findById(id)
      if (!object) return res.status(400).json({ error: `Business not found` })

      const exist = await Business.findOne({
        name: { $regex: `^${name?.trim()}$`, $options: 'i' },
        _id: { $ne: id },
      })

      if (exist)
        return res.status(400).json({ error: 'Duplicate business detected' })

      object.status = status
      object.name = name
      object.mobile = mobile
      object.address = address
      object.balance = balance
      object.updatedBy = req.user._id
      await object.save()
      res.status(200).json({ message: `Business updated` })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

handler.delete(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { id } = req.query
      const object = await Business.findById(id)
      if (!object) return res.status(400).json({ error: `Business not found` })

      object.status = 'deleted'
      object.updatedBy = req.user._id
      await object.save()

      res.status(200).json({ message: `Business removed` })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
