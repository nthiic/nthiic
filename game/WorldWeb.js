'use strict';

const sinus = (deg) => Math.sin(deg);

const enableP2phys = (arr, game) => {
  return R.map((e) => game.physics.p2.enable(e, false), arr);
};

const makeStatic = arr => {
  return R.map((e) => e.body.static = true, arr);
};

const distanceBetweenPoints = (x1, y1, x2, y2) => {
  return Math.sqrt( Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) );
};

const vectorAngle = (x1, y1, x2, y2) => {
  return Math.atan2(y2 - y1, x2 - x1 ) * 180 / Math.PI;
};

const addSpite = (x, y, name, game) => game.add.sprite(x, y, name);

const player = (game, config) => {
  const c = config;
  const chinti = game.add.sprite(c.x, c.y, c.name);
  chinti.scale.set(c.scale);
  chinti.smoothed = c.smoothed;

  let addAnim = R.map(obj => chinti.animations.add(
    obj.name, obj.frames, obj.frameRate, obj.loop
  ));

  addAnim(c.animations);

  return chinti;
};

const stopPlayerAnim = (player, stopFrame) => {
  player.animations.stop();
  player.frame = stopFrame;
};
