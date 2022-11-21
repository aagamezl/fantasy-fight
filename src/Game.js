import { Stage } from './entities/Stage'
import { Ken } from './entities/fighters/Ken'
import { Ryu } from './entities/fighters/Ryu'
import { FpsCounter } from './entities/FpsCounter'
import { STAGE_FLOOR } from './contants/stage'
import { FighterDirection } from './contants/fighter'

export class Game {
  constructor () {
    this.context = this.getContext()

    this.fighters = [
      new Ryu(104, STAGE_FLOOR, FighterDirection.RIGHT),
      new Ken(280, STAGE_FLOOR, FighterDirection.LEFT)
    ]

    this.entities = [
      new Stage(),
      ...this.fighters,
      new FpsCounter()
    ]

    this.frameTime = {
      previous: 0,
      secondsPassed: 0
    }
  }

  draw (entity) {
    for (const entity of this.entities) {
      entity.draw(this.context)
    }
  }

  getContext () {
    const canvasEl = document.querySelector('canvas')
    const context = canvasEl.getContext('2d')

    context.imageSmoothingEnabled = false

    return context
  }

  update () {
    for (const entity of this.entities) {
      entity.update(this.frameTime, this.context)
    }
  }

  frame (time) {
    window.requestAnimationFrame(this.frame.bind(this))

    this.frameTime.secondsPassed = (time - this.frameTime.previous) / 1000
    this.frameTime.previous = time

    this.update()
    this.draw()
  }

  handleFormSubmit (event) {
    event.preventDefault()

    const selectCheckboxes = Array
      .from(document.querySelectorAll('input:checked'))
      .map(checkbox => checkbox.value)

    const options = event.target.querySelector('select')

    this.fighters.forEach(fighter => {
      if (selectCheckboxes.includes(fighter.name)) {
        fighter.changeState(options.value)
      }
    })
  }

  start () {
    document.addEventListener('submit', this.handleFormSubmit.bind(this))

    window.requestAnimationFrame(this.frame.bind(this))
  }
}
