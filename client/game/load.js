import Phaser from 'phaser'
import game from './game'

const loadState = {

  preload: function () {
    // Add a loading label
    const loadingLabel = game.add.text(game.world.centerX, 150, 'loading...', { font: '30px Arial', fill: '#ffffff' });
    loadingLabel.anchor.setTo(0.5, 0.5);

    // Add a progress bar
    const progressBar = game.add.sprite(game.world.centerX, 200, 'progressBar');
    progressBar.anchor.setTo(0.5, 0.5);
    game.load.setPreloadSprite(progressBar);

    // Player character. Credits to Darklink990 (http://darklink990.deviantart.com/art/Basic-Human-Sprites-97396818)
    game.load.spritesheet('player', 'assets/player.png', 30, 35);

    // Load all assets
    game.load.spritesheet('mute', 'assets/muteButton.png', 28, 22);
    game.load.image('burger', 'assets/burger.png');
    game.load.image('elevator', 'assets/elevator.png');
    game.load.image('stone', 'assets/stone.png');
    game.load.image('whiteFlash', 'assets/white_flash.png');
    game.load.image('redFlash', 'assets/red_flash.png');
    game.load.image('mindPowerBar', 'assets/progressBar.png');

    game.load.image('tileset', 'assets/finalTileset.png');
    game.load.tilemap('lvl1', 'lvl/lvl1.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.tilemap('lvl2', 'lvl/lvl2.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.tilemap('lvl3', 'lvl/lvl3.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.tilemap('lvl4', 'lvl/lvl4.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.tilemap('lvl5', 'lvl/lvl5.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.tilemap('lvl6', 'lvl/lvl6.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.tilemap('lvl7', 'lvl/lvl7.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.tilemap('lvl8', 'lvl/lvl8.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.tilemap('lvl9', 'lvl/lvl9.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.tilemap('lvl10', 'lvl/lvl10.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.tilemap('lvl11', 'lvl/lvl11.json', null, Phaser.Tilemap.TILED_JSON);
  },

  create: function() {
    game.state.start('menu');
  }
};

export default loadState
