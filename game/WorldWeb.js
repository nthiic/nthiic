'use strict';

const sinus = (deg) => Math.sin(deg);

const enableP2phys = (arr, game) => R.map((e) => game.physics.p2.enable(e, false), arr);

const makeStatic = arr => R.map((e) => e.body.static = true, arr);

const distanceBetweenPoints = (x1, y1, x2, y2) => {
  Math.sqrt( Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) );
};

const vectorAngle = (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1 ) * 180 / Math.PI;

const addSpite = (x, y, name, game) => game.add.sprite(x, y, name);


const player = (game) => {
  const chinti = game.add.sprite(100, 100, 'chinti');
  chinti.scale.set(1);
  chinti.smoothed = false;
  chinti.animations.add('left', [0, 1, 2, 3], 10, true);
  chinti.animations.add('right', [5, 6, 7, 8], 10, true);

  return chinti;
};
