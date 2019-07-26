import * as Phaser from 'phaser'
import neurosky from '../neurosky_client'
import { state, getNameOfCurrentLevel, GAME_HEIGHT, CENTER_WIDTH } from './game'

let justBlinked = false

// Some standard methods that might be used multiple places
const rules = {
  methods: {
    classicHorizontalMove: function () {
      // Horizontal movement
      const onFloor = this.player.body.onFloor()
      if (this.cursors.left.isDown) {
        this.player.body.velocity.x = -1 * this.horizontalSpeed * (onFloor ? 1 : 0.7)
      } else if (this.cursors.right.isDown) {
        this.player.body.velocity.x = this.horizontalSpeed * (onFloor ? 1 : 0.7)
      } else {
        this.player.body.velocity.x = 0
      }
    },
    classicJump: function () {
      if (this.cursors.up.isDown && (this.player.body.onFloor() || this.playerIsStandingOnMovable())) {
        this.player.body.velocity.y = -1 * this.jumpSpeed * 2
      }
    },
    blinkJump: function () {
      if (neurosky.blink > state.threshold.blink  && this.player.body.onFloor()) {
        this.player.body.velocity.y = -4 * this.jumpSpeed
        this.whiteFlash.flash()
        neurosky.blink = 0
      }
    },
    attentionFly: function () {
      if (neurosky.attention > state.threshold.attention && !justBlinked) {
        this.player.body.velocity.y = -1 * this.jumpSpeed
      }
    },
    blinkFall: function () {
      if (neurosky.blink > state.threshold.blink) {
        console.log('Blink!');
        justBlinked = true
        setTimeout(() => { justBlinked = false }, 2000)
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
        // const d = this.distanceToGround()
        // const d = 1000
        // if (d > 60) this.player.y += 50
        neurosky.blink = 0
      }
    },
    moveAndFly: function () {
      rules.methods.classicHorizontalMove.bind(this)()
      rules.methods.attentionFly.bind(this)()
      rules.methods.blinkFall.bind(this)()
    },
    godModeMove: function () {
      // Horizontal movement
      rules.methods.classicHorizontalMove.bind(this)()
      // Vertical movement
      if (this.cursors.up.isDown) {
        this.player.body.velocity.y = -2 * this.jumpSpeed
      } else if (this.cursors.down.isDown) {
        this.player.body.velocity.y = 2 * this.jumpSpeed
      } else {
        this.player.body.velocity.y = 0
      }
    },
    defaultDoAnimations: function () {
      // Set scale based on horizontal velocity. Avoid setting scale to 0.
      const dir = Math.sign(this.player.body.velocity.x)
      if (dir !== 0) this.player.setFlip(dir < 0, false)
      
      // Play appropriate animation
      const onFloor = this.player.body.onFloor()
      const onMovable = this.playerIsStandingOnMovable()
      
      if (onFloor || onMovable) {
        this.player.anims.play(dir === 0 ? 'idle' : 'run', true)
      } else if (!onFloor && !onMovable) {
        this.player.anims.play('fly')
      }
    },
    // Updates mind power bar according to attention value
    mindPowerAttention: function () {
      const percentage = neurosky.attention
      this.attentionBar.setScale(1, percentage * (GAME_HEIGHT / 100) / 100)
    },
    // Updates mind power bar according to meditation value
    mindPowerMeditation: function () {
      const percentage = neurosky.meditation
      this.meditationBar.setScale(1, percentage * (GAME_HEIGHT / 100) / 100)
    }
  },

  // Default behavior for levels that not have been specifically configured.
  defaults: {
    move: function () { rules.methods.moveAndFly.bind(this)() },
    jump: function () { rules.methods.classicJump.bind(this)() },
    movableObject: '',
    moveMovable: function () {},
    overlapMovable: function () {},
    doAnimations: function () { rules.methods.defaultDoAnimations.bind(this)() },
    drawInstructions: function () {},
    updateMindPowerBar: function () { 
      rules.methods.mindPowerAttention.bind(this)()
      rules.methods.mindPowerMeditation.bind(this)()
     }
  },

  // Function that returns requested property for given level. If it doesn't exist, the default is used.
  get: function (propertyName: 'move' | 'jump' | 'movableObject' | 'moveMovable' | 'overlapMovable' | 'doAnimations' | 'drawInstructions' | 'updateMindPowerBar'): any {
    const level: 'lvl1' | 'lvl2' | 'lvl3' | 'lvl4' | 'lvl5' | 'lvl6' | 'lvl7' | 'lvl8' | 'lvl9' = getNameOfCurrentLevel()
    const prop: any = rules[level]
    if (prop && prop[propertyName]) {
      return prop[propertyName]
    }
    return rules.defaults[propertyName]
  },

  // (Optional) Specific configuration for each level follows. Object name must start with 'lvl' followed by number of level.
  lvl1: {
    drawInstructions: function () {
      this.add.text(CENTER_WIDTH, 200, 'Pay attention, and you will fly. Blink, and you will fall', state.instructionsStyle)
        .setOrigin(0.5)
    }
  },
  lvl2: {
    drawInstructions: function () {
      this.add.text(CENTER_WIDTH, GAME_HEIGHT - 30, 'Only meditation lifts the stone', state.instructionsStyle)
        .setOrigin(0.5)
    },
    move: function () { rules.methods.classicHorizontalMove.bind(this)() },
    movableObject: 'stone',
    moveMovable: function () {
      if (this.movables.children.length === 0) return
      const stone = this.movables.getFirstAlive()

      if (!stone) return
      
      const target = 310 - 1.5 * neurosky.meditation
      const distance = target - stone.y

      if (Math.abs(distance) < 5) {
        stone.body.velocity.y = 0
      } else if (Math.sign(distance) === 1) {
        stone.body.velocity.y = 60
      } else {
        stone.body.velocity.y = Math.sign(distance) * 30
      }
    },
    overlapMovable: function () {
      const stone = this.movables.getFirst()
      if (!stone || stone.body.velocity.y <= 0) return
      const boundsA = stone.getBounds()
      const boundsB = this.player.getBounds()
      if (Phaser.Geom.Rectangle.Overlaps(boundsA, boundsB) && this.player.body.onFloor()) {
        this.reset()
      }
    },
  },
  lvl3: {
    drawInstructions: function () {
      this.add.text(CENTER_WIDTH + 80, GAME_HEIGHT - 30, 'Move the elevator with attention', state.instructionsStyle)
        .setOrigin(0.5)
    },
    move: function () { rules.methods.classicHorizontalMove.bind(this)() },
    movableObject: 'elevator',
    moveMovable: function () {
      if (this.movables.children.length === 0) return
      const target = 510 - 4 * neurosky.attention
      const elevator = this.movables.getFirstAlive()

      const distance = target - elevator.y
      elevator.body.velocity.y = (Math.abs(distance) < 5) ? 0 : Math.sign(distance) * 30
    }
  },
  lvl4: {
    drawInstructions: function () {
      this.add.text(CENTER_WIDTH, 60, 'Attention = flying, blinking = falling', state.instructionsStyle)
        .setOrigin(0.5)
    }
  },
  lvl5: {
    drawInstructions: function () {
      this.add.text(CENTER_WIDTH, 60, 'Attention for flying, blink for dropping', state.instructionsStyle)
        .setOrigin(0.5)
    }
  },
  lvl6: {
    drawInstructions: function () {
      this.add.text(80, 80, 'Attention is flying, blinking dropping. Still.', state.instructionsStyle)
    }
  },
  lvl7: {
    drawInstructions: function () {
      this.add.text(CENTER_WIDTH, GAME_HEIGHT - 40, 'Blink to jump!', state.instructionsStyle)
        .setOrigin(0.5)
    },
    move: function () { rules.methods.classicHorizontalMove.bind(this)() },
    jump: function () { rules.methods.blinkJump.bind(this)() }
  },
  lvl8: {
    drawInstructions: function () {
      this.add.text(CENTER_WIDTH + 200, 100, 'Attention is flying again', state.instructionsStyle)
        .setOrigin(0.5)
      this.add.text(CENTER_WIDTH + 200, 150, 'Drop with blink', state.instructionsStyle)
        .setOrigin(0.5)
    }
  },
  lvl9: {
    drawInstructions: function () {
      this.add.text(CENTER_WIDTH, GAME_HEIGHT - 40, 'Attention for flying, blink for dropping', state.instructionsStyle)
        .setOrigin(0.5)
    }
  }
}

export default rules
