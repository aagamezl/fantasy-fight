import { Game } from './Game'
import { FigterState } from './contants/fighter'

const populateMoveDropdown = () => {
  const dropdown = document.querySelector('#state-dropdown')

  Object.entries(FigterState).forEach(([, value]) => {
    const option = document.createElement('option')

    option.setAttribute('value', value)
    option.innerText = value
    dropdown.appendChild(option)
  })
}

window.addEventListener('load', () => {
  populateMoveDropdown()

  new Game().start()
})
