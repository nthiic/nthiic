/**
 * Classes
 */
function Line(start, end){
	this.start = start;
	this.end = end;
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
}



/**
 * entities
 */
var points = [];


/**
 * render engine
 */

function renderAll(){
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	for(var i = 0; i < points.length; i++){
		ctx.beginPath();
		ctx.arc(points[i].x, points[i].y, 5, Math.PI * 2, false);
		if(i % 2){
			ctx.moveTo(points[i].x, points[i].y);
			ctx.lineTo(points[i - 1].x, points[i - 1].y);
		}
		ctx.fillStyle = i < 2 ? 'red' : 'blue';
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 1;
		ctx.fill();
		ctx.stroke();
	}	
}

/**
 * controls
 */
document.getElementById('canvas').addEventListener('click', function (event) {
	var clickPoint = new Point(event.offsetX, event.offsetY);
	if(event.ctrlKey){//add obstacle
		
	}else if(event.shiftKey){//kill obstacle
		
	}else{//set target
		if(points.length >= 4){
			points = [];
		}
		points.push(clickPoint.clone());
		if(points.length == 4){
			var fromweb = checkLines(points[0], points[1], points[2], points[3]);
			var mystery = intersect(points[0], points[1], points[2], points[3]);
			document.getElementById('log').innerHTML = fromweb + '<br>' + mystery;
		}
	}
	renderAll()
}.bind(this));


/**
* Math & tools
*/
function checkLines(p1, p2, p3, p4){
	return checkLineIntersection(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y);
}
//collisions

function area (a, b, c) {
	return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}
 
function intersect_1 (a, b, c, d) {
	if (a > b){
		var tmp = a;
		a = b;
		b = tmp;
	}  
	if (c > d){
		var tmp = c;
		c = d;
		d = tmp;
	}
	return Math.max(a,c) <= Math.min(b,d);
}
 
function intersect (a, b, c, d) {
	return intersect_1 (a.x, b.x, c.x, d.x)
		&& intersect_1 (a.y, b.y, c.y, d.y)
		&& area(a,b,c) * area(a,b,d) <= 0
		&& area(c,d,a) * area(c,d,b) <= 0;
}

function checkLineIntersection(x11,  y11,  x12,  y12,  x21,  y21,  x22,  y22)
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
