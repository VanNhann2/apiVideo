import mongoose from 'mongoose'

export const schemaOptions = {
  versionKey: false,
}

export const videosSchema = {
  name: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  camera: { type: mongoose.SchemaTypes.ObjectId, required: true },
  path: { type: String, required: true },
  status: { type: Number },
  deleted: { type: Boolean },
}
