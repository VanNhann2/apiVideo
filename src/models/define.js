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

export const cameraSchema = {
  name: { type: String, required: true },
  province: { type: String },
  district: { type: String },
  commune: { type: String },
  group: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'Group' }],
  lat: { type: Number },
  lng: { type: Number },
  address: { type: String, default: '' },
  deleted: { type: Boolean },
}
