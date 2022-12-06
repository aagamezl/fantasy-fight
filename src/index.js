import { Game } from './Game'
import { registerKeyboardEvents } from './InputHandler'

window.addEventListener('load', () => {
  registerKeyboardEvents()
  new Game().start()
})
