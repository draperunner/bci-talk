import * as Phaser from 'phaser'

import Load from './load'
import Intro from './intro'
import Play from './play'

export const GAME_WIDTH = 800
export const GAME_HEIGHT = 600

export const CENTER_WIDTH = GAME_WIDTH / 2
export const CENTER_HEIGHT = GAME_HEIGHT / 2

// Initialize Phaser
const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#3498db',
  physics: {
    default: 'arcade',
    arcade: {
        gravity: { y: 300 },
        debug: false
    }
  },
  scene: [Load, Intro, Play]
})

export const config = {
  // Enabled levels as 1-indexed integers
  enabledLevels: [1, 2, 3, 4, 5, 6, 7, 8, 9]
}

// Our game state
export const state = {
  sound: true,
  score: 0,
  resets: 0,
  deaths: 0,
  level: 1,
  debug: false,
  threshold: {
    attention: 40,
    meditation: 40,
    blink: 30
  },
  instructionsStyle: { font: '30px Arial', fill: '#ffffff' },
}

export function getNameOfCurrentLevel(): 'lvl1' | 'lvl2' | 'lvl3' | 'lvl4' | 'lvl5' | 'lvl6' | 'lvl7' | 'lvl8' | 'lvl9' {
  const { level } = state
  const lvl = config.enabledLevels[(level - 1) % config.enabledLevels.length]
  
  switch (lvl) {
    case 1: return 'lvl1'
    case 2: return 'lvl2'
    case 3: return 'lvl3'
    case 4: return 'lvl4'
    case 5: return 'lvl5'
    case 6: return 'lvl6'
    case 7: return 'lvl7'
    case 8: return 'lvl8'
    case 9: return 'lvl9'
  }
}

export function moreLevelsToGo() {
  return state.level < config.enabledLevels.length
}

export default game
