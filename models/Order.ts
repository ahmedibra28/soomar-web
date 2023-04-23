import { Schema, model, models } from 'mongoose'
import User from './User'

export interface IOrder {
  user: Schema.Types.ObjectId
  orderItems: [
    {
      name: string
      quantity: number
      price: number
      productUrl: Schema.Types.ObjectId
    }
  ]
  shippingAddress: {
    address: string
    deliveryAddress: string
  }
}

const orderSchema = new Schema<IOrder>({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: User,
  },
  orderItems: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      productUrl: { type: String, required: true },
    },
  ],
  shippingAddress: {
    address: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
  },
})

const Order = models.Order || model<IOrder>('Order', orderSchema)

export default Order
