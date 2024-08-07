import nc from 'next-connect'
import db from '../../../../config/db'
import InternetProvider from '../../../../models/InternetProvider'
import { isAuth } from '../../../../utils/auth'
import InternetCategory from '../../../../models/InternetCategory'
import Bundle from '../../../../models/Bundle'
import { Markets } from '../../../../utils/Markets'

const handler = nc()

handler.use(isAuth)
handler.put(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { id } = req.query
      const { name, image, status, branch } = req.body

      const branches = Markets.map((item) =>
        item.internet ? item.name : null
      ).filter((item) => item !== null)

      if (!branches.includes(branch))
        return res.status(400).json({ error: 'Invalid branch' })

      const object = await InternetProvider.findById(id)
      if (!object)
        return res.status(400).json({ error: `Internet provider not found` })

      const exist = await InternetProvider.findOne({
        name: { $regex: `^${name?.trim()}$`, $options: 'i' },
        branch,
        _id: { $ne: id },
      })

      if (exist)
        return res
          .status(400)
          .json({ error: 'Duplicate internet provider detected' })

      object.name = name
      if (image) {
        object.image = image
      }
      object.status = status
      object.branch = branch
      object.updatedBy = req.user._id
      await object.save()
      res.status(200).json({ message: `Internet provider updated` })
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
      const object = await InternetProvider.findById(id)
      if (!object)
        return res.status(400).json({ error: `Internet provider not found` })

      let cats = await InternetCategory.find({ internetProvider: id })
      if (!cats)
        return res.status(400).json({ error: `Internet categories not found` })
      cats = cats.map((cat) => cat._id)

      const deleteCategories = await InternetCategory.updateMany(
        { internetProvider: id },
        { status: 'deleted' }
      )
      if (!deleteCategories)
        return res.status(400).json({ error: `Internet categories not found` })

      const deleteBundles = await Bundle.updateMany(
        { internetCategory: { $in: cats } },
        { status: 'deleted' }
      )
      if (!deleteBundles)
        return res.status(400).json({ error: `Bundles not found` })

      object.status = 'deleted'
      object.updatedBy = req.user._id
      await object.save()

      res.status(200).json({ message: `Internet provider removed` })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
