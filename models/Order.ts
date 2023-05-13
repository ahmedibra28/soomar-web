import { Schema, model, models } from 'mongoose'
import User from './User'

export interface IOrder {
  user: Schema.Types.ObjectId
  products: [
    {
      _id: string
      warehouse: string
      product: {
        _id: string
        sku: string
        name: string
        image: string[]
      }
      cost: number
      price: number
      quantity: number
      color?: string
      size?: string
      weight?: number
      name: string
    }
  ]
  deliveryAddress: {
    mobile: string
    address: string
    deliveryAddress: string
    deliveryPrice: number
  }
}

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: User,
    },
    products: [
      {
        _id: { type: String, required: true },
        warehouse: { type: String, required: true },
        product: {
          _id: { type: String, required: true },
          sku: { type: String, required: true },
          name: { type: String, required: true },
          image: { type: [String], required: true },
        },
        cost: { type: Number, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        color: String,
        size: String,
        weight: Number,
        name: { type: String, required: true },
      },
    ],
    deliveryAddress: {
      mobile: { type: String, required: true },
      address: { type: String },
      deliveryAddress: { type: String },
      deliveryPrice: { type: Number, required: true },
    },
  },
  { timestamps: true }
)

const Order = models.Order || model<IOrder>('Order', orderSchema)

export default Order
