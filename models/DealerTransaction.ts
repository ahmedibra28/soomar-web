import { Schema, model, models } from 'mongoose'
import User, { IUser } from './User'

export interface IDealerTransaction {
  user?: IUser
  type: 'WITHDRAWAL' | 'DEPOSIT'
  amount: number

  createdAt?: Date
}

const dealerTransactionSchema = new Schema<IDealerTransaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: User,
    },
    type: {
      type: String,
      enum: ['WITHDRAWAL', 'DEPOSIT'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
)

const DealerTransaction =
  models.DealerTransaction ||
  model<IDealerTransaction>('DealerTransaction', dealerTransactionSchema)

export default DealerTransaction
