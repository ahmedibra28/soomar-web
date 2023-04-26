import { Schema, model, models } from 'mongoose'
import User from './User'

export interface IProfile {
  _id: Schema.Types.ObjectId
  name?: string
  image?: string
  address?: string
  market?: string
  mobile?: number
  bio?: string
  user: Schema.Types.ObjectId
  points: number

  createdAt?: Date
}

const profileSchema = new Schema<IProfile>(
  {
    name: String,
    image: String,
    address: String,
    mobile: Number,
    bio: String,
    points: { type: Number, default: 0 },
    market: String,

    user: {
      type: Schema.Types.ObjectId,
      ref: User,
    },
  },
  { timestamps: true }
)

const Profile = models.Profile || model('Profile', profileSchema)

export default Profile
