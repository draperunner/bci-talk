import * as Phaser from 'phaser'
import neurosky from '../neurosky_client'
import game, { state, config, getNameOfCurrentLevel, moreLevelsToGo } from './game'
import rules from './rules'

export default class Play extends Phaser.Scene {
 constructor() {
    super({
      key: 'Load',
      active: true
    })
  }
  
  preload() {
    this.load.spritesheet('player', 'assets/imgs/player.png', { frameWidth: 30, frameHeight: 35 });
    this.load.image('burger', 'assets/imgs/burger.png')
    this.load.image('elevator', 'assets/imgs/elevator.png')
    this.load.image('stone', 'assets/imgs/stone.png')
    this.load.image('whiteFlash', 'assets/imgs/white_flash.png')
    this.load.image('redFlash', 'assets/imgs/red_flash.png')
    this.load.image('mindPowerBar', 'assets/imgs/progressBar.png')

    this.load.image('tileset', 'assets/imgs/finalTileset.png')
    this.load.tilemapTiledJSON('lvl1', 'assets/lvl/lvl1.json')
    this.load.tilemapTiledJSON('lvl2', 'assets/lvl/lvl2.json')
    this.load.tilemapTiledJSON('lvl3', 'assets/lvl/lvl3.json')
    this.load.tilemapTiledJSON('lvl4', 'assets/lvl/lvl4.json')
    this.load.tilemapTiledJSON('lvl5', 'assets/lvl/lvl5.json')
    this.load.tilemapTiledJSON('lvl6', 'assets/lvl/lvl6.json')
    this.load.tilemapTiledJSON('lvl7', 'assets/lvl/lvl7.json')
    this.load.tilemapTiledJSON('lvl8', 'assets/lvl/lvl8.json')
    this.load.tilemapTiledJSON('lvl9', 'assets/lvl/lvl9.json')
    this.load.tilemapTiledJSON('lvl10', 'assets/lvl/lvl10.json')
    this.load.tilemapTiledJSON('lvl11', 'assets/lvl/lvl11.json')
  }
  
  create() {
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 8 }),
      frameRate: 10,
      repeat: -1
    })
  
    this.anims.create({
      key: 'run',
      frames: this.anims.generateFrameNumbers('player', { start: 9, end: 18 }),
      frameRate: 20,
      repeat: -1
    })
  
    this.anims.create({
      key: 'fly',
      frames: this.anims.generateFrameNumbers('player', { frames: [20, 21, 22, 23, 22, 21] }),
      frameRate: 5,
      repeat: -1
    })
  
    this.anims.create({
      key: 'hooray',
      frames: this.anims.generateFrameNumbers('player', { frames: [30, 31, 32, 33, 34, 34, 34, 34] }),
      frameRate: 10,
    })

    this.scene.start('Intro')
  }
}
