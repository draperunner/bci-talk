const Phaser = require('phaser')

const bootState = require('./boot')
const loadState = require('./load')
const menuState = require('./menu')
const playState = require('./play')

// Initialize Phaser
const game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameDiv');

// Enabled levels as 1-indexed integers
game.config.enabledLevels = [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 9];

// Our 'global' variable
game.global = {
  sound: true,
  score: 0,
  resets: 0,
  level: 1,
  debug: false,
  threshold: {
    attention: 40,
    meditation: 40,
    blink: 30
  },
  instructionsStyle: { font: '30px Arial', fill: '#ffffff' },
  moreLevelsToGo: function () {
    return this.level < game.config.enabledLevels.length;
  },
  nameOfCurrentLevel: function () {
    return 'lvl' + (this.debug ? this.level : game.config.enabledLevels[this.level - 1]);
  }
};

// Define states
game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('play', playState);

// Start the "boot" state
game.state.start('boot');

// // helper codes
// const debug = {
//   on: function () {
//     game.global.debug = true;
//     game.state.start('play');
//     console.log('Debug mode on');
//   },
//   off: function () {
//     game.global.debug = false;
//     game.state.start('play');
//     console.log('Debug mode off');
//   },
//   // If actual is true, n represents the name of the actual level
//   // If actual is false, n is treated as 1-indexed index of enabledLevels
//   level: function (n, actual) {
//     this.on();
//     if (!actual && (n > game.config.enabledLevels.length || n < 0)) {
//       console.log(n + " is out of range of enabledLevels array.");
//       return;
//     }
//     game.global.level = actual ? n : game.config.enabledLevels[n - 1];
//     game.state.start('play');
//   }
// };

export default game
