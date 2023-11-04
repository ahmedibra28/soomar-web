import nc from 'next-connect'
import db from '../../../../config/db'
import Bundle from '../../../../models/Bundle'
import { isAuth } from '../../../../utils/auth'

const handler = nc()

handler.use(isAuth)
handler.put(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { id } = req.query
      const {
        internetCategory,
        quantity,
        amount,
        label,
        description,
        status,
        offerId,
        points,
      } = req.body

      const object = await Bundle.findById(id)
      if (!object) return res.status(400).json({ error: `Bundle not found` })

      const exist = await Bundle.findOne({
        label: { $regex: `^${label?.trim()}$`, $options: 'i' },
        internetCategory,
        amount,
        _id: { $ne: id },
      })

      if (exist)
        return res
          .status(400)
          .json({ error: 'Duplicate internet category detected' })

      object.internetCategory = internetCategory
      object.quantity = quantity
      object.amount = amount
      object.label = label
      object.description = description
      object.status = status
      object.offerId = offerId
      object.updatedBy = req.user._id
      object.points = points
      await object.save()
      res.status(200).json({ message: `Bundle updated` })
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
      const object = await Bundle.findById(id)
      if (!object) return res.status(400).json({ error: `Bundle not found` })

      object.status = 'deleted'
      object.updatedBy = req.user._id
      await object.save()

      res.status(200).json({ message: `Bundle removed` })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
