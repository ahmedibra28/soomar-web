import { Schema, model, models } from 'mongoose'

export interface IVersion {
  readonly _id: Schema.Types.ObjectId
  version: string
}

const versionSchema = new Schema<IVersion>(
  {
    version: { type: String, required: true, default: '1.0.0' },
  },
  { timestamps: true }
)

const Version = models.Version || model<IVersion>('Version', versionSchema)

export default Version
