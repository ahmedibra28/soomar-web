import { Schema, model, models } from 'mongoose'
import User, { IUser } from './User'

export interface IPayment {
  user: IUser
  amount: number
  transaction: 'PRODUCT GOODS' | 'INTERNET' | 'AGENT REGISTRATION'
  currency: 'USD' | 'SLSH'
  status: {
    stepOne: 'success' | 'failed'
    stepTwo: 'success' | 'failed'
  }
  createdAt: Date
}

const paymentSchema = new Schema<IPayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: User,
    },
    amount: { type: Number, required: true },
    transaction: {
      type: String,
      enum: ['PRODUCT GOODS', 'INTERNET', 'AGENT REGISTRATION'],
      default: 'PRODUCT GOODS',
    },
    currency: {
      type: String,
      enum: ['USD', 'SLSH'],
      default: 'USD',
    },
    status: {
      stepOne: {
        type: String,
        enum: ['success', 'failed'],
        default: 'success',
      },
      stepTwo: {
        type: String,
        enum: ['success', 'failed'],
        default: 'success',
      },
    },
  },
  { timestamps: true }
)

const Payment = models.Payment || model<IPayment>('Payment', paymentSchema)

export default Payment
