import Phaser from 'phaser'

export default class Menu extends Phaser.Scene {
  constructor() {
    super({
      key: 'Menu',
      active: false
    })
  }

  create() {
    const { width, height } = this.cameras.main
    const centerX = width / 2
    const centerY = height / 2
    this.cameras.setBackgroundColor = '#3498db'
    // Name of the game
    const nameLabel = this.add.text(centerX, 100, 'Brain Boy', { font: '60px Arial', fill: '#ffffff' })
    nameLabel.setOrigin(0.5, 0.5)

    // How to play
    const lbl1 = this.add.text(centerX, centerY-60, "Eat all burgers to win", { font: '40px Arial', fill: '#ffffff' })
    lbl1.setOrigin(0.5, 0.5)
    const lbl2 = this.add.text(centerX, centerY+20, "Press r to restart", { font: '30px Arial', fill: '#ffffff' })
    lbl2.setOrigin(0.5, 0.5)
    const lbl3 = this.add.text(centerX, centerY+60, "Press up to jump", { font: '30px Arial', fill: '#ffffff' })
    lbl3.setOrigin(0.5, 0.5)
    const lbl4 = this.add.text(centerX, centerY+100, "Use attention to fly", { font: '30px Arial', fill: '#ffffff' })
    lbl4.setOrigin(0.5, 0.5)

    // How to start the game
    const startLabel = this.add.text(centerX, height-80, 'press the up arrow key to start', { font: '25px Arial', fill: '#ffffff' })
    startLabel.setOrigin(0.5, 0.5)
    // this.add.tween(startLabel).to({angle: -2}, 500).to({angle:2}, 500).loop().start()

    // Start the game when the up arrow key is pressed
    this.input.keyboard.on('keydown_UP', () => {
      this.scene.start('Play')
    })
  }
}
