import { config } from '../configs'
import _ from 'lodash'

export const replacePathVideo = (path) => {
  return _.replace(path, config.pathVideo, config.replacePathVideo)
}
