import { Control, controls, GamepadThumbstick } from './contants/control'
import { FighterDirection } from './contants/fighter'

const heldKeys = new Set()
const gamePads = new Map()

const handleGamepadConnected = (event) => {
  const { gamepad: { index, axes, buttons } } = event

  gamePads.set(index, { axes, buttons })
}
const handleGamepadDisconnected = (event) => {
  const { gamepad: { index } } = event

  gamePads.delete(index)
}

const handleKeyDown = (event) => {
  if (!mappedKeys.includes(event.code)) {
    return
  }

  event.preventDefault()

  heldKeys.add(event.code)
}

const handleKeyUp = (event) => {
  if (!mappedKeys.includes(event.code)) {
    return
  }

  event.preventDefault()

  heldKeys.delete(event.code)
}

const mappedKeys = controls.map(({ keyboard }) => Object.values(keyboard)).flat()

export const pollGamePads = () => {
  for (const gamePad of navigator.getGamepads()) {
    if (!gamePad) {
      continue
    }

    if (gamePads.has(gamePad.index)) {
      const { index, axes, buttons } = gamePad

      gamePads.set(index, { axes, buttons })
    }
  }
}

export const registerGamepadEvents = () => {
  window.addEventListener('gamepadconnected', handleGamepadConnected)
  window.addEventListener('gamepaddisconnected', handleGamepadDisconnected)
}

export const registerKeyboardEvents = () => {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
}

export const isKeyDown = (code) => heldKeys.has(code)
export const isKeyUp = (code) => !heldKeys.has(code)

export const isButtonDown = (padId, button) => {
  return gamePads.get(padId)?.buttons[button].pressed
}
export const isButtonUp = (padId, button) => !gamePads.get(padId)?.buttons[button].pressed

export const isAxeGreater = (padId, axeId, value) => gamePads.get(padId)?.axes[axeId] >= value
export const isAxeLower = (padId, axeId, value) => gamePads.get(padId)?.axes[axeId] <= value

export const isDown = (id) => {
  return isKeyDown(controls[id].keyboard[Control.DOWN]) ||
    isButtonDown(id, controls[id].gamePad[Control.DOWN]) ||
    isAxeGreater(
      id,
      controls[id].gamePad[GamepadThumbstick.VERTICAL_AXE_ID],
      controls[id].gamePad[GamepadThumbstick.DEAD_ZONE]
    )
}

export const isIdle = (id) => isLeft(id) || isRigt(id) || isUp(id) || isDown(id)

export const isLeft = (id) => {
  return isKeyDown(controls[id].keyboard[Control.LEFT]) ||
    isButtonDown(id, controls[id].gamePad[Control.LEFT]) ||
    isAxeLower(
      id,
      controls[id].gamePad[GamepadThumbstick.HORIZONTAL_AXE_ID],
      -controls[id].gamePad[GamepadThumbstick.DEAD_ZONE]
    )
}

export const isRigt = (id) => {
  return isKeyDown(controls[id].keyboard[Control.RIGHT]) ||
    isButtonDown(id, controls[id].gamePad[Control.RIGHT]) ||
    isAxeGreater(
      id,
      controls[id].gamePad[GamepadThumbstick.HORIZONTAL_AXE_ID],
      controls[id].gamePad[GamepadThumbstick.DEAD_ZONE]
    )
}

export const isUp = (id) => {
  return isKeyDown(controls[id].keyboard[Control.UP]) ||
    isButtonDown(id, controls[id].gamePad[Control.UP]) ||
    isAxeLower(
      id,
      controls[id].gamePad[GamepadThumbstick.VERTICAL_AXE_ID],
      -controls[id].gamePad[GamepadThumbstick.DEAD_ZONE]
    )
}

export const isForward = (id, direction) => direction === FighterDirection.RIGHT ? isRigt(id) : isLeft(id)
export const isBackward = (id, direction) => direction === FighterDirection.LEFT ? isRigt(id) : isLeft(id)
