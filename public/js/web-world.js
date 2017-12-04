(function () {
  'use strict';

  let concrete, cursors, chinti;

  const preload = () => {
    game.load.image('background', 'assets/img/concrete.png');
    game.load.image('thread', 'assets/img/thread.svg', 150, 3);
    game.load.image('node', 'assets/img/node.svg', 15, 15);
    game.load.spritesheet('chinti', 'assets/img/dude.svg', 32, 48);
  };

  const sinus = (deg) => Math.sin(deg);

  const createWeb = (len, fn) => {
    let vertices = new Array(len), i, x, y;
    let graphics = game.add.graphics();

    graphics.lineStyle(1, 0xffffff, 1);

    for (i = vertices.length; i--;)
    {
      do
      {
        x = Math.random() - 0.5;
        y = Math.random() - 0.5;

      } while(x * x + y * y > 0.25);

      x = game.width  * ( x * sinus(360) + 0.5  );
      y = game.height * ( y * sinus(360) + 0.5  );

      vertices[i] = [x, y];
    }

    let triangles = Delaunay.triangulate(vertices);
    let bmd = game.add.bitmapData(game.width, game.height);
    let color = 'white';

    bmd.ctx.strokeStyle = color;
    bmd.ctx.lineWidth = "1.5";

    let sprite = game.add.sprite(0, 0, bmd);
    let points = new Array();

    for(i = triangles.length; i; )
    {
      bmd.ctx.beginPath();

      --i;
      bmd.ctx.moveTo(vertices[triangles[i]][0], vertices[triangles[i]][1]);
      points.push({x: vertices[triangles[i]][0], y:vertices[triangles[i]][1] });

      --i;
      bmd.ctx.lineTo(vertices[triangles[i]][0], vertices[triangles[i]][1]);
      points.push({x: vertices[triangles[i]][0], y:vertices[triangles[i]][1] });

      --i;
      bmd.ctx.lineTo(vertices[triangles[i]][0], vertices[triangles[i]][1]);
      points.push({x: vertices[triangles[i]][0], y:vertices[triangles[i]][1] });

      bmd.ctx.closePath();
      bmd.ctx.stroke();
    }

    points = R.uniq(points);

    console.log(points);

    for (let j = 0; j < points.length; j++)
    {
      //fn(points[j].x, points[j].y);

      if (j !== points.length - 1)
      {
        let angle = Math.atan2(points[j+1].y - points[j].y, points[j+1].x - points[j].x ) * 180 / Math.PI;
        createRope(points[j].x, points[j].y, points[j+1].x, points[j+1].y);
        //createRope(10, points[j].x, points[j].y);
        //drawRope(points[j].x, points[j].y, angle, Math.sqrt( Math.pow(points[j+1].x - points[j].x, 2) + Math.pow(points[j+1].y - points[j].y, 2) ));
        //console.log(Math.sqrt( Math.pow(points[j+1].x - points[j].x, 2) + Math.pow(points[j+1].y - points[j].y, 2) ));

      }
      else
      {
        createRope(points[j].x, points[j].y, points[0].x, points[0].y);
        //createRope(10, points[j].x, points[j].y);
        //let angle = Math.atan2(points[j].y - points[j-1].y, points[j].x - points[j-1].x ) * 180 / Math.PI;
        //drawRope(points[j].x, points[j].y, angle,  Math.sqrt( Math.pow(points[j].x - points[j-1].x, 2) + Math.pow(points[j].y - points[j-1].y, 2) ) );
      }
    }
  };

  const player = () => {
    const obj = game.add.sprite(100, 100, 'chinti');
    obj.scale.set(1);
    obj.smoothed = false;
    obj.animations.add('left', [0, 1, 2, 3], 10, true);
    obj.animations.add('right', [5, 6, 7, 8], 10, true);

    return obj;
  };

  const create = () => {
    let worldConfig = {
      w: window.innerWidth,
      h: window.innerHeight
    };

    // World size
    game.world.setBounds(0, 0, worldConfig.w, worldConfig.h);
    game.add.tileSprite(0, 0, worldConfig.w, worldConfig.h, 'background');

    // Enable P2 and it will use the updated world size
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.gravity.y = 10;

    chinti = player();
    game.physics.p2.enable(chinti, false);

    createWeb(3);

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

  const enableP2phys = arr => R.map((e) => game.physics.p2.enable(e, false), arr);
  const makeStatic = arr => R.map((e) => e.body.static = true, arr);
  const distanceBetweenPoints = (x1, y1, x2, y2) => Math.sqrt( Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) );
  const vectorAngle = (x1, y1, x2, y2) => Math.atan2(y2 - y1, x2 - x1 ) * 180 / Math.PI;
  const addSpite = (x, y, name) => game.add.sprite(x, y, name);

  const createRope = (startX, startY, endX, endY) => {
    let start = addSpite(startX, startY, "node");
    let end   = addSpite(endX, endY, "node");
    let force = 20000;

    enableP2phys([start, end]);
    makeStatic([start, end]);

    const dist = distanceBetweenPoints(endX, startX, endY, startY);
    const ceil = Math.ceil( R.divide(dist, 20) );

    //console.log( vectorAngle(startX, startY, endX, endY) );

    let cntPntsX = Math.ceil( (endX-startX) / 15 );
    let disPntsX = (endX-startX) / cntPntsX;
    let disPntsY = (endY-startY) / cntPntsX;

    console.log(disPntsY);

    for (let x = 0; x < cntPntsX; x++)
    {
      let posY = (startY + disPntsY * x) - 7.5;
      let posX = (startX + disPntsX * x) - 7.5;

      let spt = addSpite(posX, posY, "node");

      game.physics.p2.enable(spt, false);
      spt.body.setRectangle(15, 15);

      game.physics.p2.createRevoluteConstraint(spt, [0, 0], end, [0, 0], force);
      game.physics.p2.createRevoluteConstraint(spt, [0, 0], start, [0, 0], force);

      start.bringToTop();
      end.bringToTop();
    }

    const fillSpace = () => {

    };
  };

  /*
    let newRect;
    const createRope = (length, xAnchor, yAnchor) => {
    let lastRect,
    height = 15,        //  Height for the physics body - your image height is 30px
    width = 15,         //  This is the width for the physics body. If too small the rectangles will get scrambled together.
    maxForce = 100;   //  The force that holds the rectangles together.

    for (let i = 0; i <= length; i++)
    {
    var x = xAnchor;                    //  All rects are on the same x position
    var y = yAnchor + (i * height);     //  Every new rect is positioned below the last

    if (i % 2 === 0)
    {
    //  Add sprite (and switch frame every 2nd time)
    newRect = game.add.sprite(x, y, 'node', 1);
    }
    else
    {
    newRect = game.add.sprite(x, y, 'node', 0);
    lastRect.bringToTop();
    }

    //  Enable physicsbody
    game.physics.p2.enable(newRect, false);

    //  Set custom rectangle
    newRect.body.setRectangle(width, height);

    if (i === 0 || i === length)
    {
    newRect.body.static = true;
    }
    else
    {
    //  Anchor the first one created
    newRect.body.velocity.x = 1;      //  Give it a push :) just for fun
    newRect.body.mass = length / i;     //  Reduce mass for evey rope element
    }

    //  After the first rectangle is created we can add the constraint
    if (lastRect)
    {
    game.physics.p2.createRevoluteConstraint(newRect, [0, -10], lastRect, [0, 10], maxForce);
    }

    lastRect = newRect;
    newRect.body.angle = -90;
    }
    };
  */

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
}());
