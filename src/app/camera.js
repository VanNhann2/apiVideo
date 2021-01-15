import to from 'await-to-js'
import StatusCodes from 'http-status-codes'
import { model } from '../models'
import { AppError, logger } from '../utils'
// import mongoose from 'mongoose'
// import _ from 'lodash'

export class Camera {
  constructor() {}

  /**
   *
   * @param {String|mongoose.Types.ObjectId} id
   */
  getById = async (id) => {
    try {
      let [err, result] = await to(model.camera.getById(id))
      if (err) throw err

      return result
    } catch (error) {
      logger.error('Video.getById() Camera error', error)
      throw new AppError({ code: StatusCodes.INTERNAL_SERVER_ERROR, message: 'Lấy video vi phạm thất bại' })
    }
  }
}
