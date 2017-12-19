/**
 * Classes
 */
var constructors = {
	Circle : Circle,
	Point : Point,
	Obstacle : Obstacle,
	Particle : Particle,
	Spring : Spring,
	Sim : Sim,
	Rope : Rope	
};
 
function Circle(x, y, radius){
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.clone = function(){
    return new Circle(this.x, this.y, this.radius);
  };
  this.save = function(){
	  return {
		type : 'Circle',
		x : this.x,  
		y : this.y,  
		radius : this.radius  
	  };
  };
  this.load = function(obj){
	for(var k in obj){
		this[k] = obj[k];
	}
	return this;
  };  
}

 function Point(x, y, fixed){
  this.x = x;
  this.y = y;
  this.fixed = fixed;
  this.clone = function(){
    return new Point(this.x, this.y, this.fixed);
  };
  this.equals = function(obj){
	  return this.x == obj.x && this.y == obj.y;
  };
  this.save = function(){
	  return {
		type : 'Point',
		x : this.x,
		y : this.y,
		fixed : this.fixed
	  };
  };
  this.load = function(obj){
	for(var k in obj){
		this[k] = obj[k];
	}
	return this;
  };
}

function Obstacle(x, y, radius){
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.uid = getNewUID();
  this.clone = function(){
    return new Obstacle(this.x, this.y, this.radius);
  };
    this.save = function(){
	  return {
		type : 'Obstacle',
		x : this.x,  
		y : this.y,
		radius : this.radius,
		uid : this.uid
	  };
  };
  this.load = function(obj){
	for(var k in obj){
		this[k] = obj[k];
	}
	return this;
  };
}

function Dude(){}
Dude.prototype = {
	SPEED : 1,
	A_SPEED : 0.1,
	RADUIS : 8,
	FOV : 60,
	PAW_LEN : 30,
	
	constructor : Dude,
	
	head : '',
	body : '',
	tail : '',
	
	myTarg : '',
	dx : '',
	dy : '',
	kx : '',
	ky : '',
	angle : 0,	
	tmpAngle : 0,	
	
	save : function (){
		var res = {
			type : 'Dude'
		};
		for(var k in this){
			if(typeof this[k] != 'function'){
				if(this[k]['save']){
					res[k] = this[k].save();
				}else{
					res[k] = this[k];
				}
			}
		}
		return res;
	},
	
	load : function (obj){
		for(var k in obj){
			if(obj[k]['type']){
				//composite
				if(constructors[obj[k]['type']]){
					var field = new constructors[obj[k]['type']]().load(obj[k]);
					this[k] = field;
				}
			}else{
				this[k] = obj[k];
			}		
		}
		return this;
	},
	
	init : function(x, y){
		this.x = x;
		this.y = y;
		
		this.head = new Circle(this.x, this.y, this.RADUIS);		
		this.body = new Circle(this.x, this.y + this.RADUIS * 2, this.RADUIS);
		this.tail = new Circle(this.x, this.y + this.RADUIS * 4, this.RADUIS);
		return this;
	},
	
	step : function(targ, env, ropes, canvas) {
		var ctx = canvas.getContext('2d');
		if(targ){
			var toCollide = false;
			//new course
			if(!targ.equals(this.myTarg)){
				this.myTarg = targ.clone();
				this.resetCourse();
			}else{
				//check collision course				
				ctx.lineWidth = 2;
				ctx.strokeStyle = "#ff00ff";
				var pawPI = Math.PI / 2;
				var tips = [
						new Point(this.head.x + this.FOV * this.kx, this.head.y + this.FOV * this.ky),
						new Point(this.head.x + this.FOV * Math.cos(this.tmpAngle + 0.2), this.head.y - this.FOV * Math.sin(this.tmpAngle + 0.2)),
						new Point(this.head.x + this.FOV * Math.cos(this.tmpAngle - 0.2), this.head.y - this.FOV * Math.sin(this.tmpAngle - 0.2)),
						
						new Point(this.head.x + this.FOV * Math.cos(this.tmpAngle + 0.4), this.head.y - this.FOV * Math.sin(this.tmpAngle + 0.4)),
						new Point(this.head.x + this.FOV * Math.cos(this.tmpAngle - 0.4), this.head.y - this.FOV * Math.sin(this.tmpAngle - 0.4)),
						///////////////paws?
						new Point(this.head.x + this.PAW_LEN * Math.cos(this.tmpAngle + pawPI), this.head.y - this.PAW_LEN * Math.sin(this.tmpAngle + pawPI)),
						new Point(this.head.x + this.PAW_LEN * Math.cos(this.tmpAngle - pawPI), this.head.y - this.PAW_LEN * Math.sin(this.tmpAngle - pawPI)),
						
						new Point(this.body.x + this.PAW_LEN * Math.cos(this.tmpAngle + pawPI), this.body.y - this.PAW_LEN * Math.sin(this.tmpAngle + pawPI)),
						new Point(this.body.x + this.PAW_LEN * Math.cos(this.tmpAngle - pawPI), this.body.y - this.PAW_LEN * Math.sin(this.tmpAngle - pawPI)),
						
						new Point(this.tail.x + this.PAW_LEN * Math.cos(this.tmpAngle + pawPI), this.tail.y - this.PAW_LEN * Math.sin(this.tmpAngle + pawPI)),
						new Point(this.tail.x + this.PAW_LEN * Math.cos(this.tmpAngle - pawPI), this.tail.y - this.PAW_LEN * Math.sin(this.tmpAngle - pawPI))
					];

				toCollide = this.checkCollisionCourse(tips, env, ropes);
				switch(toCollide){					
					case 'left'://not sure about this one
						ctx.strokeStyle = "#ff0000";
						this.tmpAngle += this.A_SPEED;
					break
					case 'right':
					case 'sensors':
						ctx.strokeStyle = "#ff0000";
						this.tmpAngle -= this.A_SPEED;
					break;
				}
				if(!toCollide && this.tmpAngle !== this.angle){
					var dAngle = this.tmpAngle - this.angle;
					if(Math.abs(dAngle) < this.A_SPEED){
						this.resetCourse();
					}else{						
						this.tmpAngle -= this.A_SPEED * (Math.abs(dAngle) / dAngle);
					}
				}
				this.kx = Math.cos(this.tmpAngle);
				this.ky = -Math.sin(this.tmpAngle);
				// Draw the angle - debug
				ctx.beginPath();
				for(var t = 0; t < tips.length; t++){
					var start = t >= tips.length - 2 ? this.tail : (t >= tips.length - 4 ? this.body : this.head);
					ctx.moveTo(start.x, start.y);
					ctx.lineTo(tips[t].x, tips[t].y);
				}
				ctx.stroke();
			}
			
			this.tail.x = this.body.x - this.kx * this.RADUIS * 2;
			this.tail.y = this.body.y - this.ky * this.RADUIS * 2;
			 
			this.body.x = this.head.x - this.kx * this.RADUIS * 2;
			this.body.y = this.head.y - this.ky * this.RADUIS * 2;
			 
			this.head.x += this.kx * this.SPEED;
			this.head.y += this.ky * this.SPEED;
			
			if(Math.abs(this.head.x - this.myTarg.x) <= this.SPEED &&
				Math.abs(this.head.y - this.myTarg.y) <= this.SPEED){
					targetPoint = null;
					alert('point reached');
				}
		}
		
		ctx.beginPath();

		ctx.arc(this.head.x, this.head.y, this.head.radius, Math.PI * 2, false);
		ctx.arc(this.body.x, this.body.y, this.body.radius, Math.PI * 2, false);
		ctx.arc(this.tail.x, this.tail.y, this.tail.radius, Math.PI * 2, false);
		
		ctx.fillStyle = 'blue';
		ctx.strokeStyle = 'black';
		ctx.fill();
	},
	resetCourse : function(){
		this.dx = this.myTarg.x - this.head.x;
		this.dy = this.myTarg.y - this.head.y;
		
		this.tmpAngle = this.angle = Math.atan2(this.dx, this.dy) - Math.PI / 2;

		this.kx = Math.cos(this.tmpAngle);
		this.ky = -Math.sin(this.tmpAngle);
	},
	checkCollisionCourse : function(tips, env, ropes){		
		for(var t = 0; t < tips.length; t++){
			var start = t >= tips.length - 2 ? this.tail : (t >= tips.length - 4 ? this.body : this.head);
			for(var k in env){
				if(lineCircleCollide(start, tips[t], env[k])){
					if(t >= tips.length - 6){
						//legs
						return t % 2 == 0 ? 'left' : 'right';
					}
					return 'sensors';
				}				
			}
			for(var i = 0; i < ropes.length; i++){
				for(var o = 0; o < ropes[i].sim.springs.length; o++){
					var spr = ropes[i].sim.springs[o];
					var intersects = checkLineIntersection(spr.p1.x, spr.p1.y, spr.p2.x, spr.p2.y, 
															start.x, start.y, tips[t].x, tips[t].y);
					if(intersects){
						if(t >= tips.length - 6){
							//legs
							return t % 2 == 0 ? 'left' : 'right';
						}
						return 'sensors';
					}
				}
			}
		}
		return false;
	}
}
//////////////////////////
/////////Rope/////////////
//////////////////////////
function Particle(x, y, fixed) {
	this.type = 'Particle';
	this.x = x || 0;
	this.y = y || 0;
	this.ox = this.x;
	this.oy = this.y;
	this.mass = 1.0;
	this.massInv = 1.0 / this.mass;
	this.fixed = fixed;
	this.update = function () {};
	this.save = function(){
	  var res = {};
	  for(var k in this){
		  if(typeof this[k] != 'function'){
			  res[k] = this[k];
		  }
	  }
	  return res;
		
  };
  this.load = function(obj){
	for(var k in obj){
		this[k] = obj[k];
	}
	return this;
  };  
}

function Spring(){}
Spring.prototype = {
	constructor : Spring,
	type : 'Spring',
	p1 : '',
	p2 : '',
	restLength : '',
	strength : '',
	init : function(p1, p2, restLength, strength){
		this.type = 'Spring';
		this.p1 = p1;
		this.p2 = p2;
		this.restLength = restLength || 10;
		this.strength = strength || 1.0;
		return this;
	},
	update : function () {
		// Compute desired force
		var dx = this.p2.x - this.p1.x,
			dy = this.p2.y - this.p1.y + 1,
			dd = Math.sqrt(dx * dx + dy * dy) + 0.0001,
			tf = (dd - this.restLength) / (dd * (this.p1.massInv + this.p2.massInv)) * this.strength,
			f;

		// Apply forces
		if (!this.p1.fixed) {
		  f = tf * this.p1.massInv;
		  this.p1.x += dx * f;
		  this.p1.y += dy * f + GRAVITY;
		}
		if (!this.p2.fixed) {
			f = -tf * this.p2.massInv;
			this.p2.x += dx * f;
			this.p2.y += dy * f + GRAVITY;
		}
  },
  save : function(){
	  var res = {};
	  for(var k in this){
		  if(typeof this[k] != 'function'){
			  res[k] = this[k];
		  }
	  }
	  return res;
		
  },
  load : function(obj){
	for(var k in obj){
		if(obj[k]['type']){
				//composite
				if(constructors[obj[k]['type']]){
					var field = new constructors[obj[k]['type']]().load(obj[k]);
					this[k] = field;
				}
			}else{
				this[k] = obj[k];
			}
	}
	return this;
  }
}

function Sim() {
	this.type = 'Sim';
	this.particles = [];
	this.springs = [];

	this.tick = function (dt) {
		var p = this.particles.length;
		while (p--) {			
			this.particles[p].update();
		}
		var s = this.springs.length;
		while (s--) this.springs[s].update();
	};
  	this.save = function (){
		var res = {};
		for(var k in this){
			if(typeof this[k] != 'function'){
				if(this[k]['save']){
					res[k] = this[k].save();
				}else if(k == 'particles' || k == 'springs'){
					var arr = [];
					for(var c = 0; c < this[k].length; c++){
						arr.push(this[k][c].save());
					}
					res[k] = arr;
				}else{
					res[k] = this[k];
				}
			}
		}
		return res;
	};
	
	this.load = function(obj){
		for(var k in obj){
			if(obj[k]['type']){
				//composite
				if(constructors[obj[k]['type']]){
					var field = new constructors[obj[k]['type']]().load(obj[k]);
					this[k] = field;
				}
			}else if(k == 'particles' || k == 'springs'){
				this[k] = [];
				for(var c = 0; c < obj[k].length; c++){
					if(constructors[obj[k][c]['type']]){
						var field = new constructors[obj[k][c]['type']]().load(obj[k][c]);
						this[k].push(field);
					}
				}
			}else{
				this[k] = obj[k];
			}		
		}
		return this;
	};
}

function Rope(){}
Rope.prototype = {
	uid : '',
	constructor : Rope,
	type : 'Rope',
	sim : '',
	last : '',
	ctx : '',
	old : '',
	width : '',
	height : '',
	init : function(pStart, pEnd, w, h, allArr, canvas){
		// Create a new system
		this.sim = new Sim();
		this.old = new Date().getTime();
		this.width = w;
		this.height = h;
		this.uid = new Date().getTime().toString() + Math.random();
		this.doRope(pStart, pEnd, allArr, canvas);
		return this;
	},

	doRope : function(pStart, pEnd, allArr, canvas){
		this.sim.particles = [];
		this.sim.springs = [];
		var op,
			anchor,
			step = 10,
			length = 100,
			count = length / step;

		if(allArr){
			// console.log(allArr);
			for (var i = 0; i < allArr.length; ++i) {
				// console.log(allArr[i].x, allArr[i].y, false, allArr[i].fixed);
				var np = new Particle(allArr[i].x, allArr[i].y, allArr[i].fixed);
				this.sim.particles.push(np);
				if (i > 0) {
					this.sim.springs.push(new Spring().init(np, op, step, 1.0));
				}
				op = np;
			}
		}else{
			for (var i = 0; i < count; ++i) {
				var np = new Particle(i * step, 20);
				this.sim.particles.push(np);

				if (i > 0) this.sim.springs.push(new Spring().init(np, op, step, 1.0));

				op = np;
			}
			anchor = this.sim.particles[0];
			anchor.fixed = pStart.fixed;
			anchor.x = pStart.x;
			anchor.y = pStart.y;

			this.last = this.sim.particles[count - 1];
			this.last.fixed = pEnd.fixed;
			this.last.x = pEnd.x;
			this.last.y = pEnd.y;
		}
		canvas.addEventListener('click', function (event) {
			var hit = -1;
			for(var i = 0; i < this.sim.particles.length; i++){
			if(Math.abs(this.sim.particles[i].x - event.offsetX) < 10 &&
				Math.abs(this.sim.particles[i].y - event.offsetY) < 10){
					hit = i;
					break;
				}
			}
			if(hit == -1){

			}else{
				var startArr = [];
				var endArr = [];
				
				killTickerById(this.uid);	
				
				if(this.sim.particles.length > 1){
					for(var i = 0; i < this.sim.particles.length; i++){
						var p = this.sim.particles[i];
						if(i < hit){
							// console.log(p.x, p.y, p.fixed);
							startArr.push(new Point(p.x, p.y, p.fixed));
						}else if(i > hit){
							endArr.push(new Point(p.x, p.y, p.fixed));
							// console.log(p.x, p.y, p.fixed);
						}
					}								
					
					simulationTickers.push(new Rope().init(startArr[0],
														   startArr[startArr.length - 1],
														   this.width,
														   this.height,
														   startArr, event.currentTarget));
														   
					simulationTickers.push(new Rope().init(endArr[0],
														   endArr[endArr.length - 1],
														   this.width,
														   this.height,
														   endArr, event.currentTarget));
				}
				
				this.destroy();
			}
		}.bind(this));
	},

	destroy : function() {
		this.sim.particles.splice(0);
	},
	
	step : function(ctx) {		
		//TODO use FPS here
		var delta = 1000 / 30;

		this.sim.tick(delta);

		var p = this.sim.particles.length;
		while (p--) {
			var particle = this.sim.particles[p];
			ctx.beginPath();
			ctx.arc(particle.x, particle.y, 5, Math.PI * 2, false);
			ctx.fillStyle = 'black';
			ctx.strokeStyle = 'black';
			ctx.fill();
		}

		var s = this.sim.springs.length;
		while (s--) {
			var spring = this.sim.springs[s];
			ctx.beginPath();
			ctx.moveTo(spring.p1.x, spring.p1.y);
			ctx.lineTo(spring.p2.x, spring.p2.y);
			ctx.strokeStyle = 'black';
			ctx.lineWidth = 1;
			ctx.stroke();
		}
		// this.old = now;
	},	
	save : function (){
		var res = {};
		for(var k in this){
			if(typeof this[k] != 'function'){
				if(this[k]['save']){
					res[k] = this[k].save();
				}else{
					res[k] = this[k];
				}
			}
		}
		return res;
	},	
	load : function (obj, canvas){
		for(var k in obj){
			if(obj[k]['type']){
				//composite
				if(constructors[obj[k]['type']]){
					var field = new constructors[obj[k]['type']]().load(obj[k]);
					this[k] = field;
				}
			}else{
				this[k] = obj[k];
			}		
		}
		this.doRope(null, null, this.sim.particles, canvas);
		return this;
	}
}

/**
 * consts
 */

var GRAVITY = 2;

/**
 * render engine
 */
var simulationTickers = [];

function killTickerById(id){
	for(var i = simulationTickers.length - 1; i >= 0; i--){
		if(simulationTickers[i].uid == id){
			simulationTickers.splice(i, 1);
			return;
		}
	}
}


/**
 * entities
 */
var targetPoint;
var dude = new Dude().init(400, 300);
var obstacles = {};

//init
document.getElementById('canvas').width = window.innerWidth - 20;
document.getElementById('canvas').height = window.innerHeight - 150;

simulationTickers.push(new Rope().init(new Point(Math.random() * 800, Math.random() * 600, true),
                                       new Point(Math.random() * 800, Math.random() * 600, true),
                                       document.getElementById('canvas').width,
									   document.getElementById('canvas').height, null, canvas));

simulationTickers.push(new Rope().init(new Point(Math.random() * 800, Math.random() * 600, true),
                                       new Point(Math.random() * 800, Math.random() * 600, true),
                                       document.getElementById('canvas').width,
									   document.getElementById('canvas').height, null, canvas));

simulationTickers.push(new Rope().init(new Point(Math.random() * 800, Math.random() * 600, true),
                                       new Point(Math.random() * 800, Math.random() * 600, true),
                                       document.getElementById('canvas').width,
									   document.getElementById('canvas').height, null, canvas));


/**
 * consts
 */

var GRAVITY = 2;

function getNewUID(){
	return new Date().getTime().toString() + Math.random();
}

/**
 * render engine
 */

setInterval(renderAll, 1000 / 30);
// setInterval(renderAll, 10000 / 30);
function renderAll(){
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for(var i = simulationTickers.length - 1; i >= 0; i--){
		ctx.beginPath();
		simulationTickers[i].step(ctx);
	}
	for(var k in obstacles){
		var ob = obstacles[k];
		ctx.beginPath();
		ctx.arc(ob.x, ob.y, ob.radius, Math.PI * 2, false);
		ctx.fillStyle = 'black';
		ctx.strokeStyle = 'black';
		ctx.fill();
	}
	if(targetPoint){
		ctx.beginPath();
		ctx.arc(targetPoint.x, targetPoint.y, 5, Math.PI * 2, false);
		ctx.fillStyle = 'red';
		ctx.strokeStyle = 'red';
		ctx.fill();
	}
	if(dude){
		dude.step(targetPoint, obstacles, simulationTickers, canvas);
	}
}

/**
 * controls
 */
document.getElementById('canvas').addEventListener('click', function (event) {
	var clickPoint = new Point(event.offsetX, event.offsetY);
	if(event.ctrlKey){//add obstacle
		var obst = new Obstacle(clickPoint.x, clickPoint.y, Math.floor(Math.random() * 1 + 17));
		obstacles[obst.uid] = obst;
		console.log('added', obst);
	}else if(event.shiftKey){//kill obstacle
		// console.log(JSON.stringify(saveScene()));		
		document.getElementById('save-out').innerHTML = JSON.stringify(saveScene());
		if(event.altKey){
			loadScene(JSON.parse(prompt('loadData')));
		}
		for(var k in obstacles){
			var ob = obstacles[k];
			if(Math.abs(ob.x - clickPoint.x) < ob.radius &&
				Math.abs(ob.y - clickPoint.y) < ob.radius){
					console.log('killed', ob);
					delete obstacles[k];
			}
		}
	}else{//set target
		targetPoint = clickPoint.clone();
		console.log('target', targetPoint);
	}	
}.bind(this));


/**
* Math & tools
*/
//save-load
function destroyScene(){
	dude = null;
	targetPoint = null;
	for(var k in obstacles){
		delete obstacles[k];
	}
	// for(var k in simulationTickers){
	simulationTickers.splice(0);
	// }	
}

function loadScene(obj){
	destroyScene();
	for(var k in obj){
		switch (k){
			case 'obstacles':
				var obsts = obj[k];
				for(var j in obsts){
					obstacles[j] = new Obstacle().load(obsts[j]);
				}
			break;
			case 'targetPoint':
				targetPoint = new Point().load(obj[k]);
			break;
			case 'dude':
				dude = new Dude().load(obj[k]);
			break;
			case 'simulationTickers':
				for(var c = 0; c < obj[k].length; c++){
					var rope = new Rope().load(obj[k][c], canvas);
					simulationTickers.push(rope);
				}
			break;			
		}
	}
}

function saveScene(){
	var res = {
		obstacles : {},
		simulationTickers : []
	};
	for(var k in obstacles){
		res.obstacles[k] = obstacles[k].save();
	}
	if(targetPoint){
		res.targetPoint = targetPoint.save();
	}
	for(var c = 0; c < simulationTickers.length; c++){
		res.simulationTickers.push(simulationTickers[c]);
	}
	if(dude){
		res.dude = dude.save();
	}	
	return res;
}
//collisions
function checkLineIntersection( x11,  y11,  x12,  y12,  x21,  y21,  x22,  y22)
{

	var maxx1 = Math.max(x11, x12), maxy1 = Math.max(y11, y12);
	var minx1 = Math.min(x11, x12), miny1 = Math.min(y11, y12);
	var maxx2 = Math.max(x21, x22), maxy2 = Math.max(y21, y22);
	var minx2 = Math.min(x21, x22), miny2 = Math.min(y21, y22);

	if (minx1 > maxx2 || maxx1 < minx2 || miny1 > maxy2 || maxy1 < miny2)
	  return false;  // Момент, када линии имеют одну общую вершину...
	 

	var dx1 = x12-x11, dy1 = y12-y11; // Длина проекций первой линии на ось x и y
	var dx2 = x22-x21, dy2 = y22-y21; // Длина проекций второй линии на ось x и y
	var dxx = x11-x21, dyy = y11-y21;
	var div, mul;


	if ((div = (dy2*dx1-dx2*dy1)) == 0) 
	  return false; // Линии параллельны...
	if (div > 0) {
	  if ((mul = (dx1*dyy-dy1*dxx)) < 0 || mul > div)
		return false; // Первый отрезок пересекается за своими границами...
	  if ((mul = (dx2*dyy-dy2*dxx)) < 0 || mul > div)
		 return false; // Второй отрезок пересекается за своими границами...
	}

	if ((mul = -(dx1*dyy-dy1*dxx)) < 0 || mul > -div)
	  return false; // Первый отрезок пересекается за своими границами...
	if ((mul = -(dx2*dyy-dy2*dxx)) < 0 || mul > -div)
	  return false; // Второй отрезок пересекается за своими границами...

	return true;
};

function pointCircleCollision(point, circle) {
    if (circle.radius === 0) return false;
    var dx = circle.x - point.x;
    var dy = circle.y - point.y;
    return dx * dx + dy * dy <= circle.radius * circle.radius;
}

function lineCircleCollide(a, b, circle) {
    //check to see if start or end points lie within circle 
    if (pointCircleCollision(a, circle)) {        
        return true
    } if (pointCircleCollision(b, circle)) {        
        return true
    }
    
    var x1 = a.x,
        y1 = a.y,
        x2 = b.x,
        y2 = b.y,
        cx = circle.x,
        cy = circle.y

    //vector d
    var dx = x2 - x1
    var dy = y2 - y1
    
    //vector lc
    var lcx = cx - x1
    var lcy = cy - y1
    
    //project lc onto d, resulting in vector p
    var dLen2 = dx * dx + dy * dy //len2 of d
    var px = dx
    var py = dy
    if (dLen2 > 0) {
        var dp = (lcx * dx + lcy * dy) / dLen2
        px *= dp
        py *= dp
    }
    
	var nearest = new Point(x1 + px, y1 + py);
	
    //len2 of p
    var pLen2 = px * px + py * py;
    
    //check collision
    return pointCircleCollision(nearest, circle)
            && pLen2 <= dLen2 && (px * dx + py * dy) >= 0
} 
