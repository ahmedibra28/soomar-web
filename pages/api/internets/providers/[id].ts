import nc from 'next-connect'
import db from '../../../../config/db'
import InternetProvider from '../../../../models/InternetProvider'
import { isAuth } from '../../../../utils/auth'

const handler = nc()

handler.use(isAuth)
handler.put(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { id } = req.query
      const { name, image, status, branch } = req.body

      const branches = ['Mogadishu', 'Kismayo', 'Hargeisa', 'Baidoa']
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
