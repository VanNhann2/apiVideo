import mongoose from 'mongoose'
import to from 'await-to-js'
import _ from 'lodash'
import { videosSchema, schemaOptions } from './define'
import { BaseModel, BaseSchema } from './base'
import { replacePathVideo } from '../utils'

export class VideoModel extends BaseModel {
  constructor() {
    super('Videos', new BaseSchema(videosSchema, schemaOptions))
    this.perPage = 20
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

    const arrIds = []
    if (!_.isEmpty(ids)) {
      for (let id of ids) {
        arrIds.push(mongoose.Types.ObjectId(id))
      }
    }
    let idsCondition = _.isEmpty(ids) ? {} : { $or: [{ camera: { $in: arrIds } }] }
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
      { $skip: this.perPage * (page - 1) },
      { $limit: this.perPage },
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

    let dataResutl = []
    if (!_.isEmpty(result)) {
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

  getAllVideo = async () => {
    const otherCondition = { deleted: { $ne: true } }

    const match = {
      $match: { otherCondition },
    }

    let [err, result] = await to(this.model.aggregate([match]))
    if (err) throw err

    return result
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

    const project = {
      $project: {
        id: '$_id',
        name: 1,
        start: 1,
        end: 1,
        camera: 1,
        path: 1,
        status: 1,
      },
    }

    let [err, result] = await to(this.model.aggregate([match, project]))
    if (err) throw err

    // if (_.isEmpty(result)) return {}
    // return result[0]
    return !_.isEmpty(result) ? result[0] : {}
  }

  /**
   *
   * @param {String} requestDate
   */
  getByDate = async (requestDate) => {
    const date = Date.parse(requestDate[0])
    const startDate = date - 250000
    const endDate = date + 250000
    console.log(startDate + '----------------' + endDate)
    // const sortStart = { $gte: start }
    // const sortEnd = { $lte: end }

    // const searchStartDateCondition = _.isEmpty(start.toString()) ? {} : { $or: [{ start: { $gte: start } }] }
    // const searchEndDateCondition = _.isEmpty(end.toString()) ? {} : { $or: [{ end: { $lte: end } }] }
    const otherCondition = { deleted: { $ne: true } }

    const match = {
      $match: { $and: [{ start: { $gte: new Date(startDate) } }, { end: { $lte: new Date(endDate) } }, otherCondition] },
    }

    const project = {
      $project: {
        id: '$_id',
        name: 1,
        start: 1,
        end: 1,
        camera: 1,
        path: 1,
        status: 1,
      },
    }
    let [err, result] = await to(this.model.aggregate([match, project]))
    console.log('Model: result------------------------')
    console.log(result)
    if (err) throw err

    return result[0]
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

  /**
   *
   * @param {Date}} time
   */
  getVideoTimeVio = async (time) => {
    const timeSearch = Date.parse(time)
    const startTime = timeSearch - 170000
    const endTime = timeSearch + 170000

    const otherCondition = { deleted: { $ne: true } }

    const match = {
      $match: { $and: [{ start: { $gte: new Date(startTime) } }, { end: { $lte: new Date(endTime) } }, otherCondition] },
    }

    const project = {
      $project: {
        id: '$_id',
        name: 1,
        start: 1,
        end: 1,
        camera: 1,
        path: 1,
        status: 1,
      },
    }
    let [err, result] = await to(this.model.aggregate([match, project]))
    if (err) throw err

    let dataResutl = []
    if (!_.isEmpty(result)) {
      _.forEach(result, function (item) {
        let data = {
          id: item.id,
          path: replacePathVideo(item.path),
        }
        dataResutl.push(data)
      })
    }

    return dataResutl ? dataResutl[0] : {}
  }
}
