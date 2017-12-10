'use strict';

const sinus = (deg) => Math.sin(deg);

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

const createWorld = (game, conf) => {
  game.world.setBounds(0, 0, conf.size.width, conf.size.height);
  game.add.tileSprite(0, 0, conf.size.width, conf.size.height, conf.background);

  game.physics.startSystem(conf.startSystem);
  game.physics.p2.gravity.y = conf.p2GravityY;
};

const createArrPoints = (game, len) => {
  let vertices, points, triangles, i, x, y;

  vertices = new Array(len);
  for (i = vertices.length; i--;)
  {
    do
    {
      x = Math.random() - 0.5;
      y = Math.random() - 0.5;
    } while (x * x + y * y > 0.25);

    x = game.width  * ( x * sinus(360) + 0.5  );
    y = game.height * ( y * sinus(360) + 0.5  );

    vertices[i] = [x, y];
  }

  triangles = Delaunay.triangulate(vertices);
  points = new Array();
  for (i = triangles.length; i;)
  {
    --i; points.push({x: vertices[triangles[i]][0], y:vertices[triangles[i]][1] });
    --i; points.push({x: vertices[triangles[i]][0], y:vertices[triangles[i]][1] });
    --i; points.push({x: vertices[triangles[i]][0], y:vertices[triangles[i]][1] });
  }

  return points;
};

const createNode = (game, conf) => {
  R.map( obj => {
    let sprite = game.add.sprite(obj.x, obj.y, conf.sprite);
    game.physics.p2.enable(sprite, false);

    sprite.body.static = true;
  })(R.uniq(conf.points));
};

const createRope = (game, startX, startY, endX, endY) => {
  let start = game.add.sprite(startX, startY, 'bead'),
      end   = game.add.sprite(endX, endY, 'bead'),
      force = 20000;

  game.physics.p2.enable(start, false);
  game.physics.p2.enable(end, false);

  start.body.static = true;
  end.body.static   = true;

  let dist     = distanceBetweenPoints(endX, startX, endY, startY),
      ceil     = Math.ceil( dist / 6 ),
      cntPntsX = Math.ceil( Math.abs(endX - startX) / 6 ),
      disPntsX = (endX-startX) / cntPntsX,
      disPntsY = (endY-startY) / cntPntsX;

  console.log(
    "dist:%s ceil:%s cntPntsX:%s disPntsX:%s disPntsY:%s",
    dist, ceil, cntPntsX, disPntsX, disPntsY
  );

  for (let x = 0; x < cntPntsX; x++)
  {
    let posY   = (startY + disPntsY * x);
    let posX   = (startX + disPntsX * x);
    let sprite = game.add.sprite(posX, posY, 'bead');

    game.physics.p2.enable(sprite, false);
    sprite.body.setRectangle(6, 6);
    sprite.body.static = true;

    game.physics.p2.createRevoluteConstraint(sprite, [0, 0], end, [0, 0], force);
    game.physics.p2.createRevoluteConstraint(sprite, [0, 0], start, [0, 0], force);

    start.bringToTop();
  }
};

const playerMovements = (player, cursors, conf) => {
  player.body.velocity.x = conf.velocityX;
  player.body.setZeroVelocity();

  switch(true) {
  case cursors.left.isDown:
    player.body.moveLeft(conf.moves.left.step);
    player.animations.play(conf.moves.left.anim);
    break;
  case cursors.right.isDown:
    player.body.moveRight(conf.moves.right.step);
    player.animations.play(conf.moves.right.anim);
    break;
  case cursors.up.isDown:
    player.body.moveUp(conf.moves.up.step);
    break;
  case cursors.down.isDown:
    player.body.moveDown(conf.moves.down.step);
    break;
  default:
    player.animations.stop();
    player.frame = conf.stopFrame;
    break;
  };
};
