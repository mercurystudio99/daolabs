/*
The uncanny trail shader

jasonlabbe3d.com
twitter.com/russetPotato

Notes:
	This may not run on certain mobiles or devices with weaker gpus.
	If you get an error about max uniforms try decreasing `PARTICLE_MAX_COUNT` and `TRAIL_MAX_COUNT`
*/

// Values to play with.
const TRAIL_MAX_COUNT = 30;
const TRAIL_MAX_RADIUS = 120;
const PARTICLE_MAX_COUNT = 70;
const PARTICLE_PULL_FORCE = 0.0015;
const PARTICLE_INITIAL_SPEED = 0.15;
const PARTICLE_SPEED_VARIANCE = 15;
const PARTICLE_SPAWN_ANGLE = 25;
const PARTICLE_LIFE = 60;
const PARTICLE_MIN_AIR_DRAG = 0.9;
const PARTICLE_MAX_AIR_DRAG = 0.95;

var myFont;
var theShader;
var shaderTexture;
var trail;
var shaded = true;
var timeSteps = 1;
var sketchTimer = 0;
var transitionTimer = 0;
var globalHue = 0;

function preload() {
	theShader = new p5.Shader(this.renderer, vertShader, fragShader);
	myFont = loadFont("Roboto-Black.ttf");
}

function setup() {
	pixelDensity(1);
	
  let canvas = createCanvas(
		min(windowWidth, windowHeight), 
		min(windowWidth, windowHeight), 
		WEBGL);
	
	canvas.canvas.oncontextmenu = () => false;  // Removes right-click menu.
	
	globalHue = random(255);
	
	trail = new Trail();
	
	shaderTexture = createGraphics(width, height, WEBGL);
	shaderTexture.noStroke();
}

function draw() {
	background(0);
	noStroke();
	
	translate(-width / 2, -height / 2);
	
	let lerpAmount = 0.1;
	
	if (transitionTimer == 0) {
		// Normal motion.
		timeSteps = lerp(timeSteps, 1, lerpAmount);
		trail.radius = lerp(trail.radius, TRAIL_MAX_RADIUS, lerpAmount);
	} else {
		// Spin faster in a tigher circle.
		transitionTimer--;
		timeSteps = lerp(timeSteps, 4, lerpAmount);
		trail.radius = lerp(trail.radius, TRAIL_MAX_RADIUS * 0.5, lerpAmount);
	}
	
	trail.hue = lerp(trail.hue, globalHue, lerpAmount * 0.5);
	
	trail.move();
	
	if (shaded) {
		trail.display();
	} else {
		trail.debugDisplay();
	}
	
	sketchTimer += timeSteps;
	
	fill(255);
	noStroke();
	textFont(myFont);
	text(`
		Left-click to switch colors
		Hold middle-click to make it disappear
		Right-click to toggle shader`, 
		40, 40);
}

function mousePressed() {
	if (mouseButton == LEFT) {
		globalHue = random(255);
		transitionTimer = 40;
	} else if (mouseButton == RIGHT) {
		shaded = !shaded;
	}
}
