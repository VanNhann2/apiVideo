import { VideoModel } from './video'

class Model {
  /** @type {VideoModel} */
  video = undefined

  constructor() {
    this.video = new VideoModel()
  }

  /**
   * in transaction mode, mongoose can not create collection,
   * so they need to be created first
   */
  createRequiredCollections = async () => {}
}

const model = new Model()

export { model }
