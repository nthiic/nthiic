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
  chinti.body.velocity.x = 0;
  chinti.body.setZeroVelocity();

  if (cursors.left.isDown)
  {
    chinti.body.moveLeft(100);
    chinti.animations.play("left");
  }
  else if (cursors.right.isDown)
  {
    chinti.body.moveRight(100);
    chinti.animations.play("right");
  }
  else
  {
    stopPlayerAnim(chinti, 4);
  }

  if (cursors.up.isDown)
  {
    chinti.body.moveUp(100);
  }
  else if (cursors.down.isDown)
  {
    chinti.body.moveDown(100);
  }
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
