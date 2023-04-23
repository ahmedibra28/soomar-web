import { Schema, model, models } from 'mongoose'
import User from './User'

export interface IChat {
  _id: Schema.Types.ObjectId
  participants: Schema.Types.ObjectId[]
  messages: [
    {
      sender: Schema.Types.ObjectId
      message: string
      sentTime: Date
    }
  ]
  createdAt?: Date
}

const chatSchema = new Schema<IChat>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: User }],
    messages: [
      {
        sender: { type: Schema.Types.ObjectId, ref: User },
        message: String,
        sentTime: Date,
      },
    ],
  },
  { timestamps: true }
)

const Chat = models.Chat || model('Chat', chatSchema)

export default Chat
