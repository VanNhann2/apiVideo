import mongoose from 'mongoose'
import to from 'await-to-js'
import _ from 'lodash'
import { videosSchema, schemaOptions } from './define'
import { BaseModel, BaseSchema } from './base'
import { replacePathVideo } from '../utils'
import { config } from '../configs'

export class VideoModel extends BaseModel {
  constructor() {
    super('Videos', new BaseSchema(videosSchema, schemaOptions))
  }

  /**
   *
   * @param {String|mongoose.Types.ObjectId} ids
   * @param {Date} startSearchDate
   * @param {Date} endSearchDate
   * @param {String|mongoose.Types.ObjectId} page
   */
  conditions = async (ids, startSearchDate, endSearchDate, page) => {
    const searchStartDateCondition = _.isEmpty(startSearchDate) ? {} : { $or: [{ start: { $gte: new Date(startSearchDate) } }] }
    const searchEndDateCondition = _.isEmpty(endSearchDate) ? {} : { $or: [{ end: { $lte: new Date(endSearchDate) } }] }

    let arrIds = []
    if (!_.isEmpty(ids)) {
      for (let id of ids) {
        arrIds.push(mongoose.Types.ObjectId(id))
      }
    }
    const idsCondition = _.isEmpty(ids) ? {} : { $or: [{ camera: { $in: arrIds } }] }
    const otherCondition = { deleted: { $ne: true } }

    const match = {
      $match: { $and: [searchStartDateCondition, searchEndDateCondition, idsCondition, otherCondition] },
    }

    const project = {
      $project: {
        _id: 0,
      },
    }
    const conditionsData = [
      match,
      { $addFields: { id: '$_id' } },
      project,
      { $sort: { start: -1 } },
      { $skip: _.toNumber(config.limitPerPage) * (page - 1) },
      { $limit: _.toNumber(config.limitPerPage) },
    ]
    const conditionsCount = [match]

    return { conditionsData, conditionsCount }
  }

  /**
   *
   * @param {[]} conditions
   */
  getAll = async (conditionsData) => {
    let [err, result] = await to(this.model.aggregate(conditionsData))
    if (err) throw err

    if (_.isEmpty(result)) return []

    let dataResutl = []
    _.forEach(result, function (item) {
      let data = {
        id: item.id,
        name: item.name,
        start: item.start,
        end: item.end,
        camera: item.camera,
        path: replacePathVideo(item.path),
        status: item.status,
      }

      dataResutl.push(data)
    })

    return dataResutl
  }
  /**
   *
   * @param {[]} conditions
   */
  count = async (conditions) => {
    let [err, result] = await to(this.model.aggregate([...conditions, { $count: 'myCount' }]))
    if (err) throw err

    return result
  }

  /**
   *
   * @param {Date} time
   * @param {String} idCam
   * @param {Date} alprTime
   */
  getVideoByTime = async (time, idCam, alprTime) => {
    const otherCondition = { deleted: { $ne: true } }
    const idCamCondition = _.isEmpty(idCam) ? {} : { $or: [{ camera: mongoose.Types.ObjectId(idCam) }] }

    const match = {
      $match: { $and: [{ start: { $lte: new Date(time) } }, { end: { $gte: new Date(time) } }, idCamCondition, otherCondition] },
    }

    const project = {
      $project: {
        id: '$_id',
        path: 1,
      },
    }
    let [err, result] = await to(this.model.aggregate([match, project]))
    if (err) throw err

    let dataResutl = {}
    if (_.isEmpty(result)) return dataResutl

    dataResutl = {
      vioLink: replacePathVideo(result[0].path),
    }
    let dataAlpr = {}
    if (alprTime) {
      const match1 = {
        $match: { $and: [{ start: { $lte: new Date(alprTime) } }, { end: { $gte: new Date(alprTime) } }, idCamCondition, otherCondition] },
      }
      let [errAlpr, resultAlpr] = await to(this.model.aggregate([match1, project]))
      if (errAlpr) throw errAlpr

      if (_.isEmpty(resultAlpr)) return dataResutl
      let dataAl = {
        alprLink: replacePathVideo(resultAlpr[0].path),
      }
      dataAlpr = { ...dataAl, ...dataResutl }
    }

    const checkDataAlpr = (data) => {
      if (JSON.stringify(new String(data.vioLink)) === JSON.stringify(new String(data.alprLink))) {
        delete dataAlpr.alprLink
        return dataAlpr
      } else {
        return dataAlpr
      }
    }

    return alprTime ? checkDataAlpr(dataAlpr) : dataResutl
  }

  /**
   *
   * @param {[String|mongoose.Types.ObjectId]} ids
   */
  delete = async (ids) => {
    let [err, result] = await to(
      this.model.updateMany(
        {
          _id: {
            $in: ids,
          },
        },
        {
          $set: {
            deleted: true,
          },
        }
      )
    )

    if (err) throw err

    return result
  }
}
