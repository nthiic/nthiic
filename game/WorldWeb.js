'use strict';

const sinus = (deg) => Math.sin(deg);

const enableP2phys = (game, arr) => {
  return R.map((object) => game.physics.p2.enable(object, false), arr);
};

const makeStatic = arr => {
  return R.map((object) => object.body.static = true, arr);
};

const distanceBetweenPoints = (x1, y1, x2, y2) => {
  return Math.sqrt( Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) );
};

const vectorAngle = (x1, y1, x2, y2) => {
  return Math.atan2(y2 - y1, x2 - x1 ) * 180 / Math.PI;
};

const addSpite = (game, x, y, name) => game.add.sprite(x, y, name);

const player = (game, conf) => {
  const chinti = game.add.sprite(conf.x, conf.y, conf.name);
  chinti.scale.set(conf.scale);
  chinti.smoothed = conf.smoothed;

  R.map(anim => chinti.animations.add(
    anim.name, anim.frames, anim.frameRate, anim.loop
  ))(conf.animations);

  return chinti;
};

const stopPlayerAnim = (player, stopFrame) => {
  player.animations.stop();
  player.frame = stopFrame;
};

const createWorld = (game, conf) => {
  game.world.setBounds(0, 0, conf.size.width, conf.size.height);
  game.add.tileSprite(0, 0, conf.size.width, conf.size.height, conf.background);

  game.physics.startSystem(conf.startSystem);
  game.physics.p2.gravity.y = conf.p2GravityY;
};
