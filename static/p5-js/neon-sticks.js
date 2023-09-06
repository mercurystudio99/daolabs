var W = 800, H = 800;
var startTime;
var t;
var dt;

let mainShader;
let points = [];
let NPOINTS = 20;
let HALFNPOINTS = NPOINTS / 2;

function preload() {
	mainShader = loadShader("shader.vert", "shader.frag");	
}

function setup() {
	W = H = windowHeight;
	pixelDensity(1);
	createCanvas(W,H, WEBGL);
	noStroke();
	background(0);
	
	for(var i=0; i<NPOINTS; i++)
	{
		points.push(createVector(0.6,0.6));
	}
}

function draw() {
	t = millis() * 0.0004;
	let sint = 0.7*pow(0.5+0.5*sin(t*2.0),2.0);
	dt = deltaTime;

	for(var i=0; i<HALFNPOINTS; i++)
	{
		let offsetx = 0.5+(i+1)*0.01*cos((i*1.46)+t+sint);
		let offsety = 0.5+(i+1)*0.01*sin((i*4.58)+t+sint);
		points[i].x = offsetx + 0.4 * cos(i+0.89*(t+sint));
		points[i].y = offsety + 0.4 * sin(i+1.08*(t+sint));
		points[i+HALFNPOINTS].x = 1.0-points[i].x;
		points[i+HALFNPOINTS].y = points[i].y;
	}

	background(0);
	mainShader.setUniform('u_resolution', [W,H]);
	mainShader.setUniform('u_points', SerializeP5VectorArray(points));
	mainShader.setUniform('u_time', t);
	shader(mainShader);
	rect(0,0,W,H);
}

function SerializeP5VectorArray(p5VectorArray) {
	let sarr = [];
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
	p5VectorArray.forEach(e => {sarr.push(e.x); sarr.push(e.y);});
	return sarr;
}

function windowResized(){
  resizeCanvas(W, H);
}