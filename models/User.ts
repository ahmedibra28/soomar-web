import { Schema, model, models } from 'mongoose'
import crypto from 'crypto'
import bcrypt from 'bcrypt'

export interface IUser {
  _id: Schema.Types.ObjectId
  name: string
  email: string
  mobile: number
  password: string
  resetPasswordToken?: string
  resetPasswordExpire?: string
  otp?: string
  otpExpire?: Date
  confirmed: boolean
  blocked: boolean
  createdAt?: Date
  isReal: boolean
  platform: 'web' | 'soomar' | 'dankaab'
  dealerCode?: string
  dealerBanner?: string
  role?: string
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    mobile: { type: Number, required: true },
    password: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    otp: String,
    otpExpire: Date,
    confirmed: { type: Boolean, default: false },
    blocked: { type: Boolean, default: false },
    isReal: { type: Boolean, default: false },
    dealerCode: { type: String, uppercase: true },
    dealerBanner: String,
    platform: {
      type: String,
      enum: ['web', 'soomar', 'dankaab'],
      required: true,
    },
  },
  { timestamps: true }
)

userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.encryptPassword = async function (password: string) {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex')

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

  this.resetPasswordExpire = Date.now() + 10 * (60 * 1000) // Ten Minutes

  return resetToken
}

userSchema.methods.getRandomOtp = function () {
  let resetToken = Math.floor(Math.random() * 10000)
  resetToken =
    resetToken.toString().length !== 4
      ? Math.floor(Math.random() * 10000)
      : resetToken

  this.otp = resetToken.toString()
  this.otpExpire = Date.now() + 10 * (60 * 1000) // Ten Minutes
  return resetToken
}

const User = models.User || model('User', userSchema)

export default User
