import { STAGE_FLOOR } from '../../contants/stage'

export class Shadow {
  constructor (fighter) {
    this.fighter = fighter
    this.frame = [[0, 0, 79, 12], [39, 6]]
    this.image = document.querySelector('img[alt="shadow"]')
  }

  draw (context) {
    const [
      [x, y, width, height],
      [originX, originY]
    ] = this.frame

    const scale = 1 - (STAGE_FLOOR - this.fighter.position.y) / 250

    context.globalAlpha = 0.5
    context.drawImage(
      this.image,
      x,
      y,
      width,
      height,
      Math.floor(this.fighter.position.x - originX * scale),
      Math.floor(STAGE_FLOOR - originY * scale),
      Math.floor(width * scale),
      Math.floor(height * scale)
    )

    context.globalAlpha = 1
  }

  update () {

  }
}
