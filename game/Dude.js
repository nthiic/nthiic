/**
 * Classes
 */
var constructors = {
	Circle : Circle,
	Point : Point,
	Obstacle : Obstacle,
	Dude : Dude
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

 function Point(x, y){
  this.x = x;
  this.y = y;
  this.clone = function(){
    return new Point(this.x, this.y);
  };
  this.equals = function(obj){
	  return this.x == obj.x && this.y == obj.y;
  };
  this.save = function(){
	  return {
		type : 'Point',
		x : this.x,
		y : this.y
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
		/* if(!isNaN(obj.x) && !isNaN(obj.y)){
			this.init(obj.x, obj.y);
		} */
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
	
	step : function(targ, env, canvas) {
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

				toCollide = this.checkCollisionCourse(tips, env);
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
					if(Math.abs(this.tmpAngle - this.angle) < this.A_SPEED){
						this.resetCourse();
					}else{
						this.tmpAngle += this.A_SPEED;
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
	checkCollisionCourse : function(tips, env){
		for(var k in env){
			for(var t = 0; t < tips.length; t++){
				var start = t >= tips.length - 2 ? this.tail : (t >= tips.length - 4 ? this.body : this.head);
				
				if(lineCircleCollide(start, tips[t], env[k])){
					if(t >= tips.length - 6){
						//legs
						return t % 2 == 0 ? 'left' : 'right';
					}
					return 'sensors';
				}				
			}
		}
		return false;
	}
}

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
		dude.step(targetPoint, obstacles, canvas);
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
		console.log(JSON.stringify(saveScene()));		
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

function destroyScene(){
	dude = null;
	targetPoint = null;
	for(var k in obstacles){
		delete obstacles[k];
	}
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
		}
	}
}

function saveScene(){
	var res = {
		obstacles : {}
	};
	for(var k in obstacles){
		res.obstacles[k] = obstacles[k].save();
	}
	if(targetPoint){
		res.targetPoint = targetPoint.save();
	}
	if(dude){
		res.dude = dude.save();
	}
	return res;
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
