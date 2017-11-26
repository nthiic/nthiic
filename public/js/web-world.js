(function () {
  let chinti,
      cursors,
      spacebar,
      line,
      thread,
      platforms;

  const preload = () => {
    game.load.spritesheet("node", "assets/img/node.svg", 15, 15);
    game.load.image("thread", "assets/img/web.svg");
    game.load.image("floor", "assets/img/floor.svg");
    game.load.spritesheet('chinti', 'assets/img/dude.svg', 32, 48);
  };

  const fromDoc = () => {
    /*
      var coins = game.add.group();
      for (var i = 0; i < 20; i++)
      {
      coins.create(game.world.randomX, game.world.randomY, 'coin', 0);
      }
    */

    //game.world.centerX
    //game.world.centerY

  };

  // draw web
  const drawWeb = (len, fn) => {
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

      x = game.width  * ( x * 0.96875 + 0.5 );
      y = game.height * ( y * 0.96875 + 0.5 );

      vertices[i] = [x, y];
    }

    let triangles = Delaunay.triangulate(vertices);

    let bmd = game.add.bitmapData(game.width, game.height);
    var color = 'white';
    bmd.ctx.strokeStyle = color;
    bmd.ctx.lineWidth = "1.5";
    let sprite = game.add.sprite(0, 0, bmd);

    for(i = triangles.length; i; )
    {
      bmd.ctx.beginPath();
      --i;
      bmd.ctx.moveTo(vertices[triangles[i]][0], vertices[triangles[i]][1]);
      fn(vertices[triangles[i]][0], vertices[triangles[i]][1]);

      --i;
      bmd.ctx.lineTo(vertices[triangles[i]][0], vertices[triangles[i]][1]);
      fn(vertices[triangles[i]][0], vertices[triangles[i]][1]);

      --i;
      bmd.ctx.lineTo(vertices[triangles[i]][0], vertices[triangles[i]][1]);
      fn(vertices[triangles[i]][0], vertices[triangles[i]][1]);

      bmd.ctx.closePath();
      bmd.ctx.stroke();
    }
  };

  // draw Rope
  const drawRope = () => {
    let count = 0;
    let length = 150 / 10;
    let points = [];

    for (let i = 0; i < 10; i++)
    {
      points.push(new Phaser.Point(i * length, 0));
    }

    let rope = game.add.rope(100, 100, 'thread', null, points);
    rope.scale.setTo(1, 1);

    rope.updateAnimation = function() {
      count += 0.1;

      for (let i = 0; i < this.points.length; i++)
      {
        this.points[i].y = Math.sin(i * 0.5 + count) * 2;
      }
    };
  };

  // draw node
  const drawNode = (x, y) => {
    let node = game.add.sprite(x, y, "node", 0);
    node.scale.set(1);
    node.anchor.set(0.5);
  };

  const create = () => {
    // random generator
    const randMinMax = (min, max) => game.rnd.integerInRange(min, max);

    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.stage.backgroundColor = '#333333';

    chinti = game.add.sprite(0, game.world.height - 100, 'chinti');
    chinti.scale.setTo(.8, .8);
    chinti.animations.add('left', [0, 1, 2, 3], 10, true);
    chinti.animations.add('right', [5, 6, 7, 8], 10, true);

    game.physics.arcade.enable(chinti);

    chinti.body.bounce.y = 0.3;
    chinti.body.gravity.y = 300;
    chinti.body.collideWorldBounds = true;

    platforms = game.add.group();
    platforms.enableBody = true;

    drawRope();
    drawWeb(100, drawNode);

    // 5 is height of floor.svg
    let ground = platforms.create(0, window.innerHeight - 5, "floor");
    // 100 is width of floor.svg
    let floorScale = window.innerWidth / 100;

    ground.scale.setTo(floorScale, 1);
    ground.body.immovable = true;
  };

  const update = () => {
    let hitPlatform = game.physics.arcade.collide(chinti, platforms);

    cursors = game.input.keyboard.createCursorKeys();
    spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    chinti.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
      chinti.body.velocity.x = -150;
      chinti.animations.play('left');
    }
    else if (cursors.right.isDown)
    {
      chinti.body.velocity.x = 150;
      chinti.animations.play('right');
    }
    else
    {
      chinti.animations.stop();
      chinti.frame = 4;
    }

    if (cursors.up.isDown && chinti.body.touching.down || spacebar.isDown)
    {
      chinti.body.velocity.y = -250;
    }
  };

  const render = () => {
    //game.debug.geom(line);
    //game.debug.lineInfo(line, 32, 32);
  };

  const game = new Phaser.Game(
    window.innerWidth,
    window.innerHeight,
    Phaser.AUTO,
    '',
    {
      preload: preload,
      create: create,
      update: update,
      render: render
    }
  );

}());
