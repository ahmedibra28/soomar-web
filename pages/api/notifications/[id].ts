import nc from 'next-connect'
import db from '../../../config/db'
import Notification from '../../../models/Notification'
import { isAuth } from '../../../utils/auth'

const schemaName = Notification
const schemaNameString = 'Notification'

const handler = nc()

handler.use(isAuth)
handler.put(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { id } = req.query
      const { title, message, type } = req.body
      if (!title || !message || !type)
        return res
          .status(400)
          .json({ error: `title, message and type are required` })

      const object = await schemaName.findById(id)
      if (!object)
        return res.status(400).json({ error: `${schemaNameString} not found` })

      object.title = title
      object.message = message
      object.type = type
      await object.save()
      res.status(200).json({ message: `${schemaNameString} updated` })
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
      const object = await schemaName.findByIdAndDelete(id)

      if (!object)
        return res.status(400).json({ error: `${schemaNameString} not found` })

      res.status(200).json({ message: `${schemaNameString} removed` })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
