import { gsap } from 'gsap'

import backgroundImage from './../images/background.png'
import shopImage from './../images/shop.png'

import samuraiMackIdleImage from './../images/samuraiMack/Idle-Complete.png'
import samuraiMackAttackImage from './../images/samuraiMack/Attack1-Complete.png'
import samuraiMackRunImage from './../images/samuraiMack/Run-Complete.png'
import samuraiMackFallImage from './../images/samuraiMack/Fall-Complete.png'
import samuraiMackDeathImage from './../images/samuraiMack/Death.png'
import samuraiMackTakeHitImage from './../images/samuraiMack/Take Hit - white silhouette.png'
import samuraiMackJumpImage from './../images/samuraiMack/Jump-Complete.png'

import kenjiIdleImage from './../images/kenji/Idle-Complete.png'
import kenjiAttackImage from './../images/kenji/Attack1-Complete.png'
import kenjiRunImage from './../images/kenji/Run-Complete.png'
import kenjiFallImage from './../images/kenji/Fall-Complete.png'
import kenjiDeathImage from './../images/kenji/Death.png'
import kenjiTakeHitImage from './../images/kenji/Take hit.png'
import kenjiJumpImage from './../images/kenji/Jump-Complete.png'

import { Sprite, Fighter } from './classes'
import { decreaseTimer, determineWinner, rectangularCollision, timerId } from './utils'
import { config } from './config'

const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')

canvas.height = config.canvas.height
canvas.width = config.canvas.width

context.fillRect(0, 0, canvas.width, canvas.height)

const background = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  imageSrc: backgroundImage,
  canvas,
  context
})

const shop = new Sprite({
  position: {
    x: 600,
    y: 128
  },
  imageSrc: shopImage,
  scale: 2.75,
  framesMax: 6,
  canvas,
  context
})

export const player = new Fighter({
  position: {
    x: 100,
    y: 330
  },
  velocity: {
    x: 0,
    y: 0
  },
  imageSrc: samuraiMackIdleImage,
  framesMax: 8,
  scale: 2.5,
  offset: {
    x: 215,
    y: 157
  },
  sprites: {
    idle: {
      imageSrc: samuraiMackIdleImage,
      framesMax: 8
    },
    run: {
      imageSrc: samuraiMackRunImage,
      framesMax: 8
    },
    jump: {
      imageSrc: samuraiMackJumpImage,
      framesMax: 2
    },
    fall: {
      imageSrc: samuraiMackFallImage,
      framesMax: 2
    },
    attack1: {
      imageSrc: samuraiMackAttackImage,
      framesMax: 6
    },
    takeHit: {
      imageSrc: samuraiMackTakeHitImage,
      framesMax: 4
    },
    death: {
      imageSrc: samuraiMackDeathImage,
      framesMax: 6
    }
  },
  attackBox: {
    offset: {
      x: 100,
      y: 50
    },
    width: 160,
    height: 50
  },
  canvas,
  context
})

export const enemy = new Fighter({
  position: {
    x: config.canvas.width - 150,
    y: 330
  },
  velocity: {
    x: 0,
    y: 0
  },
  color: 'blue',
  imageSrc: kenjiIdleImage,
  framesMax: 4,
  scale: 2.5,
  offset: {
    x: 215,
    y: 167
  },
  sprites: {
    idle: {
      imageSrc: kenjiIdleImage,
      framesMax: 4
    },
    run: {
      imageSrc: kenjiRunImage,
      framesMax: 8
    },
    jump: {
      imageSrc: kenjiJumpImage,
      framesMax: 2
    },
    fall: {
      imageSrc: kenjiFallImage,
      framesMax: 2
    },
    attack1: {
      imageSrc: kenjiAttackImage,
      framesMax: 4
    },
    takeHit: {
      imageSrc: kenjiTakeHitImage,
      framesMax: 3
    },
    death: {
      imageSrc: kenjiDeathImage,
      framesMax: 7
    }
  },
  attackBox: {
    offset: {
      x: -170,
      y: 50
    },
    width: 170,
    height: 50
  },
  canvas,
  context
})

const keys = {
  a: {
    pressed: false
  },
  d: {
    pressed: false
  },
  ArrowRight: {
    pressed: false
  },
  ArrowLeft: {
    pressed: false
  }
}

decreaseTimer(player, enemy)

function animate () {
  window.requestAnimationFrame(animate)
  context.fillStyle = 'black'
  context.fillRect(0, 0, canvas.width, canvas.height)
  background.update()
  shop.update()
  context.fillStyle = 'rgba(255, 255, 255, 0.15)'
  context.fillRect(0, 0, canvas.width, canvas.height)
  player.update(player.position.x > enemy.position.x + (enemy.width / 2))
  enemy.update(/* enemy.position.x > player.position.x */)

  player.velocity.x = 0
  enemy.velocity.x = 0

  // player movement

  if (keys.a.pressed && player.lastKey === 'a') {
    player.velocity.x = -5
    player.switchSprite('run')
  } else if (keys.d.pressed && player.lastKey === 'd') {
    player.velocity.x = 5
    player.switchSprite('run')
  } else {
    player.switchSprite('idle')
  }

  // jumping
  if (player.velocity.y < 0) {
    player.switchSprite('jump')
  } else if (player.velocity.y > 0) {
    player.switchSprite('fall')
  }

  // Enemy movement
  if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
    enemy.velocity.x = -5
    enemy.switchSprite('run')
  } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
    enemy.velocity.x = 5
    enemy.switchSprite('run')
  } else {
    enemy.switchSprite('idle')
  }

  // jumping
  if (enemy.velocity.y < 0) {
    enemy.switchSprite('jump')
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite('fall')
  }

  // detect for collision & enemy gets hit
  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy
    }) &&
    player.isAttacking &&
    player.framesCurrent === 4
  ) {
    enemy.takeHit()
    player.isAttacking = false

    gsap.to('#enemyHealth', {
      width: enemy.health + '%'
    })
  }

  // if player misses
  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false
  }

  // this is where our player gets hit
  if (
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player
    }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 2
  ) {
    player.takeHit()
    enemy.isAttacking = false

    gsap.to('#playerHealth', {
      width: player.health + '%'
    })
  }

  // if player misses
  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false
  }

  // end game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner(player, enemy, timerId)
  }
}

animate()

window.addEventListener('keydown', (event) => {
  if (!player.dead) {
    switch (event.key) {
      case 'd':
        keys.d.pressed = true
        player.lastKey = 'd'
        break
      case 'a':
        keys.a.pressed = true
        player.lastKey = 'a'
        break
      case 'w':
        if (player.velocity.y === 0) {
          player.velocity.y = -20
        }
        break
      case ' ':
        player.attack()
        break
    }
  }

  if (!enemy.dead) {
    switch (event.key) {
      case 'ArrowRight':
        keys.ArrowRight.pressed = true
        enemy.lastKey = 'ArrowRight'
        break
      case 'ArrowLeft':
        keys.ArrowLeft.pressed = true
        enemy.lastKey = 'ArrowLeft'
        break
      case 'ArrowUp':
        if (enemy.velocity.y === 0) {
          enemy.velocity.y = -20
        }
        break
      case 'ArrowDown':
        enemy.attack()

        break
    }
  }
})

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'd':
      keys.d.pressed = false
      break
    case 'a':
      keys.a.pressed = false
      break
  }

  // enemy keys
  switch (event.key) {
    case 'ArrowRight':
      keys.ArrowRight.pressed = false
      break
    case 'ArrowLeft':
      keys.ArrowLeft.pressed = false
      break
  }
})
