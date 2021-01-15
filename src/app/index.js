import { Video } from './video'
import { Camera } from './camera'

class App {
  /** @type {Camera} */
  camera = undefined

  /** @type {Video} */
  video = undefined

  constructor() {
    this.camera = new Camera()
    this.video = new Video()
  }
}

const app = new App()

export { app }
