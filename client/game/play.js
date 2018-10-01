import Phaser from 'phaser'
import neurosky from '../neurosky_client'
import game from './game'
import rules from './rules'

const playState = {

  create: function() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Keyboard
    this.cursor = game.input.keyboard.createCursorKeys();
    this.r = game.input.keyboard.addKey(Phaser.Keyboard.R);
    this.d = game.input.keyboard.addKey(Phaser.Keyboard.D);

    // Reset game when r is pressed
    this.r.onDown.add(this.reset, this);

    // Toggle Neurosky debug texts when d key is pressed
    this.d.onDown.add(this.toggleNeuroskyTexts, this);

    // Level
    this.createWorld();
    this.gameOver = false;
    this.horizontalSpeed = 300;
    this.jumpSpeed = 100;

    // Create burgers
    this.burgers = game.add.group();
    this.burgers.enableBody = true;
    this.map.createFromObjects('Object Layer 1', 22, 'burger', 0, true, false, this.burgers);
    this.numberOfBurgers = this.burgers.length;

    // Create lava (deadly tiles)
    this.map.setTileIndexCallback(24, this.reset, this);
    this.map.setTileIndexCallback(26, this.reset, this);

    // Movable objects (elevator, stone, etc.)
    this.movables = game.add.group();
    this.movables.enableBody = true;
    const img = rules.get('movableObject');
    this.map.createFromObjects('Object Layer 1', 23, img, 0, true, false, this.movables);
    this.movables.forEach(function(movable) {
      if (img === 'stone') {
        movable.anchor.setTo(0.5, 1);
      }
      movable.body.immovable = true;
      movable.body.allowGravity = false;
      movable.body.collideWorldBounds = true;
    }, this);

    // Neurosky debug texts
    this.neuroskyTextsEnabled = true;
    const style = { font: '18px Arial', fill: '#ffffff' };
    this.debugAttention = game.add.text(10, 40, 'A: 0', style);
    this.debugMeditation = game.add.text(10, 60, 'M: 0', style);
    this.debugBlink = game.add.text(10, 80, 'B: 0', style);
    this.debugPoorSignalLevel = game.add.text(10, 100, 'S: 0', style);
    this.toggleNeuroskyTexts(); // Hide by default

    // Draw instruction texts
    rules.get('drawInstructions').bind(this)();

    // Mind Power Bar representing neurosky value
    this.mindPowerBar = game.add.sprite(10, 10, 'mindPowerBar');
    this.mindPowerBar.setPercentage = function (percentage) {
      this.scale.x = percentage * 6 / 100;
    };

    // Player
    const result = this.findObjectsByGID(21, this.map, 'Object Layer 1');
    this.originalX = result[0].x;
    this.originalY = result[0].y;
    this.player = game.add.sprite(this.originalX, this.originalY, 'player');
    this.player.anchor.setTo(0.5, 1);
    this.player.animations.add('idle', [0, 1, 2, 3, 4, 5, 6, 7, 8], 10, true);
    this.player.animations.add('run', [9, 10, 11, 12, 13, 14, 15, 16, 17, 18], 20, true);
    this.player.animations.add('fly', [20, 21, 22, 23, 22, 21], 5, true);
    this.player.animations.add('hooray', [30, 31, 32, 33, 34, 34, 34, 34], 10);
    this.player.animations.play('idle');
    game.physics.arcade.enable(this.player);
    this.player.body.gravity.y = (!game.global.debug) ? 500 : 0;
    this.player.body.collideWorldBounds = true;

    // Sprite used to flash screen when blinking
    this.whiteFlash = this.game.add.sprite(0, 0, 'whiteFlash');
    this.whiteFlash.alpha = 0;
    this.whiteFlash.flash = function () {
      const t = game.add.tween(this).to({alpha:1}, 50).start();
      t.onComplete.add(function () {
        game.add.tween(this).to({alpha:0}, 100).start();
      }, this);
    };

    // Sprite used to flash screen when killed. Resets game when done!
    this.redFlash = this.game.add.sprite(0, 0, 'redFlash');
    this.redFlash.alpha = 0;
    this.redFlash.flash = function () {
      const t = game.add.tween(this).to({alpha:1}, 50).start();
      t.onComplete.add(function () {
        game.add.tween(this).to({alpha:0}, 500).start();
      }, this);
    };
  },

  update: function() {
    game.physics.arcade.collide(this.player, this.layer);
    game.physics.arcade.collide(this.player, this.movables);
    game.physics.arcade.overlap(this.player, this.burgers, this.eatBurger, null, this);

    if (this.gameOver) return;

    rules.get('overlapMovable').bind(this)();
    rules.get('doAnimations').bind(this)();
    rules.get('moveMovable').bind(this)();
    rules.get('updateMindPowerBar').bind(this)();

    if (this.neuroskyTextsEnabled) this.updateDebugTexts();
    if (game.global.debug) {
      rules.methods.godModeMove.bind(this)();
      return;
    }
    rules.get('move').bind(this)();
    rules.get('jump').bind(this)();
  },

  reset: function() {
    game.global.deaths += 1;
    this.redFlash.flash();
    this.player.reset(this.originalX, this.originalY);
  },

  eatBurger: function(player, burger) {
    burger.kill();
    this.numberOfBurgers -= 1 ;
    if (this.numberOfBurgers > 0) return;
    this.gameOver = true;
    this.player.body.velocity.x /= 10;
    if (game.global.moreLevelsToGo()) {
      game.global.level += 1;
      this.player.animations.play('hooray').onComplete.add(function () {
        game.state.start('play');
      }, this);
    }
    else {
      game.global.level = 1;
      game.state.start('menu');
    }
  },

  createWorld: function() {
    this.map = game.add.tilemap(game.global.nameOfCurrentLevel());
    this.map.addTilesetImage('tileset');
    this.layer = this.map.createLayer('Tile Layer 1');
    this.layer.resizeWorld();
    this.map.setCollision([2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 19, 20, 24, 26, 27, 28]);
  },

  // Find objects in a Tiled layer that contain a property called "type" equal to a certain value
  findObjectsByGID: function(gid, map, layer) {
    const result = [];
    map.objects[layer].forEach(function(element){
      if(element.gid === gid) {
        element.y -= map.tileHeight;
        result.push(element);
      }
    });
    return result;
  },

  updateDebugTexts: function () {
    this.debugAttention.setText('A: ' + neurosky.attention);
    this.debugMeditation.setText('M: ' + neurosky.meditation);
    this.debugBlink.setText('B: ' + neurosky.blink);
    this.debugPoorSignalLevel.setText('S: ' + neurosky.poorSignalLevel);
  },

  // Returns true if the player is touching a movableObject (elevator or stone)
  playerIsStandingOnMovable: function () {
    const movable = this.movables.getTop();
    if (!movable) return false;
    const boundsA = movable.getBounds();
    const boundsB = this.player.getBounds();
    const playerBottom = new Phaser.Rectangle(boundsB.bottomLeft.x, boundsB.bottomLeft.y, boundsB.width, 1);
    return Phaser.Rectangle.intersects(boundsA, playerBottom);
  },

  toggleNeuroskyTexts: function () {
    this.neuroskyTextsEnabled = !this.neuroskyTextsEnabled;
    this.debugAttention.visible = this.neuroskyTextsEnabled;
    this.debugMeditation.visible = this.neuroskyTextsEnabled;
    this.debugBlink.visible = this.neuroskyTextsEnabled;
    this.debugPoorSignalLevel.visible = this.neuroskyTextsEnabled;
  },

  distanceToGround: function () {
    if (this.player.body.onFloor() || this.playerIsStandingOnMovable()) return 0;
    const ray = new Phaser.Line(this.player.x, this.player.y, this.player.x, game.world.height);
    const tileHits = this.layer.getRayCastTiles(ray, 10, true, true);
    if (tileHits.length === 0) return game.world.height - this.player.y;
    return tileHits[0].y * tileHits[0].height - this.player.y;
  }
};

export default playState
