import nc from 'next-connect'
import db from '../../../../config/db'
import { isAuth } from '../../../../utils/auth'
import User from '../../../../models/User'

const handler = nc()

handler.use(isAuth)

handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    const { status } = req.body

    try {
      const user = await User.findOne({ _id: req.user._id })

      if (!user) return res.status(404).json({ error: 'User not found' })

      if (status === 'delete') {
        user.isDeleted = true
        await user.save()
      }

      if (status === 'undelete') {
        user.isDeleted = false
        await user.save()
      }

      delete user.password

      res.status(200).json(user)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
