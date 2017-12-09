"use strict";

let chinti, cursors;

const preload = () => {
  game.load.image('background', '/public/img/concrete.png');
  game.load.image('thread', '/public/img/thread.svg', 150, 3);
  game.load.image('node', '/public/img/node.svg', 15, 15);
  game.load.spritesheet('chinti', '/public/img/dude.svg', 32, 48);
};

const create = () => {
  createWorld(game, {
    size: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    background: 'background',
    startSystem: Phaser.Physics.P2JS,
    p2GravityY: 10
  });

  chinti = player(game, {
    x: 100,
    y: 100,
    name: 'chinti',
    scale: 1,
    animations: {
      left: {
        name: 'left',
        frames: [0, 1, 2, 3],
        frameRate: 10,
        loop: true
      },
      right: {
        name: 'right',
        frames: [5, 6, 7, 8],
        frameRate: 10,
        loop: true
      }
    },
    smoothed: false
  });

  enableP2phys(game, [chinti]);
  cursors = game.input.keyboard.createCursorKeys();
};

const update = () => {
  playerMovements(chinti, cursors, {
    velocity: {
      x: 0,
      y: 0
    },
    moves: {
      left: {
        step: 100,
        anim: 'left'
      },
      right: {
        step: 100,
        anim: 'right'
      },
      up: {
        step: 100,
        anim: ''
      },
      down: {
        step: 100,
        anim: ''
      }
    },
    stopFrame: 4
  });
};

const game = new Phaser.Game(
  window.innerWidth,
  window.innerHeight,
  Phaser.AUTO,
  '',
  {
    preload: preload,
    create: create,
    update: update
  }
);
