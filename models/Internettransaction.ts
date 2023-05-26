import { Schema, model, models } from 'mongoose'
import User from './User'
import InternetProvider, { IInternetProvider } from './InternetProvider'
import InternetCategory, { IInternetCategory } from './InternetCategory'
import Bundle, { IBundle } from './Bundle'

export interface IInternetTransaction {
  user: Schema.Types.ObjectId
  provider: IInternetProvider
  category: IInternetCategory
  bundle: IBundle
}

const orderSchema = new Schema<IInternetTransaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: User,
    },
    provider: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: InternetProvider,
    },
    category: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: InternetCategory,
    },
    bundle: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: Bundle,
    },
  },
  { timestamps: true }
)

const InternetTransaction =
  models.InternetTransaction ||
  model<IInternetTransaction>('InternetTransaction', orderSchema)

export default InternetTransaction
