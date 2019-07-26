import * as Phaser from 'phaser'
import neurosky from '../neurosky_client'
import game, { state, getNameOfCurrentLevel, moreLevelsToGo, CENTER_WIDTH, CENTER_HEIGHT, GAME_HEIGHT, GAME_WIDTH } from './game'
import rules from './rules'

export default class Play extends Phaser.Scene {
  cursors: Phaser.Input.Keyboard.CursorKeys = undefined
  
  whiteFlash: Phaser.GameObjects.Sprite = undefined
  redFlash: Phaser.GameObjects.Sprite = undefined
  
  neuroskyTextsEnabled: boolean = true
  gameOver: boolean = false
  numberOfBurgers: number = 0
  horizontalSpeed: number = 300
  jumpSpeed: number = 100

  burgers: Phaser.GameObjects.Group = undefined
  movables: Phaser.GameObjects.Group = undefined

  map: Phaser.Tilemaps.Tilemap = undefined
  layer: Phaser.Tilemaps.StaticTilemapLayer = undefined

  player: Phaser.Physics.Arcade.Sprite = undefined
  attentionBar: Phaser.GameObjects.Sprite = undefined
  meditationBar: Phaser.GameObjects.Sprite = undefined

  originalX: number = undefined
  originalY: number = undefined

  constructor() {
    super({
      key: 'Play',
      active: false
    })
  }
  
  create() {
    // Keyboard
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown_R', this.reset)
    this.input.keyboard.on('keydown_D', this.toggleNeuroskyTexts)
    this.input.keyboard.on('keydown_SPACE', this.goToNextLevel)

    // Level
    this.createWorld()

    this.gameOver = false

    // Create burgers
    this.burgers = this.physics.add.staticGroup()
    const burgerObjects = this.map.createFromObjects('Object Layer 1', 22, { key: 'burger' })
    this.burgers.addMultiple(burgerObjects)
    this.numberOfBurgers = this.burgers.getLength()

    // Create lava (deadly tiles)
    this.map.setTileIndexCallback(24, this.reset, this)
    this.map.setTileIndexCallback(26, this.reset, this)

    // Movable objects (elevator, stone, etc.)
    const img = rules.get('movableObject')
    this.movables = this.physics.add.group()
    const movableObjects = this.map.createFromObjects('Object Layer 1', 23, { key: img })
    movableObjects.forEach((movable: Phaser.GameObjects.Sprite) => {
      movable.setScale(1) 
      movable.setOrigin(0.5, 1)
      this.movables.add(movable)
    })

    this.movables.children.entries.forEach(movable => {
      const body = <Phaser.Physics.Arcade.Body>movable.body
      body.setImmovable(true)
      body.setMass(0)
      body.setCollideWorldBounds(true)
    })

    // Neurosky debug texts
    // this.neuroskyTextsEnabled = true
    // const style = { font: '18px Arial', fill: '#ffffff' }
    // this.debugAttention = this.add.text(10, 40, 'A: 0', style)
    // this.debugMeditation = this.add.text(10, 60, 'M: 0', style)
    // this.debugBlink = this.add.text(10, 80, 'B: 0', style)
    // this.debugPoorSignalLevel = this.add.text(10, 100, 'S: 0', style)
    // this.toggleNeuroskyTexts() // Hide by default

    // Draw instruction texts
    rules.get('drawInstructions').bind(this)()

    // Mind Power Bar representing neurosky value
    this.attentionBar = this.add.sprite(0, GAME_HEIGHT, 'mindPowerBar').setOrigin(0, 1).setTint(0xff3333)
    this.meditationBar = this.add.sprite(GAME_WIDTH - 20, GAME_HEIGHT, 'mindPowerBar').setOrigin(0, 1).setTint(0x33ff33)

    // Player
    interface PlayerObject {
      flippedAntiDiagonal: boolean;
      flippedHorizontal: boolean;
      flippedVertical: boolean;
      gid: number;
      height: number;
      id: number;
      name: string;
      properties: {};
      rotation: number;
      type: string;
      visible: boolean;
      width: number;
      x: number;
      y: number;
    }

    const result = <PlayerObject[]><unknown[]>this.findObjectsByGID(21, this.map, 'Object Layer 1')
    
    this.originalX = result[0].x
    this.originalY = result[0].y
    
    this.player = this.physics.add.sprite(this.originalX, this.originalY, 'player')

    // this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);  
    this.player.setOrigin(0.5, 1)
    this.player.anims.play('idle', true)
    
    this.player.on('animationcomplete', (animation: Phaser.Animations.Animation) => {
      if (animation.key === 'hooray') {
        this.scene.restart()
      }
    });
    
    this.physics.add.collider(this.player, this.layer);
    this.physics.add.collider(this.burgers, this.layer);
    this.physics.add.collider(this.movables, this.layer);
    this.physics.add.collider(this.player, this.movables);
    this.physics.add.overlap(this.player, this.burgers, this.eatBurger, null, this);
    this.physics.add.overlap(this.player, this.movables, (player, movable) => {
      if (movable && (<Phaser.Physics.Arcade.Sprite>movable).texture.key === 'stone') {
        this.reset()
      }
    }, null, this);

    // Sprite used to flash screen when blinking
    this.whiteFlash = this.add.sprite(CENTER_WIDTH, CENTER_HEIGHT, 'whiteFlash')
    this.whiteFlash.alpha = 0

    // Sprite used to flash screen when killed. Resets game when done!
    this.redFlash = this.add.sprite(CENTER_WIDTH, CENTER_HEIGHT, 'redFlash')
    this.redFlash.alpha = 0
  }
  
  update() {
    if (this.gameOver) return

    rules.get('overlapMovable').bind(this)()
    rules.get('doAnimations').bind(this)()
    rules.get('moveMovable').bind(this)()
    rules.get('updateMindPowerBar').bind(this)()

    // if (this.neuroskyTextsEnabled) this.updateDebugTexts()
    if (state.debug) {
      rules.methods.godModeMove.bind(this)()
      return
    }
    rules.get('move').bind(this)()
    rules.get('jump').bind(this)()
  }

  reset = () => {
    state.deaths += 1
    
    this.add.tween({
      targets: [this.redFlash],
      ease: 'Sine.easeInOut',
      duration: 1000,
      delay: 0,
      alpha: {
        getStart: () => 1,
        getEnd: () => 0
      },
    });
    this.player.setPosition(this.originalX, this.originalY)
  }

  goToNextLevel = () => {
    if (moreLevelsToGo()) {
      state.level += 1
      this.scene.restart()
    } else {
      state.level = 1
      this.scene.start('menu')
    }
  }

  eatBurger(player: Phaser.Physics.Arcade.Sprite, burger: Phaser.GameObjects.Sprite) {
    burger.destroy(false)

    if (this.gameOver) return
    
    this.numberOfBurgers -= 1
    if (this.numberOfBurgers > 0) return
    
    this.gameOver = true
    
    this.player.body.velocity.x /= 10
    if (moreLevelsToGo()) {
      state.level += 1
      this.player.anims.play('hooray')
    } else {
      state.level = 1
      this.scene.start('menu')
    }
  }

  createWorld() {
    this.map = this.add.tilemap(getNameOfCurrentLevel())
    const tileset = this.map.addTilesetImage('tileset', 'tileset', 20, 20)
    this.layer = this.map.createStaticLayer('Tile Layer 1', tileset, 0, 0)
    this.layer.setCollisionBetween(0, 1000)
  }

  // Find objects in a Tiled layer that contain a property called "type" equal to a certain value
  findObjectsByGID(gid: number, map: Phaser.Tilemaps.Tilemap, layer: string) {
    const result: Phaser.GameObjects.GameObject[] = []

    const objectLayer = map.objects.find(obj => obj.name === layer)
    
    objectLayer.objects.forEach((element: any) => {
      if (element.gid === gid) {
        element.y -= map.tileHeight
        result.push(element)  
      }
    })

    return result
  }

  updateDebugTexts() {
    // this.debugAttention.setText('A: ' + neurosky.attention)
    // this.debugMeditation.setText('M: ' + neurosky.meditation)
    // this.debugBlink.setText('B: ' + neurosky.blink)
    // this.debugPoorSignalLevel.setText('S: ' + neurosky.poorSignalLevel)
  }

  // Returns true if the player is touching a movableObject (elevator or stone)
  playerIsStandingOnMovable() {
    const movable = this.movables.getFirstAlive()
    if (!movable) return false
    const boundsA = movable.getBounds()
    const boundsB = this.player.getBounds()
    const playerBottom = new Phaser.Geom.Rectangle(boundsB.left, boundsB.bottom, boundsB.width, 1)
    return Phaser.Geom.Rectangle.Overlaps(boundsA, playerBottom)
  }

  toggleNeuroskyTexts() {
    // this.neuroskyTextsEnabled = !this.neuroskyTextsEnabled
    // this.debugAttention.visible = this.neuroskyTextsEnabled
    // this.debugMeditation.visible = this.neuroskyTextsEnabled
    // this.debugBlink.visible = this.neuroskyTextsEnabled
    // this.debugPoorSignalLevel.visible = this.neuroskyTextsEnabled
  }
}
