import { Schema, model, models } from 'mongoose'

export interface IDankaabVersion {
  readonly _id: Schema.Types.ObjectId
  version: string
}

const dankaabVersionSchema = new Schema<IDankaabVersion>(
  {
    version: { type: String, required: true, default: '1.0.0' },
  },
  { timestamps: true }
)

const DankaabVersion =
  models.Version ||
  model<IDankaabVersion>('DankaabVersion', dankaabVersionSchema)

export default DankaabVersion
