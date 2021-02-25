import to from 'await-to-js'
import StatusCodes from 'http-status-codes'
import { model } from '../models'
import { AppError } from '../utils'
import { config } from '../configs'

export class Video {
  constructor() {}

  /**
   *
   * @param {String|mongoose.Types.ObjectId} ids
   * @param {Date} startDate
   * @param {Date} endDate
   * @param {Number || String} page
   */
  getAll = async (ids, startDate, endDate, page) => {
    try {
      const startSearchDate = startDate && startDate !== '' && startDate !== 'null' ? startDate : undefined
      const endSearchDate = endDate && endDate !== '' && endDate !== 'null' ? endDate : undefined
      let [err, conditions] = await to(model.video.conditions(ids, startSearchDate, endSearchDate, page))
      if (err) throw err

      const dataPromise = model.video.getAll(conditions.conditionsData)
      const countPromise = model.video.count(conditions.conditionsCount)

      let dataVio = []
      let total = []
      let [errPromise, result] = await to(Promise.all([dataPromise, countPromise]))
      if (errPromise) throw errPromise

      dataVio = result[0]
      total = result[1]

      const totalRecord = total[0]?.myCount || 0
      const totalPage = Math.ceil(totalRecord / config.limitPerPage) || 0

      return { pageData: dataVio, totalRecord, totalPage }
    } catch (error) {
      throw new AppError({ code: StatusCodes.INTERNAL_SERVER_ERROR, message: 'Lấy video thất bại' })
    }
  }

  /**
   *
   * @param {import('mongoose').Date} time
   * @param {String} idCam
   * @param {import('mongoose').Date} alprTime
   */
  getVideoByTime = async (time, idCam, alprTime) => {
    try {
      let [err, result] = await to(model.video.getVideoByTime(time, idCam, alprTime))
      if (err) throw err

      return result
    } catch (error) {
      throw new AppError({ code: StatusCodes.INTERNAL_SERVER_ERROR, message: 'Lấy video thất bại ' })
    }
  }

  /**
   * Delete video
   * @param {string|mongoose.Types.ObjectId} ids
   */
  delete = async (ids) => {
    try {
      let [err] = await to(model.video.delete(ids))
      if (err) throw err

      return 'Xóa video thành công'
    } catch (error) {
      throw new AppError({ code: StatusCodes.INTERNAL_SERVER_ERROR, message: 'Xóa vi video thất bại' })
    }
  }
}
