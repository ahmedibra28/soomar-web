import { Schema, model, models } from 'mongoose'
import User, { IUser } from './User'

export interface IOrder {
  user: IUser
  products: [
    {
      _id: string
      warehouse: string
      product: {
        _id: string
        sku: string
        name: string
        image: string[]
        variations?: []
      }
      cost: number
      price: number
      quantity: number
      discount?: number
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
  createdAt?: Date
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
          variations: [],
          image: { type: [String], required: true },
        },
        cost: { type: Number, required: true },
        price: { type: Number, required: true },
        discount: { type: Number },
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
