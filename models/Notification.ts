import { Schema, model, models } from 'mongoose'

export interface INotification {
  _id: Schema.Types.ObjectId
  title: string
  message: string
  type: 'system' | 'user'

  createdAt?: Date
}

const notificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true, enum: ['system', 'user'] },
  },
  { timestamps: true }
)

const Notification =
  models.Notification || model('Notification', notificationSchema)

export default Notification
