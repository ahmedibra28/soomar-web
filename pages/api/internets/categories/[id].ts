import nc from 'next-connect'
import db from '../../../../config/db'
import InternetCategory from '../../../../models/InternetCategory'
import { isAuth } from '../../../../utils/auth'
import Bundle from '../../../../models/Bundle'

const handler = nc()

handler.use(isAuth)
handler.put(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { id } = req.query
      const { name, image, status, internetProvider } = req.body

      const object = await InternetCategory.findById(id)
      if (!object)
        return res.status(400).json({ error: `Internet category not found` })

      const exist = await InternetCategory.findOne({
        name: { $regex: `^${name?.trim()}$`, $options: 'i' },
        internetProvider,
        _id: { $ne: id },
      })

      if (exist)
        return res
          .status(400)
          .json({ error: 'Duplicate internet category detected' })

      object.name = name
      object.internetProvider = internetProvider
      object.image = image
      object.status = status
      object.updatedBy = req.user._id
      await object.save()
      res.status(200).json({ message: `Internet category updated` })
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
      const object = await InternetCategory.findById(id)
      if (!object)
        return res.status(400).json({ error: `Internet category not found` })

      const deleteBundles = await Bundle.updateMany(
        { internetCategory: id },
        { status: 'deleted' }
      )

      if (!deleteBundles)
        return res
          .status(400)
          .json({ error: `Internet category bundles not found` })

      object.status = 'deleted'
      object.updatedBy = req.user._id
      await object.save()

      res.status(200).json({ message: `Internet category removed` })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
