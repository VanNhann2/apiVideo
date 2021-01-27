import _ from 'lodash'
import StatusCodes from 'http-status-codes'
import { app } from '../../app'
import { RequestError } from '../../utils'
import * as validator from '../../validator'

/**
 *
 * @typedef {import('express').Router} Router
 * @param {Router} router
 */
export const videoRouter = (router) => {
  router.post('/video', async (req, res, next) => {
    try {
      const { ids, startDate, endDate, page } = req.body
      if (ids) {
        if (!validator.isMongoIdArray(ids)) {
          throw new RequestError({ code: StatusCodes.BAD_REQUEST, message: 'Ids phải là một mảng' })
        }
      }

      if (_.isEmpty(page)) {
        throw new RequestError({ code: StatusCodes.BAD_REQUEST, message: 'Số trang không hợp lệ' })
      }

      let result = await app.video.getAll(ids, startDate, endDate, page)
      res.json(result)
    } catch (error) {
      next(error)
    }
  })

  router.post('/video/violation', async (req, res, next) => {
    try {
      const { time, idCam, alprTime } = req.body

      if (idCam) {
        if (!validator.isMongoId(idCam)) {
          throw new RequestError({ code: StatusCodes.BAD_REQUEST, message: 'idCam không hợp lệ' })
        }
      }

      const result = await app.video.getVideoTimeVio(time, idCam, alprTime)

      res.json(result)
    } catch (error) {
      next(error)
    }
  })

  router.get('/video/:id', async (req, res, next) => {
    try {
      const { id } = req.params
      if (!validator.isMongoId(id)) {
        throw new RequestError({ code: StatusCodes.BAD_REQUEST, message: 'Video không hợp lệ' })
      }
      const result = await app.video.getById(id)
      res.json(result)
    } catch (error) {
      next(error)
    }
  })

  router.delete('/video/delete', async (req, res, next) => {
    try {
      const { ids } = req.body
      if (!validator.isMongoIdArray(ids)) {
        throw new RequestError({ code: StatusCodes.BAD_REQUEST, message: 'Ids phải là một mảng' })
      }

      const result = await app.video.delete(ids)
      res.json(result)
    } catch (error) {
      next(error)
    }
  })
}
