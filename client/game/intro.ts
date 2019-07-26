import * as Phaser from 'phaser'
import neurosky from '../neurosky_client'
import game, { state, getNameOfCurrentLevel, moreLevelsToGo, CENTER_WIDTH, CENTER_HEIGHT, GAME_HEIGHT, GAME_WIDTH } from './game'
import rules from './rules'

export default class Intro extends Phaser.Scene {
  cursors: Phaser.Input.Keyboard.CursorKeys = undefined
  
  whiteFlash: Phaser.GameObjects.Sprite = undefined
  
  attentionBar: Phaser.GameObjects.Sprite = undefined
  meditationBar: Phaser.GameObjects.Sprite = undefined

  attentionText: Phaser.GameObjects.Text = undefined
  meditationText: Phaser.GameObjects.Text = undefined

  constructor() {
    super({
      key: 'Intro',
      active: false,
    })
  }
  
  create() {
    // Keyboard
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown_SPACE', () => this.scene.start('Play'))

    // Draw instruction texts
    this.attentionText = this.add.text(CENTER_WIDTH - 100, CENTER_HEIGHT - 30, '<---- Attention: 0', state.instructionsStyle)
      .setOrigin(0.5)

    this.meditationText = this.add.text(CENTER_WIDTH + 100, CENTER_HEIGHT + 30, `Meditation: 0 ---->`, state.instructionsStyle)
      .setOrigin(0.5)

    // Mind Power Bar representing neurosky value
    this.attentionBar = this.add.sprite(0, GAME_HEIGHT, 'mindPowerBar').setOrigin(0, 1).setTint(0xff3333)
    this.meditationBar = this.add.sprite(GAME_WIDTH - 20, GAME_HEIGHT, 'mindPowerBar').setOrigin(0, 1).setTint(0x33ff33)

    // Sprite used to flash screen when blinking
    this.whiteFlash = this.add.sprite(CENTER_WIDTH, CENTER_HEIGHT, 'whiteFlash')
    this.whiteFlash.alpha = 0
  }

  update() {
    rules.defaults.updateMindPowerBar.bind(this)()

    this.attentionText.setText(`<---- Attention: ${neurosky.attention}`)
    this.meditationText.setText(`Meditation: ${neurosky.meditation} ---->`)

    if (neurosky.blink > state.threshold.blink) {
      this.add.tween({
        targets: [this.whiteFlash],
        ease: 'Sine.easeInOut',
        duration: 1000,
        delay: 0,
        alpha: {
          getStart: () => 1,
          getEnd: () => 0
        },
      });
      neurosky.blink = 0
    }

    // if (this.neuroskyTextsEnabled) this.updateDebugTexts()
    if (state.debug) {
      rules.methods.godModeMove.bind(this)()
      return
    }
  }
}
