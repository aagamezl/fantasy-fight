import { FigterState } from './../../contants/fighter'
import { STAGE_FLOOR } from './../../contants/stage'

export class Fighter {
  constructor (name, x, y, direction) {
    this.animationFrame = 0
    this.animationTimer = 0
    this.animations = {}
    this.direction = direction
    this.frames = new Map()
    this.gravity = 0
    this.image = new window.Image()
    this.initialVelocity = {}
    this.name = name
    this.position = { x, y }
    this.velocity = { x: 0, y: 0 }

    this.states = {
      [FigterState.IDLE]: {
        init: this.handleIdleInit.bind(this),
        update: () => { },
        validFrom: [
          undefined,
          FigterState.IDLE,
          FigterState.WALK_FORWARD,
          FigterState.WALK_BACKWARD,
          FigterState.JUMP_UP,
          FigterState.JUMP_FORWARD,
          FigterState.JUMP_BACKWARD,
          FigterState.CROUCH_UP
        ]
      },
      [FigterState.WALK_FORWARD]: {
        init: this.handleMoveInit.bind(this),
        update: () => {},
        validFrom: [
          FigterState.IDLE,
          FigterState.WALK_BACKWARD
        ]
      },
      [FigterState.WALK_BACKWARD]: {
        init: this.handleMoveInit.bind(this),
        update: () => {},
        validFrom: [
          FigterState.IDLE,
          FigterState.WALK_FORWARD
        ]
      },
      [FigterState.JUMP_UP]: {
        init: this.handleJumpInit.bind(this),
        update: this.handleJumpState.bind(this),
        validFrom: [FigterState.IDLE]
      },
      [FigterState.JUMP_FORWARD]: {
        init: this.handleJumpInit.bind(this),
        update: this.handleJumpState.bind(this),
        validFrom: [FigterState.IDLE, FigterState.WALK_FORWARD]
      },
      [FigterState.JUMP_BACKWARD]: {
        init: this.handleJumpInit.bind(this),
        update: this.handleJumpState.bind(this),
        validFrom: [FigterState.IDLE, FigterState.WALK_BACKWARD]
      },
      [FigterState.CROUCH]: {
        init: () => {},
        update: () => { },
        validFrom: [FigterState.CROUCH_DOWN]
      },
      [FigterState.CROUCH_DOWN]: {
        init: () => { },
        update: this.handleCrouchDownState.bind(this),
        validFrom: [FigterState.IDLE, FigterState.WALK_FORWARD, FigterState.WALK_BACKWARD]
      },
      [FigterState.CROUCH_UP]: {
        init: () => { },
        update: this.handleCrouchUpState.bind(this),
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
    const [
      [x, y, width, height],
      [originX, originY]
    ] = this.frames.get(frameKey)

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
    context.lineWidth = 1

    context.beginPath()
    context.strokeStyle = 'white'

    context.moveTo(Math.floor(this.position.x) - 4.5, Math.floor(this.position.y))
    context.lineTo(Math.floor(this.position.x) + 4.5, Math.floor(this.position.y))

    context.moveTo(Math.floor(this.position.x), Math.floor(this.position.y) - 4.5)
    context.lineTo(Math.floor(this.position.x), Math.floor(this.position.y) + 4.5)

    context.stroke()
  }

  handleCrouchDownState () {
    if (this.animations[this.currentState][this.animationFrame][1] === -2) {
      this.changeState(FigterState.CROUCH)
    }
  }

  handleCrouchUpState () {
    if (this.animations[this.currentState][this.animationFrame][1] === -2) {
      this.changeState(FigterState.IDLE)
    }
  }

  handleMoveInit () {
    this.velocity.x = this.initialVelocity.x[this.currentState] ?? 0
  }

  handleIdleInit () {
    this.velocity.x = 0
    this.velocity.y = 0
  }

  handleJumpInit () {
    this.velocity.y = this.initialVelocity.jump
    this.handleMoveInit()
  }

  handleJumpState (time) {
    this.velocity.y += this.gravity * time.secondsPassed

    if (this.position.y > STAGE_FLOOR) {
      this.position.y = STAGE_FLOOR
      this.changeState(FigterState.IDLE)
    }
  }

  update (time, context) {
    this.position.x += (this.velocity.x * this.direction) * time.secondsPassed
    this.position.y += this.velocity.y * time.secondsPassed

    this.states[this.currentState].update(time, context)
    this.updateAnimation(time)
    this.updateStageContraints(context)
  }

  updateAnimation (time) {
    const animation = this.animations[this.currentState]
    const [, frameDelay] = animation[this.animationFrame]

    if (time.previous > this.animationTimer + frameDelay) {
      this.animationTimer = time.previous

      if (frameDelay > 0) {
        this.animationFrame++
      }

      if (this.animationFrame >= animation.length) {
        this.animationFrame = 0
      }
    }
  }

  updateStageContraints (context) {
    const WIDTH = 32

    if (this.position.x > context.canvas.width - WIDTH) {
      this.position.x = context.canvas.width - WIDTH
    }

    if (this.position.x < WIDTH) {
      this.position.x = WIDTH
    }
  }
}
