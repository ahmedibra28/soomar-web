import { Schema, model, models } from 'mongoose'

export interface IVersion {
  readonly _id: Schema.Types.ObjectId
  version: number
}

const versionSchema = new Schema<IVersion>(
  {
    version: { type: Number, required: true, default: 1 },
  },
  { timestamps: true }
)

const Version = models.Version || model<IVersion>('Version', versionSchema)

export default Version
