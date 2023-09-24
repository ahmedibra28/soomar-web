import { Schema, model, models } from 'mongoose'

export interface INotification {
  _id: Schema.Types.ObjectId
  title: string
  data: {
    screen: string
    image?: string
    params?: {
      _id: string
      name?: string
    }
  }
  body: string
  type: 'system' | 'user'

  createdAt?: Date
}

const notificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: { type: String, required: true, enum: ['system', 'user'] },
    data: {
      screen: String,
      image: String,
      params: {
        _id: String,
        name: String,
      },
    },
  },
  { timestamps: true }
)

const Notification =
  models.Notification || model('Notification', notificationSchema)

export default Notification
