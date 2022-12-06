import {
  FighterDirection,
  FigterState,
  FrameDelay,
  PUSH_FRICTION
} from './../../contants/fighter'
import { STAGE_FLOOR } from './../../contants/stage'
import * as control from '../../InputHandler'
import { rectsOverlap } from '../../utils/collisions'

export class Fighter {
  constructor (name, x, y, direction, playerId) {
    this.animationFrame = 0
    this.animationTimer = 0
    this.animations = {}
    /**
     * @type {FigterState}
     */
    this.currentState = undefined
    this.direction = direction
    this.frames = new Map()
    this.gravity = 0
    this.image = new window.Image()
    this.initialVelocity = {}
    this.name = name
    /**
     * @type {Fighter}
     */
    this.opponent = undefined
    this.playerId = playerId
    this.position = { x, y }
    this.pushBox = { x: 0, y: 0, width: 0, height: 0 }
    this.velocity = { x: 0, y: 0 }

    this.states = {
      [FigterState.IDLE]: {
        init: this.handleIdleInit.bind(this),
        update: this.handleIdleState.bind(this),
        validFrom: [
          undefined,
          FigterState.IDLE,
          FigterState.WALK_FORWARD,
          FigterState.WALK_BACKWARD,
          FigterState.JUMP_UP,
          FigterState.JUMP_FORWARD,
          FigterState.JUMP_BACKWARD,
          FigterState.CROUCH_UP,
          FigterState.JUMP_LAND,
          FigterState.IDLE_TURN
        ]
      },
      [FigterState.WALK_FORWARD]: {
        init: this.handleMoveInit.bind(this),
        update: this.handleWalkForwardState.bind(this),
        validFrom: [
          FigterState.IDLE,
          FigterState.WALK_BACKWARD
        ]
      },
      [FigterState.WALK_BACKWARD]: {
        init: this.handleMoveInit.bind(this),
        update: this.handleWalkBackwardState.bind(this),
        validFrom: [
          FigterState.IDLE,
          FigterState.WALK_FORWARD
        ]
      },
      [FigterState.JUMP_START]: {
        init: this.handleJumpStartInit.bind(this),
        update: this.handleJumpStartState.bind(this),
        validFrom: [
          FigterState.IDLE,
          FigterState.JUMP_LAND,
          FigterState.WALK_FORWARD,
          FigterState.WALK_BACKWARD
        ]
      },
      [FigterState.JUMP_UP]: {
        init: this.handleJumpInit.bind(this),
        update: this.handleJumpState.bind(this),
        validFrom: [FigterState.JUMP_START]
      },
      [FigterState.JUMP_FORWARD]: {
        init: this.handleJumpInit.bind(this),
        update: this.handleJumpState.bind(this),
        validFrom: [FigterState.JUMP_START]
      },
      [FigterState.JUMP_BACKWARD]: {
        init: this.handleJumpInit.bind(this),
        update: this.handleJumpState.bind(this),
        validFrom: [FigterState.JUMP_START]
      },
      [FigterState.JUMP_LAND]: {
        init: this.handleJumpLandInit.bind(this),
        update: this.handleJumpLandState.bind(this),
        validFrom: [
          FigterState.JUMP_UP,
          FigterState.JUMP_FORWARD,
          FigterState.JUMP_BACKWARD
        ]
      },
      [FigterState.CROUCH]: {
        init: () => {},
        update: this.handleCrouchState.bind(this),
        validFrom: [FigterState.CROUCH_DOWN, FigterState.CROUCH_TURN]
      },
      [FigterState.CROUCH_DOWN]: {
        init: this.handleCrouchDownInit.bind(this),
        update: this.handleCrouchDownState.bind(this),
        validFrom: [FigterState.IDLE, FigterState.WALK_FORWARD, FigterState.WALK_BACKWARD]
      },
      [FigterState.CROUCH_UP]: {
        init: () => { },
        update: this.handleCrouchUpState.bind(this),
        validFrom: [FigterState.CROUCH]
      },
      [FigterState.IDLE_TURN]: {
        init: () => { },
        update: this.handleIdleTurnState.bind(this),
        validFrom: [
          FigterState.IDLE,
          FigterState.JUMP_LAND,
          FigterState.WALK_FORWARD,
          FigterState.WALK_BACKWARD
        ]
      },
      [FigterState.CROUCH_TURN]: {
        init: () => { },
        update: this.handleCrouchState.bind(this),
        validFrom: [FigterState.CROUCH]
      }
    }

    this.changeState(FigterState.IDLE)
  }

  changeState (newState) {
    if (newState === this.currentState ||
      !this.states[newState].validFrom.includes(this.currentState)
    ) {
      return
    }

    this.currentState = newState
    this.animationFrame = 0

    this.states[this.currentState].init()
  }

  draw (context) {
    const [frameKey] = this.animations[this.currentState][this.animationFrame]
    const [[
      [x, y, width, height],
      [originX, originY]
    ]] = this.frames.get(frameKey)

    context.scale(this.direction, 1)
    context.drawImage(
      this.image,
      x,
      y,
      width,
      height,
      Math.floor(this.position.x * this.direction) - originX,
      Math.floor(this.position.y) - originY,
      width,
      height
    )

    context.setTransform(1, 0, 0, 1, 0, 0)

    this.drawDebug(context)
  }

  drawDebug (context) {
    const [frameKey] = this.animations[this.currentState][this.animationFrame]
    const pushBox = this.getPushBox(frameKey)

    context.lineWidth = 1

    // Push Box
    context.beginPath()
    context.strokeStyle = '#55FF55'
    context.fillStyle = '#55FF5555'
    context.fillRect(
      Math.floor(this.position.x + pushBox.x) + 0.5,
      Math.floor(this.position.y + pushBox.y) + 0.5,
      pushBox.width,
      pushBox.height
    )

    context.rect(
      Math.floor(this.position.x + pushBox.x) + 0.5,
      Math.floor(this.position.y + pushBox.y) + 0.5,
      pushBox.width,
      pushBox.height
    )

    context.stroke()

    // Origin
    context.beginPath()
    context.strokeStyle = 'white'

    context.moveTo(Math.floor(this.position.x) - 4, Math.floor(this.position.y) - 0.5)
    context.lineTo(Math.floor(this.position.x) + 5, Math.floor(this.position.y) - 0.5)

    context.moveTo(Math.floor(this.position.x) + 0.5, Math.floor(this.position.y) - 5)
    context.lineTo(Math.floor(this.position.x) + 0.5, Math.floor(this.position.y) + 4)

    context.stroke()
  }

  getDirection = () => {
    if (this.position.x + this.pushBox.x + this.pushBox.width <=
      this.opponent.position.x + this.opponent.pushBox.x
    ) {
      return FighterDirection.RIGHT
    } else if (this.position.x + this.pushBox.x + this.pushBox.width >=
      this.opponent.position.x + this.opponent.pushBox.x + this.opponent.pushBox.width
    ) {
      return FighterDirection.LEFT
    }

    return this.direction
  }

  getPushBox (frameKey) {
    const [, [x, y, width, height] = [0, 0, 0, 0]] = this.frames.get(frameKey)

    return { x, y, width, height }
  }

  handleCrouchDownInit () {
    this.resetVelocities()
  }

  handleCrouchDownState () {
    if (this.isAnimationComplete()) {
      this.changeState(FigterState.CROUCH)
    }

    if (!control.isDown(this.playerId)) {
      this.currentState = FigterState.CROUCH_UP
      this.animationFrame = this.animations[FigterState.CROUCH_UP][this.animationFrame].length -
        this.animationFrame
    }
  }

  handleCrouchState () {
    if (!control.isDown(this.playerId)) {
      this.changeState(FigterState.CROUCH_UP)
    }

    const newDirection = this.getDirection()

    if (newDirection !== this.direction) {
      this.direction = newDirection

      this.changeState(FigterState.CROUCH_TURN)
    }
  }

  handleCrouchUpState () {
    if (this.isAnimationComplete()) {
      this.changeState(FigterState.IDLE)
    }
  }

  handleIdleState () {
    if (control.isUp(this.playerId)) {
      this.changeState(FigterState.JUMP_START)
    } else if (control.isDown(this.playerId)) {
      this.changeState(FigterState.CROUCH_DOWN)
    } else if (control.isBackward(this.playerId, this.direction)) {
      this.changeState(FigterState.WALK_BACKWARD)
    } else if (control.isForward(this.playerId, this.direction)) {
      this.changeState(FigterState.WALK_FORWARD)
    }

    const newDirection = this.getDirection()

    if (newDirection !== this.direction) {
      this.direction = newDirection

      this.changeState(FigterState.IDLE_TURN)
    }
  }

  handleMoveInit () {
    this.velocity.x = this.initialVelocity.x[this.currentState] ?? 0
  }

  handleIdleCrouchState () {
    this.handleCrouchState()

    if (!this.isAnimationComplete()) {
      return
    }

    this.changeState(FigterState.CROUCH)
  }

  handleIdleInit () {
    this.resetVelocities()
  }

  handleIdleTurnState () {
    this.handleIdleState()

    if (!this.isAnimationComplete()) {
      return
    }

    this.changeState(FigterState.IDLE)
  }

  handleJumpInit () {
    this.velocity.y = this.initialVelocity.jump
    this.handleMoveInit()
  }

  handleJumpLandInit () {
    this.resetVelocities()
  }

  handleJumpLandState () {
    if (this.animationFrame < 1) {
      return
    }

    let newState = FigterState.IDLE

    if (!control.isIdle(this.playerId)) {
      this.direction = this.getDirection()

      this.handleIdleState()
    } else {
      const newDirection = this.getDirection()

      if (newDirection !== this.direction) {
        this.direction = newDirection

        newState = FigterState.IDLE_TURN
      } else {
        if (!this.isAnimationComplete()) {
          return
        }
      }
    }

    this.changeState(newState)
  }

  handleJumpStartInit () {
    this.resetVelocities()
  }

  handleJumpStartState () {
    if (this.isAnimationComplete()) {
      if (control.isBackward(this.playerId, this.direction)) {
        this.changeState(FigterState.JUMP_BACKWARD)
      } else if (control.isForward(this.playerId, this.direction)) {
        this.changeState(FigterState.JUMP_FORWARD)
      } else {
        this.changeState(FigterState.JUMP_UP)
      }
    }
  }

  handleJumpState (time) {
    this.velocity.y += this.gravity * time.secondsPassed

    if (this.position.y > STAGE_FLOOR) {
      this.position.y = STAGE_FLOOR
      this.changeState(FigterState.JUMP_LAND)
    }
  }

  handleWalkBackwardState () {
    if (!control.isBackward(this.playerId, this.direction)) {
      this.changeState(FigterState.IDLE)
    } else if (control.isUp(this.playerId)) {
      this.changeState(FigterState.JUMP_START)
    } else if (control.isDown(this.playerId)) {
      this.changeState(FigterState.CROUCH_DOWN)
    }

    this.direction = this.getDirection()
  }

  handleWalkForwardState () {
    if (!control.isForward(this.playerId, this.direction)) {
      this.changeState(FigterState.IDLE)
    } else if (control.isUp(this.playerId)) {
      this.changeState(FigterState.JUMP_START)
    } else if (control.isDown(this.playerId)) {
      this.changeState(FigterState.CROUCH_DOWN)
    }

    this.direction = this.getDirection()
  }

  hasCollideWithOpponent = () => {
    return rectsOverlap(
      this.position.x + this.pushBox.x,
      this.position.y + this.pushBox.y,
      this.pushBox.width,
      this.pushBox.height,
      this.opponent.position.x + this.opponent.pushBox.x,
      this.opponent.position.y + this.opponent.pushBox.y,
      this.opponent.pushBox.width,
      this.opponent.pushBox.height
    )
  }

  isAnimationComplete () {
    return this.animations[this.currentState][this.animationFrame][1] === FrameDelay.TRANSITION
  }

  resetVelocities () {
    this.velocity.x = 0
    this.velocity.y = 0
  }

  /**
   *
   * @param {import('./../../Game').TimeFrame} time
   * @param {object} context
   */
  update (time, context) {
    this.position.x += (this.velocity.x * this.direction) * time.secondsPassed
    this.position.y += this.velocity.y * time.secondsPassed

    this.states[this.currentState].update(time, context)
    this.updateAnimation(time)
    this.updateStageConstraints(time, context)
  }

  updateAnimation (time) {
    const animation = this.animations[this.currentState]
    const [frameKey, frameDelay] = animation[this.animationFrame]

    if (time.previous > this.animationTimer + frameDelay) {
      this.animationTimer = time.previous

      if (frameDelay > FrameDelay.FREEZE) {
        this.animationFrame++
        this.pushBox = this.getPushBox(frameKey)
      }

      if (this.animationFrame >= animation.length) {
        this.animationFrame = 0
      }
    }
  }

  /**
   *
   * @param {import('./../../Game').TimeFrame} time
   * @param {object} context
   */
  updateStageConstraints (time, context) {
    if (this.position.x > context.canvas.width - this.pushBox.width) {
      this.position.x = context.canvas.width - this.pushBox.width
    }

    if (this.position.x < this.pushBox.width) {
      this.position.x = this.pushBox.width
    }

    if (this.hasCollideWithOpponent()) {
      if (this.position.x <= this.opponent.position.x) {
        this.position.x = Math.max(
          (this.opponent.position.x + this.opponent.pushBox.x) - (this.pushBox.x + this.pushBox.width),
          this.pushBox.width
        )

        if ([
          FigterState.IDLE, FigterState.CROUCH, FigterState.JUMP_UP,
          FigterState.JUMP_FORWARD, FigterState.JUMP_BACKWARD
        ].includes(this.opponent.currentState)) {
          this.opponent.position.x += PUSH_FRICTION * time.secondsPassed
        }
      }

      if (this.position.x >= this.opponent.position.x) {
        this.position.x = Math.min(
          (this.opponent.position.x + this.opponent.pushBox.x + this.opponent.pushBox.width) + (this.pushBox.width + this.pushBox.x),
          context.canvas.width - this.pushBox.width
        )

        if ([
          FigterState.IDLE, FigterState.CROUCH, FigterState.JUMP_UP,
          FigterState.JUMP_FORWARD, FigterState.JUMP_BACKWARD
        ].includes(this.opponent.currentState)) {
          this.opponent.position.x -= PUSH_FRICTION * time.secondsPassed
        }
      }
    }
  }
}
