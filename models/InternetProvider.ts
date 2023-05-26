import { Schema, model, models } from 'mongoose'
import User, { IUser } from './User'

export interface IInternetProvider {
  readonly _id: Schema.Types.ObjectId
  name: string
  image: string
  createdBy: IUser
  updatedBy?: IUser
  status: 'active' | 'deleted' | 'inactive'
}

const internetProviderSchema = new Schema<IInternetProvider>(
  {
    name: { type: String, required: true },
    image: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: User, required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: User },
    status: {
      type: String,
      enum: ['active', 'deleted', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
)

const InternetProvider =
  models.InternetProvider ||
  model<IInternetProvider>('InternetProvider', internetProviderSchema)

export default InternetProvider
