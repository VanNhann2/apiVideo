import { Router } from 'express'
import { videoRouter } from './router/video'
export const apis = () => {
  const router = Router()

  videoRouter(router)
  return router
}
