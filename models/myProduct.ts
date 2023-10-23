import { Schema, model, models } from 'mongoose'
import User, { IUser } from './User'
import InternetProvider, { IInternetProvider } from './InternetProvider'

export interface ImyProduct {
  readonly _id: Schema.Types.ObjectId
  internet: IInternetProvider
  product?: string
  dealer: IUser

  createdBy: IUser
  updatedBy?: IUser
}

const myProductSchema = new Schema<ImyProduct>(
  {
    internet: { type: Schema.Types.ObjectId, ref: InternetProvider },
    product: String,
    dealer: { type: Schema.Types.ObjectId, ref: User },

    createdBy: { type: Schema.Types.ObjectId, ref: User, required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: User },
  },
  { timestamps: true }
)

const myProduct =
  models.myProduct || model<ImyProduct>('myProduct', myProductSchema)

export default myProduct
