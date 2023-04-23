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
      let query = Chat.find({ participants: { $in: [req.user._id] } })

      const page = parseInt(req.query.page) || 1
      const pageSize = parseInt(req.query.limit) || 25
      const skip = (page - 1) * pageSize
      const total = await Chat.countDocuments({
        participants: { $in: [req.user._id] },
      })

      const pages = Math.ceil(total / pageSize)

      query = query
        .skip(skip)
        .limit(pageSize)
        .sort({ createdAt: -1 })
        .lean()
        .populate('participants', ['image'])

      const result = await query

      res.status(200).json({
        startIndex: skip + 1,
        endIndex: skip + result.length,
        count: result.length,
        page,
        pages,
        total,
        data: result,
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      const { message, sender, receiver } = req.body

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

      const chats = await Chat.findOne({
        participants: { $in: [sender, receiver] },
      })

      if (chats) {
        // Update existed chat
        chats.messages.push({
          sender,
          message: message.text,
          sentTime: new Date(),
        })

        await chats.save()

        return res.status(200).json(message)
      }

      // Create new chat
      const newChat = await Chat.create({
        participants: [sender, receiver],
        messages: [
          {
            sender,
            message: message.text,
            sentTime: new Date(),
          },
        ],
      })

      if (!newChat)
        return res.status(400).json({ error: 'Chat has not been initialized' })

      return res.status(200).json(message)
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
