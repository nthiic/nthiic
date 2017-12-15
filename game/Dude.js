/**
 * Classes
 */
function Circle(x, y, radius){
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.clone = function(){
    return new Circle(this.x, this.y, this.radius);
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
  }
}

function Obstacle(x, y, radius){
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.uid = getNewUID();
  this.clone = function(){
    return new Obstacle(this.x, this.y, this.radius);
  };
}

function Dude(){}
Dude.prototype = {
	SPEED : 1,
	A_SPEED : 0.1,
	RADUIS : 8,
	FOV : 60,
	PAW_LEN : 35,
	
	constructor : Dude,
	canvas : '',
	ctx : '',
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
	
	
	init : function(x, y, canvas){
		this.coords = [];
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		
		this.x = x;
		this.y = y;
		
		this.head = new Circle(this.x, this.y, this.RADUIS);		
		this.body = new Circle(this.x, this.y + this.RADUIS * 2, this.RADUIS);
		this.tail = new Circle(this.x, this.y + this.RADUIS * 4, this.RADUIS);
		return this;
	},
	
	step : function(targ, env) {
		if(targ){
			var toCollide = false;
			//new course
			if(!targ.equals(this.myTarg)){
				this.myTarg = targ.clone();
				this.resetCourse();
			}else{
				//check collision course				
				this.ctx.lineWidth = 2;
				this.ctx.strokeStyle = "#ff00ff";
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
				/* for(var i = this.RADUIS; i <= this.FOV; i += 1){
					tips.push(new Point(this.head.x + i * this.kx, this.head.y - i * this.ky));
				} */
				toCollide = this.checkCollisionCourse(tips, env);
				if(toCollide){
					this.ctx.strokeStyle = "#ff0000";
					this.tmpAngle -= this.A_SPEED;				
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
				this.ctx.beginPath();
				for(var t = 0; t < tips.length; t++){
					var start = t >= tips.length - 2 ? this.tail : (t >= tips.length - 4 ? this.body : this.head);
					this.ctx.moveTo(start.x, start.y);
					this.ctx.lineTo(tips[t].x, tips[t].y);
				}
				this.ctx.stroke();
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
		
		this.ctx.beginPath();

		this.ctx.arc(this.head.x, this.head.y, this.head.radius, Math.PI * 2, false);
		this.ctx.arc(this.body.x, this.body.y, this.body.radius, Math.PI * 2, false);
		this.ctx.arc(this.tail.x, this.tail.y, this.tail.radius, Math.PI * 2, false);
		
		this.ctx.fillStyle = 'blue';
		this.ctx.strokeStyle = 'black';
		this.ctx.fill();
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
			for(var t in tips){
				if(pointCircleCollision(tips[t], env[k])){
					return true;
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
		dude.step(targetPoint, obstacles);
	}
}



/**
 * controls
 */
document.getElementById('canvas').addEventListener('click', function (event) {
	var clickPoint = new Point(event.offsetX, event.offsetY);
	if(event.ctrlKey){//add obstacle
		var obst = new Obstacle(clickPoint.x, clickPoint.y, Math.floor(Math.random() * 10 + 30));
		obstacles[obst.uid] = obst;
		console.log('added', obst);
	}else if(event.shiftKey){//kill obstacle
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
 * entities
 */
var targetPoint;
var dude = new Dude().init(400, 300, document.getElementById('canvas'));
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

