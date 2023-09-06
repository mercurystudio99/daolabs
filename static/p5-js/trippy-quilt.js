//let colors = ["#5463FF","#ECECEC","#FFC300","#FF1818"];

let colors = ["#f7f3f2", "#0077e1", "#f5d216", "#fc3503"]

function setup() {
	createCanvas(1000,1000);
	colorMode(HSB, 360, 100, 100,100);
	rectMode(CENTER);
	background(100);
	noLoop();
}

function draw()
{
	
	noStroke();
	let mySize = 300;
	
	for(let xx=mySize/1.5;xx < width;xx+=mySize)
	{
		for(let yy=mySize/1.5;yy < height;yy+=mySize)
		{
		  fill(generateColor(10));
	    rect(xx,yy,mySize,mySize,20,20);
		}
	}
	
	mySize = 50;
	
	for(let xx=mySize*2;xx <= width - mySize*2;xx+=mySize*2)
	{
		for(let yy=mySize*2;yy <= height - mySize*2;yy+=mySize*2)
		{
	   drawSquare(xx,yy,3,12,mySize);
		}
	}

	mySize = 100;
	
	for(let xx=mySize*2;xx <= width - mySize*2;xx+=mySize*2)
	{
		for(let yy=mySize*2;yy <= height - mySize*2;yy+=mySize*2)
		{
	   drawSquare(xx,yy,6,12,mySize);
		}
	}
	
	mySize = 100;

	for(let xx= mySize;xx <= width - mySize;xx+=mySize)
	{ 
		for(let yy=mySize;yy <= height - mySize;yy+=mySize)
		{
		  noFill();
	    rect(xx,yy,mySize,mySize);
		}
	}
	
	noFill();
	stroke(0);
	rect(width/2,height/2,width-50,height-50,20,20);
	
}

function drawSquare(x,y,freq,amp,mySize) {

	
	let p1 = createVector(x + mySize/2,y + mySize/2);
	let p2 = createVector(x - mySize/2,y + mySize/2);
	let p3 = createVector(x - mySize/2,y - mySize/2);
	let p4 = createVector(x + mySize/2,y - mySize/2);
  
	noFill();
	strokeWeight(0.5);
	rect(x,y,mySize,mySize);
	fill(generateColor(1));
	
	for(let i=mySize;i > 0;i-=5)
	{
		fill(generateColor(1));
	  rect(x,y,i,i,20,20);
	}
	
	for(let i=amp;i > 0;i-=2)
	{
		fill(generateColor(1));
    drawSine(p1,p2,freq,i);
	}
	
	for(let i=amp;i > 0;i-=2)
	{
		fill(generateColor(1));
	  drawSine(p2,p3,freq,i);
	}
	
	for(let i=amp;i > 0;i-=2)
	{
		fill(generateColor(1));
	  drawSine(p3,p4,freq,i);
	}
	
	for(let i=amp;i > 0;i-=2)
	{
		fill(generateColor(1)); 
    drawSine(p4,p1,freq,i);
	}
	
	
	
} 
	

function drawSine(p1, p2,freq,amp)
{
  let d = p1.dist(p2);
  let a = atan2(p2.y-p1.y,p2.x-p1.x);
  push();
  translate(p1.x,p1.y);
  rotate(a);
	beginShape();
	for (let i = 0; i <= d; i += d/100) 
	{
		let xx = i;
		let yy = cos(xx*TWO_PI*freq/d)*amp - amp;
		vertex(xx,yy);
	}
	endShape();
  pop();
}

function generateColor(scale) {
	let temp = color(colors[floor(random(0, colors.length))]);
	myColor = color(hue(temp) + randomGaussian() * scale,
		saturation(temp) + randomGaussian() * scale,
		brightness(temp) + randomGaussian() * scale,
		random(100,100));
	return myColor;
} 



