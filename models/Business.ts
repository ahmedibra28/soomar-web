import { Schema, model, models } from 'mongoose'
import User, { IUser } from './User'

export interface IBusiness {
  readonly _id: Schema.Types.ObjectId
  name: string
  address: string
  mobile: string
  apiKey: string
  status: 'active' | 'disabled' | 'deleted'
  createdBy: IUser
  updatedBy?: IUser
}

const businessSchema = new Schema<IBusiness>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    mobile: { type: String, required: true },
    apiKey: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'disabled', 'deleted'],
      default: 'active',
    },
    createdBy: { type: Schema.Types.ObjectId, ref: User, required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: User },
  },
  { timestamps: true }
)

const Business = models.Business || model<IBusiness>('Business', businessSchema)

export default Business
