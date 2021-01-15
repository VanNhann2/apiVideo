import { VideoModel } from './video'
import { CameraModel } from './camera'

class Model {
  /** @type {VideoModel} */
  video = undefined

  /** @type {CameraModel} */
  camera = undefined

  constructor() {
    this.video = new VideoModel()
    this.camera = new CameraModel()
  }

  /**
   * in transaction mode, mongoose can not create collection,
   * so they need to be created first
   */
  createRequiredCollections = async () => {}
}

const model = new Model()

export { model }
