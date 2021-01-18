import mongoose from 'mongoose'
import to from 'await-to-js'
import _ from 'lodash'
import { videosSchema, schemaOptions } from './define'
import { BaseModel, BaseSchema } from './base'

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
    const searchDateCondition =
      _.isEmpty(startSearchDate) && _.isEmpty(endSearchDate) ? {} : { $or: [{ vio_time: { $gte: new Date(startSearchDate), $lte: new Date(endSearchDate) } }] }
    const arrIds = []
    if (!_.isEmpty(ids)) {
      for (let id of ids) {
        arrIds.push(mongoose.Types.ObjectId(id))
      }
    }
    let idsCondition = _.isEmpty(ids) ? {} : { $or: [{ camera: { $in: arrIds } }] }
    const otherCondition = { deleted: { $ne: true } }

    const match = {
      $match: { $and: [searchDateCondition, idsCondition, otherCondition] },
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
    return result
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

    // if (_.isEmpty(result)) return {}
    // return result[0]
    return !_.isEmpty(result) ? result[0] : {}
  }

  getByDate = async (requestDate) => {
    const date = Date.parse(requestDate)
    const start = date + 180000
    const end = date - 180000
    const sortStart = { $gte: start }
    const sortEnd = { $lte: end }
    const match = {
      $match: { $and: [sortStart, sortEnd] },
    }

    const project = {
      $project: {
        _id: 0,
      },
    }
    let [err, result] = this.model.aggregate(match, project)
    if (err) throw err
    return result
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
