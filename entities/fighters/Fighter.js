export class Fighter {
  constructor (name, x, y, velocity) {
    this.animationFrame = 1
    this.animationTimer = 0
    this.frames = new Map()
    this.image = new window.Image()
    this.name = name
    this.position = { x, y }
    this.velocity = velocity
  }

  draw (context) {
    const [x, y, width, height] = this.frames.get(`forwards-${this.animationFrame}`)

    context.drawImage(this.image, x, y, width, height, this.position.x, this.position.y, width, height)
  }

  update (time, context) {
    const [, , width] = this.frames.get(`forwards-${this.animationFrame}`)

    if (time.previous > this.animationTimer + 60) {
      this.animationTimer = time.previous

      this.animationFrame++

      if (this.animationFrame > 6) {
        this.animationFrame = 1
      }
    }

    this.position.x += this.velocity * time.secondsPassed

    if (this.position.x > context.canvas.width - width || this.position.x < 0) {
      this.velocity = -this.velocity
    }
  }
}
