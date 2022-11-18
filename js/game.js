import { Stage } from '../entities/Stage'
import { Ken } from '../entities/fighters/Ken'
import { Ryu } from '../entities/fighters/Ryu'
import { FpsCounter } from '../entities/FpsCounter'

const GameViewport = {
  WIDTH: 384,
  HEIGHT: 224
}

window.addEventListener('load', () => {
  const canvasEl = document.querySelector('canvas')
  const context = canvasEl.getContext('2d')

  canvasEl.width = GameViewport.WIDTH
  canvasEl.height = GameViewport.HEIGHT

  const entities = [
    new Stage(),
    new Ken(80, 110, 150),
    new Ryu(80, 110, -150),
    new FpsCounter()
  ]

  const frameTime = {
    previous: 0,
    secondsPassed: 0
  }

  const frame = (time) => {
    window.requestAnimationFrame(frame)

    frameTime.secondsPassed = (time - frameTime.previous) / 1000
    frameTime.previous = time

    for (const entity of entities) {
      entity.update(frameTime, context)
      entity.draw(context)
    }
  }

  window.requestAnimationFrame(frame)
})
