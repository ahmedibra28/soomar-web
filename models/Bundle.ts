import { Schema, model, models } from 'mongoose'
import User, { IUser } from './User'
import InternetCategory, { IInternetCategory } from './InternetCategory'

export interface IBundle {
  readonly _id: Schema.Types.ObjectId
  internetCategory: IInternetCategory
  quantity: number
  amount: number
  label: string
  offerId: number
  description?: string
  createdBy: IUser
  updatedBy?: IUser
  status: 'active' | 'deleted' | 'inactive'
}

const bundleSchema = new Schema<IBundle>(
  {
    quantity: { type: Number, required: true },
    amount: { type: Number, required: true },
    label: { type: String, required: true },
    offerId: Number,
    description: String,
    internetCategory: {
      type: Schema.Types.ObjectId,
      ref: InternetCategory,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'deleted', 'inactive'],
      default: 'active',
    },

    createdBy: { type: Schema.Types.ObjectId, ref: User, required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: User },
  },
  { timestamps: true }
)

const Bundle = models.Bundle || model<IBundle>('Bundle', bundleSchema)

export default Bundle
