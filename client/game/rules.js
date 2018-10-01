import Phaser from 'phaser'
import neurosky from '../neurosky_client'
import game from './game'

const rules = {

  // Some standard methods that might be used multiple places
  methods: {
    classicHorizontalMove: function () {
      // Horizontal movement
      if (this.cursor.left.isDown) {
        this.player.body.velocity.x = -1 * this.horizontalSpeed;
      } else if (this.cursor.right.isDown) {
        this.player.body.velocity.x = this.horizontalSpeed;
      } else {
        this.player.body.velocity.x = 0;
      }
    },
    classicJump: function () {
      if (this.cursor.up.isDown && (this.player.body.onFloor() || this.playerIsStandingOnMovable())) {
        this.player.body.velocity.y = -1 * this.jumpSpeed * 2;
      }
    },
    blinkJump: function () {
      if (neurosky.blink > game.global.threshold.blink  && this.player.body.onFloor()) {
        this.player.body.velocity.y = -4 * this.jumpSpeed;
        this.whiteFlash.flash();
        neurosky.blink = 0;
      }
    },
    attentionFly: function () {
      if (neurosky.attention > game.global.threshold.attention) {
        this.player.body.velocity.y = -1 * this.jumpSpeed;
      }
    },
    blinkFall: function () {
      if (neurosky.blink > game.global.threshold.blink) {
        const d = this.distanceToGround();
        if (d > 60) this.player.y += 50;
        this.whiteFlash.flash();
        neurosky.blink = 0;
      }
    },
    moveAndFly: function () {
      rules.methods.classicHorizontalMove.bind(this)();
      rules.methods.attentionFly.bind(this)();
      rules.methods.blinkFall.bind(this)();
    },
    godModeMove: function () {
      // Horizontal movement
      rules.methods.classicHorizontalMove.bind(this)();
      // Vertical movement
      if (this.cursor.up.isDown) {
        this.player.body.velocity.y = -2 * this.jumpSpeed;
      } else if (this.cursor.down.isDown) {
        this.player.body.velocity.y = 2 * this.jumpSpeed;
      } else {
        this.player.body.velocity.y = 0;
      }
    },
    defaultDoAnimations: function () {
      // Set scale based on horizontal velocity. Avoid setting scale to 0.
      const dir = Math.sign(this.player.body.velocity.x);
      if (dir != 0) this.player.scale.x = dir;
      // Play appropriate animation
      const onFloor = this.player.body.onFloor();
      const onMovable = this.playerIsStandingOnMovable();
      if (onFloor || onMovable) {
        this.player.animations.play(dir === 0 ? 'idle' : 'run');
      } else if (!onFloor && !onMovable) {
        this.player.animations.play('fly');
      }
    },
    // Updates mind power bar according to attention value
    mindPowerAttention: function () {
      this.mindPowerBar.setPercentage(neurosky.attention);
      this.mindPowerBar.tint = (neurosky.attention > game.global.threshold.attention) ? 0x00ff00 : 0xffffff;
    },
    // Updates mind power bar according to meditation value
    mindPowerMeditation: function () {
      this.mindPowerBar.setPercentage(neurosky.meditation);
      this.mindPowerBar.tint = (neurosky.meditation > game.global.threshold.meditation) ? 0x00ff00 : 0xffffff;
    }
  },

  // Default behavior for levels that not have been specifically configured.
  defaults: {
    move: function () { rules.methods.moveAndFly.bind(this)(); },
    jump: function () { rules.methods.classicJump.bind(this)(); },
    movableObject: '',
    moveMovable: function () {},
    overlapMovable: function () {},
    doAnimations: function () { rules.methods.defaultDoAnimations.bind(this)(); },
    drawInstructions: function () {},
    updateMindPowerBar: function () { rules.methods.mindPowerAttention.bind(this)(); }
  },

  // Function that returns requested property for given level. If it doesn't exist, the default is used.
  get: function (propertyName) {
    const level = game.global.nameOfCurrentLevel();
    if (rules.hasOwnProperty(level) && rules[level].hasOwnProperty(propertyName)) {
      return rules[level][propertyName];
    }
    return rules.defaults[propertyName];
  },

  // (Optional) Specific configuration for each level follows. Object name must start with 'lvl' followed by number of level.
  lvl1: {
    drawInstructions: function () {
      game.add.text(game.world.centerX, 200, 'Pay attention, and you will fly. Blink, and you will fall', game.global.instructionsStyle)
        .anchor.set(0.5);
    }
  },
  lvl2: {
    drawInstructions: function () {
      game.add.text(game.world.centerX, game.world.height - 30, 'Only meditation lifts the stone', game.global.instructionsStyle)
        .anchor.set(0.5);
    },
    move: function () { rules.methods.classicHorizontalMove.bind(this)(); },
    movableObject: 'stone',
    moveMovable: function () {
      if (this.movables.children.length === 0) return;
      const stone = this.movables.getTop();
      const target = 310 - 1.5 * neurosky.meditation;
      const distance = target - stone.y;

      if (Math.abs(distance) < 5) {
        stone.body.velocity.y = 0;
      } else if (Math.sign(distance) === 1) {
        stone.body.velocity.y = 60;
      } else {
        stone.body.velocity.y = Math.sign(distance) * 30;
      }
    },
    overlapMovable: function () {
      const stone = this.movables.getTop();
      if (!stone || stone.body.velocity.y <= 0) return;
      const boundsA = stone.getBounds();
      const boundsB = this.player.getBounds();
      if (Phaser.Rectangle.intersects(boundsA, boundsB) && this.player.body.onFloor()) {
        this.reset();
      }
    },
    updateMindPowerBar: function () { rules.methods.mindPowerMeditation.bind(this)(); }
  },
  lvl3: {
    drawInstructions: function () {
      game.add.text(game.world.centerX + 80, game.world.height - 30, 'Move the elevator with attention', game.global.instructionsStyle)
        .anchor.set(0.5);
    },
    move: function () { rules.methods.classicHorizontalMove.bind(this)(); },
    movableObject: 'elevator',
    moveMovable: function () {
      if (this.movables.children.length === 0) return;
      const target = 510 - 4 * neurosky.attention;
      const elevator = this.movables.getTop();
      const distance = target - elevator.y;
      elevator.body.velocity.y = (Math.abs(distance) < 5) ? 0 : Math.sign(distance) * 30;
    }
  },
  lvl4: {
    drawInstructions: function () {
      game.add.text(game.world.centerX, 60, 'Attention = flying, blinking = falling', game.global.instructionsStyle)
        .anchor.set(0.5);
    }
  },
  lvl5: {
    drawInstructions: function () {
      game.add.text(game.world.centerX, 60, 'Attention for flying, blink for dropping', game.global.instructionsStyle)
        .anchor.set(0.5);
    }
  },
  lvl6: {
    drawInstructions: function () {
      game.add.text(80, 80, 'Attention is flying, blinking dropping. Still.', game.global.instructionsStyle);
    }
  },
  lvl7: {
    drawInstructions: function () {
      game.add.text(game.world.centerX, game.world.height - 40, 'Blink to jump!', game.global.instructionsStyle)
        .anchor.set(0.5);
    },
    move: function () { rules.methods.classicHorizontalMove.bind(this)(); },
    jump: function () { rules.methods.blinkJump.bind(this)(); }
  },
  lvl8: {
    drawInstructions: function () {
      game.add.text(game.world.centerX + 200, 100, 'Attention is flying again', game.global.instructionsStyle)
        .anchor.set(0.5);
      game.add.text(game.world.centerX + 200, 150, 'Drop with blink', game.global.instructionsStyle)
        .anchor.set(0.5);
    }
  },
  lvl9: {
    drawInstructions: function () {
      game.add.text(game.world.centerX, game.world.height - 40, 'Attention for flying, blink for dropping', game.global.instructionsStyle)
        .anchor.set(0.5);
    }
  }
};

export default rules
