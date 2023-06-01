import { Schema, model, models } from 'mongoose'
import User, { IUser } from './User'
import InternetProvider, { IInternetProvider } from './InternetProvider'

export interface IInternetCategory {
  readonly _id: Schema.Types.ObjectId
  internetProvider: IInternetProvider
  name: string
  image?: string
  createdBy: IUser
  updatedBy?: IUser
  status: 'active' | 'deleted' | 'inactive'
}

const internetCategorySchema = new Schema<IInternetCategory>(
  {
    name: { type: String, required: true },
    image: String,
    internetProvider: {
      type: Schema.Types.ObjectId,
      ref: InternetProvider,
      required: true,
    },
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

const InternetCategory =
  models.InternetCategory ||
  model<IInternetCategory>('InternetCategory', internetCategorySchema)

export default InternetCategory
