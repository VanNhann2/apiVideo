import mongoose from 'mongoose'
import to from 'await-to-js'
import _ from 'lodash'
import { cameraSchema, schemaOptions } from './define'
import { BaseModel, BaseSchema } from './base'

export class CameraModel extends BaseModel {
  constructor() {
    super('Cameras', new BaseSchema(cameraSchema, schemaOptions))
  }

  /**
   *
   * @param {String|mongoose.Types.ObjectId} id
   */
  getById = async (id) => {
    const idCondition = { _id: mongoose.Types.ObjectId(id) }
    const otherCondition = { deleted: { $ne: true } }

    const match = {
      $match: { $and: [idCondition, otherCondition] },
    }

    let [err, result] = await to(this.model.aggregate([match]))
    if (err) throw err

    return !_.isEmpty(result) ? result[0] : {}
  }
}
