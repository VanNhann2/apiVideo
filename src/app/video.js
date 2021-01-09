import to from 'await-to-js'
import StatusCodes from 'http-status-codes'
import { model } from '../models'
import { AppError, logger } from '../utils'
// import mongoose from 'mongoose'
// import _ from 'lodash'

export class Video {
  constructor() {
    this.perPage = 20
  }

  /**
   *
   * @param {String|mongoose.Types.ObjectId} ids
   * @param {Date} startDate
   * @param {Date} endDate
   * @param {Number} page
   */
  getAll = async (ids, startDate, endDate, page) => {
    try {
      const arrayIds = ids && ids != [] ? ids : undefined
      const startSearchDate = startDate && startDate != '' && startDate != 'null' ? new Date(startDate).toISOString() : undefined
      const endSearchDate = endDate && endDate != '' && endDate != 'null' ? new Date(endDate).toISOString() : undefined
      let [err, conditions] = await to(model.video.conditions(arrayIds, startSearchDate, endSearchDate, page))
      if (err) throw err

      const dataPromise = model.video.getAll(conditions.conditionsData)
      const countPromise = model.video.count(conditions.conditionsCount)

      let pageData = []
      let total = []
      let [errPromise, result] = await to(Promise.all([dataPromise, countPromise]))
      if (errPromise) throw errPromise

      pageData = result[0]
      total = result[1]
      const totalRecord = total[0]?.myCount
      const totalPage = Math.ceil(totalRecord / this.perPage)
      return { pageData, totalRecord, totalPage }
    } catch (error) {
      logger.error('Video.getAll() error', error)
      throw new AppError({ code: StatusCodes.INTERNAL_SERVER_ERROR, message: 'Lấy video vi phạm thất bại' })
    }
  }

  /**
   *
   * @param {String|mongoose.Types.ObjectId} id
   */
  getById = async (id) => {
    try {
      let [err, result] = await to(model.video.getById(id))
      if (err) throw err

      return result
    } catch (error) {
      logger.error('Video.getAll() error', error)
      throw new AppError({ code: StatusCodes.INTERNAL_SERVER_ERROR, message: 'Lấy video vi phạm thất bại' })
    }
  }

  /**
   * Delete video
   * @param {string|mongoose.Types.ObjectId}
   */
  delete = async (ids) => {
    try {
      let [errDelete] = await to(model.video.delete(ids))
      if (errDelete) throw errDelete

      return 'Xóa video thành công'
    } catch (error) {
      logger.error('Video.delete() error:', error)
      throw new AppError({ code: StatusCodes.INTERNAL_SERVER_ERROR, message: 'Xóa vi video thất bại' })
    }
  }
}
