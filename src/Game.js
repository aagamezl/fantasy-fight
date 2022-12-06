import { Stage } from './entities/Stage'
import { Ken } from './entities/fighters/Ken'
import { Ryu } from './entities/fighters/Ryu'
import { FpsCounter } from './entities/FpsCounter'
import { STAGE_FLOOR } from './contants/stage'
import { FighterDirection } from './contants/fighter'
import { Shadow } from './entities/fighters/Shadow'
import { pollGamePads, registerGamepadEvents, registerKeyboardEvents } from './InputHandler'

/**
 * TimeFrame describes time frame of the game
 *
 * @typedef TimeFrame
 * @property {number} previous previous time frame
 * @property {number} secondsPassed seconds elapsed after the last update cycle
 */

export class Game {
  constructor () {
    this.context = this.getContext()

    this.fighters = [
      new Ryu(104, STAGE_FLOOR, FighterDirection.RIGHT, 0),
      new Ken(280, STAGE_FLOOR, FighterDirection.LEFT, 1)
    ]

    this.fighters[0].opponent = this.fighters[1]
    this.fighters[1].opponent = this.fighters[0]

    this.entities = [
      new Stage(),
      ...this.fighters.map(fighter => new Shadow(fighter)),
      ...this.fighters,
      new FpsCounter()
    ]

    /**
     * @type {TimeFrame}
     */
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

    this.frameTime = {
      secondsPassed: (time - this.frameTime.previous) / 1000,
      previous: time
    }

    pollGamePads()
    this.update()
    this.draw()
  }

  start () {
    registerKeyboardEvents()
    registerGamepadEvents()

    window.requestAnimationFrame(this.frame.bind(this))
  }
}
