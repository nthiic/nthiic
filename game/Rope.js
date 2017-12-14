/**
 * Classes
 */
function Point(x, y, fixed){
  this.x = x;
  this.y = y;
  this.fixed = fixed;
  //clone?
  this.clone = function(){
    return new Point(this.x, this.y, this.fixed);
  };
}

function Particle(x, y, mass, fixed) {
  this.x = x || 0;
  this.y = y || 0;
  this.ox = this.x;
  this.oy = this.y;
  this.mass = mass || 1.0;
  this.massInv = 1.0 / this.mass;
  this.fixed = fixed;

  this.update = function () {};
  //clone?
}

function Spring(p1, p2, restLength, strength) {
  this.p1 = p1;
  this.p2 = p2;
  this.restLength = restLength || 10;
  this.strength = strength || 1.0;

  this.update = function () {
    // Compute desired force
    var dx = p2.x - p1.x,
        dy = p2.y - p1.y + 1,
        dd = Math.sqrt(dx * dx + dy * dy) + 0.0001,
        tf = (dd - this.restLength) / (dd * (p1.massInv + p2.massInv)) * this.strength,
        f;

    // Apply forces
    if (!p1.fixed) {
      f = tf * p1.massInv;
      p1.x += dx * f;
      p1.y += dy * f + GRAVITY;
    }

    if (!p2.fixed) {
      f = -tf * p2.massInv;
      p2.x += dx * f;
      p2.y += dy * f + GRAVITY;
    }
  };
}

function Sim() {

  this.particles = [];
  this.springs = [];

  this.tick = function (dt) {
    var p = this.particles.length;
    while (p--) {
		// if(!this.particles[p].update)debugger
		this.particles[p].update();
	}

    var s = this.springs.length;
    while (s--) this.springs[s].update();
  };
}

function Rope(){}
Rope.prototype = {
	uid : '',
	constructor : Rope,
	sim : '',
	canvas : '',
	last : '',
	ctx : '',
	old : '',
	width : '',
	height : '',
	init : function(pStart, pEnd, canvas, allArr){
		// Create a new system
		this.sim = new Sim();
		this.old = new Date().getTime();
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.width = canvas.width = window.innerWidth;
		this.height = canvas.height = window.innerHeight;
		this.uid = new Date().getTime().toString() + Math.random();
		this.doRope(pStart, pEnd, allArr);
		return this;
	},

	doRope : function(pStart, pEnd, allArr){
		this.sim.particles = [];
		this.sim.springs = [];
		var op,
			anchor,
			step = 10,
			length = 100,
			count = length / step;

		if(allArr){
			console.log(allArr);
			for (var i = 0; i < allArr.length; ++i) {
				console.log(allArr[i].x, allArr[i].y, false, allArr[i].fixed);
				var np = new Particle(allArr[i].x, allArr[i].y, false, allArr[i].fixed);
				this.sim.particles.push(np);

				if (i > 0) this.sim.springs.push(new Spring(np, op, step, 1.0));

				op = np;
			}
		}else{
			for (var i = 0; i < count; ++i) {
				var np = new Particle(i * step, 20, 10.1);
				this.sim.particles.push(np);

				if (i > 0) this.sim.springs.push(new Spring(np, op, step, 1.0));

				op = np;
			}
			// Fix the first particle
			anchor = this.sim.particles[0];
			anchor.fixed = pStart.fixed;
			anchor.x = pStart.x;
			anchor.y = pStart.y;

			// Move last particle with mouse
			this.last = this.sim.particles[count - 1];
			this.last.fixed = pEnd.fixed;
			this.last.x = pEnd.x;
			this.last.y = pEnd.y;
		}
		
		/* // Fix the first particle
		anchor = this.sim.particles[0];
		anchor.fixed = pStart.fixed;
		anchor.x = pStart.x;
		anchor.y = pStart.y;

		// Move last particle with mouse
		this.last = this.sim.particles[count - 1];
		this.last.fixed = pEnd.fixed;
		this.last.x = pEnd.x;
		this.last.y = pEnd.y; */
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
														   document.getElementById('canvas'),
														   startArr));
														   
					simulationTickers.push(new Rope().init(endArr[0],
														   endArr[endArr.length - 1],
														   document.getElementById('canvas'),
														   endArr));
				}
				
				this.destroy();
			}
		}.bind(this));
	},

	destroy : function() {
		this.sim.particles.splice(0);
	},
	
	step : function() {
		var now = new Date().getTime(),
		delta = now - this.old;

		this.sim.tick(delta);

		var p = this.sim.particles.length;
		while (p--) {
			var particle = this.sim.particles[p];
			this.ctx.beginPath();
			this.ctx.arc(particle.x, particle.y, 5, Math.PI * 2, false);
			this.ctx.strokeStyle = 'black';
			this.ctx.fill();
		}

		var s = this.sim.springs.length;
		while (s--) {
			var spring = this.sim.springs[s];
			this.ctx.beginPath();
			this.ctx.moveTo(spring.p1.x, spring.p1.y);
			this.ctx.lineTo(spring.p2.x, spring.p2.y);
			this.ctx.strokeStyle = 'black';
			this.ctx.lineWidth = 1;
			this.ctx.stroke();
		}
		this.old = now;
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
setInterval(renderAll, 1000 / 30);
function renderAll(){
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	for(var i = simulationTickers.length - 1; i >= 0; i--){
		simulationTickers[i].step();
	}
}

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
simulationTickers.push(new Rope().init(new Point(Math.random() * 800, Math.random() * 600, true),
                                       new Point(Math.random() * 800, Math.random() * 600, true),
                                       document.getElementById('canvas')));

simulationTickers.push(new Rope().init(new Point(Math.random() * 800, Math.random() * 600, true),
                                       new Point(Math.random() * 800, Math.random() * 600, true),
                                       document.getElementById('canvas')));

simulationTickers.push(new Rope().init(new Point(Math.random() * 800, Math.random() * 600, true),
                                       new Point(Math.random() * 800, Math.random() * 600, true),
                                       document.getElementById('canvas')));

simulationTickers.push(new Rope().init(new Point(Math.random() * 800, Math.random() * 600, true),
                                       new Point(Math.random() * 800, Math.random() * 600, true),
                                       document.getElementById('canvas')));

simulationTickers.push(new Rope().init(new Point(Math.random() * 800, Math.random() * 600, true),
                                       new Point(Math.random() * 800, Math.random() * 600, true),
                                       document.getElementById('canvas')));

simulationTickers.push(new Rope().init(new Point(Math.random() * 800, Math.random() * 600, true),
                                       new Point(Math.random() * 800, Math.random() * 600, true),
                                       document.getElementById('canvas')));

simulationTickers.push(new Rope().init(new Point(Math.random() * 800, Math.random() * 600, true),
                                       new Point(Math.random() * 800, Math.random() * 600, true),
                                       document.getElementById('canvas')));

simulationTickers.push(new Rope().init(new Point(Math.random() * 800, Math.random() * 600, true),
                                       new Point(Math.random() * 800, Math.random() * 600, true),
                                       document.getElementById('canvas')));
