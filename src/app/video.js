import to from 'await-to-js'
import StatusCodes from 'http-status-codes'
import { model } from '../models'
import { AppError, logger } from '../utils'
import { config } from '../configs'
import { GRpcClient } from '../services/grpc'

export class Video {
  // /** @type {GRpcClient} */
  // #grpcClient = undefined

  constructor() {
    // this.#grpcClient = new GRpcClient('10.49.46.251:50052', config.protoFile, 'parking.Camera')
  }

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
      const totalRecord = total[0]?.myCount
      const totalPage = Math.ceil(totalRecord / config.limitPerPage)
      const pageData = dataVio

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

      // let ids = []
      // _.forEach(dataVio, function (item) {
      //   ids.push(item.camera)
      // })

      // let [errCam, getCam] = await to(this.#grpcClient.makeRequest('get', { ids: ids }))
      // if (errCam) throw errCam
      // let dataCam = Object.values(getCam.cameras)

      // let dataResutlCam = []
      // if (!_.isEmpty(dataCam)) {
      //   _.forEach(dataCam, function (item) {
      //     let data = {
      //       idCam: item.id,
      //       nameCam: item.name,
      //       addressCam: item.address,
      //       lat: item.lat,
      //       lng: item.lng,
      //     }
      //     dataResutlCam.push(data)
      //   })
      // }

      // let arrayVio = []
      // _.forEach(dataVio, function (item) {
      //   _.forEach(dataResutlCam, function (cam) {
      //     if (_.toString(item.camera) === cam.idCam) {
      //       arrayVio.push({ ...item, ...cam })
      //     }
      //   })
      // })
      // let pageData = []
      // _.forEach(arrayVio, function (item) {
      //   delete item.camera
      //   pageData.push(item)
      // })

      return result
    } catch (error) {
      logger.error('Video.getById() error', error)
      throw new AppError({ code: StatusCodes.INTERNAL_SERVER_ERROR, message: 'Lấy video vi phạm thất bại' })
    }
  }

  /**
   * Delete video
   * @param {string|mongoose.Types.ObjectId} ids
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

  /**
   *
   * @param {import('mongoose').Date} time
   * @param {String} idCam
   * @param {import('mongoose').Date} alprTime
   */
  getVideoTimeVio = async (time, idCam, alprTime) => {
    try {
      let [err, result] = await to(model.video.getVideoTimeVio(time, idCam, alprTime))
      if (err) throw err

      return result
    } catch (error) {
      logger.error('Get Video from Violation Error', error)
      throw new AppError({ code: StatusCodes.INTERNAL_SERVER_ERROR, message: 'Get Video from Violation thất bại ' })
    }
  }
}
