"use strict";

let chinti, cursors;

const preload = () => {
  game.load.image('background', '/public/img/concrete.png');
  game.load.image('thread', '/public/img/thread.svg', 150, 3);
  game.load.image('node', '/public/img/node.svg', 15, 15);
  game.load.spritesheet('chinti', '/public/img/dude.svg', 32, 48);
};

const create = () => {
  let w = window.innerWidth;
  let h = window.innerHeight;

  game.world.setBounds(0, 0, w, h);
  game.add.tileSprite(0, 0, w, h, 'background');

  game.physics.startSystem(Phaser.Physics.P2JS);
  game.physics.p2.gravity.y = 10;

  chinti = player(game);
  enableP2phys([chinti], game);

  cursors = game.input.keyboard.createCursorKeys();
};

const update = () => {
  chinti.body.velocity.x = 0;

  const stopChintiAnim = () => {
    chinti.animations.stop();
    chinti.frame = 4;
  };

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
    stopChintiAnim();
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
