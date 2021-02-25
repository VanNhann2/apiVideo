import { VideoModel } from './video'

class Model {
  /** @type {VideoModel} */
  video = undefined

  constructor() {
    this.video = new VideoModel()
  }
}

const model = new Model()

export { model }
