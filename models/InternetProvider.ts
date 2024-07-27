import { Schema, model, models } from 'mongoose'
import User, { IUser } from './User'

export interface IInternetProvider {
  readonly _id: Schema.Types.ObjectId
  name: string
  image?: string
  branch?: 'Mogadishu' | 'Kismayo' | 'Hargeisa' | 'Baidoa' | 'Puntland'
  createdBy: IUser
  updatedBy?: IUser
  status: 'active' | 'deleted' | 'inactive'
}

const internetProviderSchema = new Schema<IInternetProvider>(
  {
    name: { type: String, required: true },
    image: String,
    branch: {
      type: String,
      enum: ['Mogadishu', 'Kismayo', 'Hargeisa', 'Baidoa', 'Puntland'],
      default: 'Mogadishu',
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

const InternetProvider =
  models.InternetProvider ||
  model<IInternetProvider>('InternetProvider', internetProviderSchema)

export default InternetProvider
