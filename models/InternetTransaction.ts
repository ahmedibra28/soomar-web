import { Schema, model, models } from 'mongoose'
import User, { IUser } from './User'
import InternetProvider, { IInternetProvider } from './InternetProvider'
import InternetCategory, { IInternetCategory } from './InternetCategory'
import Bundle, { IBundle } from './Bundle'
import Business, { IBusiness } from './Business'

export interface IInternetTransaction {
  user?: IUser
  provider: IInternetProvider
  category: IInternetCategory
  bundle: IBundle
  business?: IBusiness
  senderMobile?: string
  receiverMobile?: string
  reference?: string
  points?: number
  dealer?: IUser
  amount?: number
  quantity?: number

  createdAt?: Date
}

const internetTransactionSchema = new Schema<IInternetTransaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: User,
    },
    business: {
      type: Schema.Types.ObjectId,
      ref: Business,
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
    senderMobile: String,
    receiverMobile: String,
    reference: String,
    points: Number,
    dealer: Schema.Types.ObjectId,
    amount: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
  },
  { timestamps: true }
)

const InternetTransaction =
  models.InternetTransaction ||
  model<IInternetTransaction>('InternetTransaction', internetTransactionSchema)

export default InternetTransaction
