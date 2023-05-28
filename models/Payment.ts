import { Schema, model, models } from 'mongoose'
import User from './User'

export interface IPayment {
  user: Schema.Types.ObjectId
  amount: number
  transaction: 'PRODUCT GOODS' | 'INTERNET' | 'AGENT REGISTRATION'
  currency: 'USD' | 'SOS'
  status: {
    stepOne: 'success' | 'failed'
    stepTwo: 'success' | 'failed'
  }
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
      enum: ['USD', 'SOS'],
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
