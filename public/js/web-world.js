(function () {
  let chinti,
      cursors,
      spacebar,
      line,
      thread,
      platforms;

  /**
   * Return random integer
   *
   * @this {Window}
   * @params {number} min - from minimum
   * @params {number} max - to maximum
   * @return {number} random number
   */

  const randMinMax = (min, max) => game.rnd.integerInRange(min, max);
  const mapIndexed = R.addIndex(R.map); // can use index in func

  /**
   * New game object node
   *
   * @this {Window}
   * @params {number} x - coordinate on axis x
   * @params {number} y - coordinate on axis y
   */

  const drawNode = (x, y) => {
    let node = game.add.sprite(x, y, "node", 0);
    node.scale.set(1);
    node.anchor.set(0.5);
  };

  const preload = () => {
    game.load.spritesheet("node", "assets/img/node.svg", 15, 15);
    game.load.image("thread", "assets/img/web.svg");
    game.load.image("floor", "assets/img/floor.svg");
    game.load.spritesheet('chinti', 'assets/img/dude.svg', 32, 48);
  };

  const fromDoc = () => {
    //game.world.randomY
    //game.world.randomX
    //game.world.centerX
    //game.world.centerY
  };

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
    let len = 150 / 10; // 150 is width of assets/img/web.svg aka thread
    let rope;

    const createPoints = (x) => new Phaser.Point(x * len, 0);
    const setAxisYAnim = (elm, idx) => elm.y = Math.sin( idx * 0.5 + count ) * 2;
    const points = R.map(createPoints, R.range(0, 10));

    rope = game.add.rope(100, 100, 'thread', null, points);
    rope.scale.setTo(1, 1);
    mapIndexed(setAxisYAnim, points);

    rope.updateAnimation = () => {
      count += 0.1;
      mapIndexed(setAxisYAnim, points);
    };
  };

  const create = () => {
    let ground, floorScale;

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
    ground = platforms.create(0, window.innerHeight - 5, "floor");
    // 100 is width of floor.svg
    floorScale = window.innerWidth / 100;

    ground.scale.setTo(floorScale, 1);
    ground.body.immovable = true;
  };

  const update = () => {
    let hitPlatform = game.physics.arcade.collide(chinti, platforms);

    cursors = game.input.keyboard.createCursorKeys();
    spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    chinti.body.velocity.x = 0;

    const moveChinti = (value, side) => {
      chinti.body.velocity.x = value;
      chinti.animations.play(side);
    };

    const stopChintiAnim = () => {
      chinti.animations.stop();
      chinti.frame = 4;
    };

    if (cursors.left.isDown) {
      moveChinti(-150, 'left');
    } else if (cursors.right.isDown) {
      moveChinti(150, 'right');
    } else {
      stopChintiAnim();
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
