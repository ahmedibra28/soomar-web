import nc from 'next-connect'
import db from '../../../../config/db'
import Chat from '../../../../models/Chat'
import { isAuth } from '../../../../utils/auth'
import User from '../../../../models/User'

const handler = nc()
handler.use(isAuth)
handler.get(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      // @ts-ignore
      const [sender, receiver] = req.query.user

      const senderUser = await User.findOne({
        _id: sender,
        confirmed: true,
        blocked: false,
      })
      const receiverUser = await User.findOne({
        _id: receiver,
        confirmed: true,
        blocked: false,
      })

      if (!senderUser || !receiverUser)
        return res
          .status(404)
          .json({ error: 'User not found or has been blocked' })

      let chats = await Chat.findOne({
        participants: { $in: [sender, receiver] },
      }).populate('messages.sender', ['image', 'name'])

      chats = chats?.messages?.map((chat: any) => ({
        _id: chats._id,
        text: chat.message,
        audio: {
          duration: 1,
          file: '',
        },
        user: {
          _id: chat.sender._id,
          name: chat.sender.name,
          avatar: chat.sender.image,
        },
        createdAt: chat.sentTime,
      }))

      return res.json(chats)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
