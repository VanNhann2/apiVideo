import { Video } from './video'
class App {
  /** @type {Video} */
  video = undefined

  constructor() {
    this.video = new Video()
  }
}

const app = new App()

export { app }
