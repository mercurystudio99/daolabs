// by SamuelYAN
// more works //
   // https://twitter.com/SamuelAnn0924
   // https://www.instagram.com/samuel_yan_1990/

//Inspired by the Composition of Kandinsky and Mondrian

var seed = Math.random() * 1000;
var mySize;
let tile_count = 14;
let margin;
let colors11 = "f3f3f3-c6c6c6".split("-").map((a) => "#" + a);
let colors12 = "1b1b1b00-29292900".split("-").map((a) => "#" + a);
let colors21 = "f3f3f3-c6c6c6".split("-").map((a) => "#" + a);
let colors22 = "1b1b1b00-29292900".split("-").map((a) => "#" + a);
let colors31 = "f3f3f3-c6c6c6".split("-").map((a) => "#" + a);
let colors32 = "1b1b1b00-29292900".split("-").map((a) => "#" + a);
let colorbg = "27221d".split("-").map((a) => "#" + a);
var cell_x, cell_y;
var v1, v2, v3, v12, v22, v32, v02;
var vleft, vmiddle, vright;
let a =0;

function setup() {
  // pixelDensity(5);
  createCanvas(windowWidth, windowHeight);
  mySize = min(windowWidth, windowHeight);
  cell_x = mySize / tile_count;
  cell_y = mySize / tile_count;
  margin = mySize / 50;
  push();
  translate(
    (windowWidth - cell_x * tile_count) / 2,
    (windowHeight - cell_y * tile_count) / 2
  );
  randomSeed(seed);
  background(colorbg);
  vleft = createVector(-2, -1);
  vright = createVector(3, -1);
  vmiddle = createVector(0, -1);
  pop();
  let filter = new makeFilter();
}

function makeFilter() {
  // noiseのフィルターをつくる
  colorMode(HSB, 360, 100, 100, 100);
  drawingContext.shadowColor = color(0, 0, 95, 25);
  overAllTexture = createGraphics(windowWidth, windowHeight);
  overAllTexture.loadPixels();
  for (var i = 0; i < width; i++) {
    for (var j = 0; j < height; j++) {
      overAllTexture.set(
        i,
        j,
        color(60, 50, 30, noise(i / 3, j / 3, (i * j) / 50) * random(1, 12))
      );
    }
  }
  overAllTexture.updatePixels();
}

function set_basic_vec() {
  v1 = createVector(0, 0);
  v2 = createVector(0, 0);
  v3 = createVector(0, 0);
  v12 = createVector(0, 0);
  v22 = createVector(0, 0);
  v32 = createVector(0, 0);
  v02 = createVector(0, 0);
}

function make_cube_v() {
  v12.mult(0).add(v1).add(v2);
  v32.mult(0).add(v3).add(v2);
  v22.mult(0).add(v1).add(v2).add(v3);
  v02.mult(0).add(v1).add(v3);
}

function draw() {
  randomSeed(seed);
  push();
  translate(
    (windowWidth - cell_x * tile_count) / 2,
    (windowHeight - cell_y * tile_count) / 2
  );
  //background(colorbg);  
  for (let i = 0; i < mySize; i += cell_x) {
    noFill();
    stroke(245,50);
    strokeWeight(0.75);
    line(i, 0, i, height);
    line(0, i, width, i);
  }
  Composition();
  picture_frame();
  pop();
  blendMode(LIGHTEST);
  image(overAllTexture, 0, 0);
  a ++;
  if(a == 1){
    noLoop();
  }
}

function picture_frame() {
  push();
  translate(mySize / 2, mySize / 2);
  noFill();
  stroke(245);
  strokeWeight(margin / 2);
  rectMode(CENTER);
  square(0, 0, mySize - margin / 2);
  if (windowWidth >= windowHeight) {
    noStroke();
    fill(10);
    rect(-windowWidth / 2, 0, windowWidth - mySize, windowHeight);
    rect(windowWidth / 2, 0, windowWidth - mySize, windowHeight);
  } else {
    fill(10);
    rect(0, -windowHeight / 2, windowWidth, windowHeight - mySize);
    rect(0, windowHeight / 2, windowWidth, windowHeight - mySize);
  }
  pop();
}

function Composition() {
  randomSeed(seed);
  // background(colorbg);
  noFill();
  stroke(245,75);
  strokeWeight(0.75);
  drawingContext.shadowColor = color(0, 0, 50, 10);
  drawingContext.shadowOffsetX = 2;
  drawingContext.shadowOffsetY = 2;
  drawingContext.shadowBlur = 20;

  //cube b00
  push();
  set_basic_vec();
  translate(cell_x * 10, cell_y * (13+2/3));
  v1.add(vleft).mult(2 * (cell_x, cell_y));
  v2.add(vmiddle).mult(1 * (cell_x, cell_y));
  v3.add(vright).mult(0.5 * (cell_x, cell_y));
  make_cube_v();
  make_outline();
  fill(random(colorbg));
  quad(0, 0, v1.x, v1.y, v12.x, v12.y, v2.x, v2.y);
  quad(0, 0, v2.x, v2.y, v32.x, v32.y, v3.x, v3.y);
  quad(v2.x, v2.y, v12.x, v12.y, v22.x, v22.y, v32.x, v32.y);
  line_gradient_color(v12.x,v32.y,random(colors22),random(colors21))
  quad(v2.x, v2.y, v12.x, v12.y, v22.x, v22.y, v32.x, v32.y);
  noFill();
  pop();
  
  //cube b00-1
  push();
  set_basic_vec();
  translate(cell_x * 4, cell_y * 13);
  v1.add(vleft).mult(1 * (cell_x, cell_y));
  v2.add(vmiddle).mult(1 * (cell_x, cell_y));
  v3.add(vright).mult(1 * (cell_x, cell_y));
  make_cube_v();
  make_outline();
  fill(random(colorbg));
  quad(0, 0, v1.x, v1.y, v12.x, v12.y, v2.x, v2.y);
  quad(0, 0, v2.x, v2.y, v32.x, v32.y, v3.x, v3.y);
  quad(v2.x, v2.y, v12.x, v12.y, v22.x, v22.y, v32.x, v32.y);
  line_gradient_color(v12.x,v32.y,random(colors21),random(colors22))
  quad(v2.x, v2.y, v12.x, v12.y, v22.x, v22.y, v32.x, v32.y);
  noFill();
  pop();
  
  //cube 01
  push();
  set_basic_vec();
  translate(cell_x * 7, cell_y * 13);
  v1.add(vleft).mult(3 * (cell_x, cell_y));
  v2.add(vmiddle).mult(1 * (cell_x, cell_y));
  v3.add(vright).mult((1 / 3) * (cell_x, cell_y));
  make_cube_v();
  make_outline();
  fill(random(colorbg));
  quad(0, 0, v1.x, v1.y, v12.x, v12.y, v2.x, v2.y);
  quad(0, 0, v2.x, v2.y, v32.x, v32.y, v3.x, v3.y);
  quad(v2.x, v2.y, v12.x, v12.y, v22.x, v22.y, v32.x, v32.y);
  fill(random(colors11));
  line_gradient_color(v2.x,v2.y,random(colors12),random(colors11))
  quad(0, 0, v2.x, v2.y, v32.x, v32.y, v3.x, v3.y);
  noFill();
  pop();
 
  //cube 02
  push();
  set_basic_vec();
  translate(cell_x * 7, cell_y * 12);
  v1.add(vleft).mult(0.5 * (cell_x, cell_y));
  v2.add(vmiddle).mult(1 * (cell_x, cell_y));
  v3.add(vright).mult(2 * (cell_x, cell_y));
  make_cube_v();
  make_outline();
  fill(random(colorbg));
  quad(0, 0, v1.x, v1.y, v12.x, v12.y, v2.x, v2.y);
  quad(0, 0, v2.x, v2.y, v32.x, v32.y, v3.x, v3.y);
  quad(v2.x, v2.y, v12.x, v12.y, v22.x, v22.y, v32.x, v32.y);
  fill(random(colors11));
  line_gradient_color(v2.x,v2.y,random(colors11),random(colors12))
  quad(0, 0, v1.x, v1.y, v12.x, v12.y, v2.x, v2.y);
  noFill();
  pop();
  
  //cube b01
  push();
  set_basic_vec();
  translate(cell_x * 2, cell_y * 11);
  v1.add(vleft).mult(1 * (cell_x, cell_y));
  v2.add(vmiddle).mult(2 * (cell_x, cell_y));
  v3.add(vright).mult(2 * (cell_x, cell_y));
  make_cube_v();
  make_outline();
  fill(random(colorbg));
  quad(0, 0, v1.x, v1.y, v12.x, v12.y, v2.x, v2.y);
  quad(0, 0, v2.x, v2.y, v32.x, v32.y, v3.x, v3.y);
  quad(v2.x, v2.y, v12.x, v12.y, v22.x, v22.y, v32.x, v32.y);
  line_gradient_color(v12.x,v32.y,random(colors21),random(colors22))
  quad(v2.x, v2.y, v12.x, v12.y, v22.x, v22.y, v32.x, v32.y);
  noFill();
  pop();
  
  //cube 03
  push();
  set_basic_vec();
  translate(cell_x * 7, cell_y * 11);
  v1.add(vleft).mult(1 * (cell_x, cell_y));
  v2.add(vmiddle).mult(1 * (cell_x, cell_y));
  v3.add(vright).mult((1 / 3) * (cell_x, cell_y));
  make_cube_v();
  make_outline();
  fill(random(colorbg));
  quad(0, 0, v1.x, v1.y, v12.x, v12.y, v2.x, v2.y);
  quad(0, 0, v2.x, v2.y, v32.x, v32.y, v3.x, v3.y);
  quad(v2.x, v2.y, v12.x, v12.y, v22.x, v22.y, v32.x, v32.y);
  fill(random(colors11));
  line_gradient_color(v2.x,v2.y,random(colors12),random(colors11))
  quad(0, 0, v2.x, v2.y, v32.x, v32.y, v3.x, v3.y);
  noFill();
  pop();
  
  //cube 04
  push();
  set_basic_vec();
  translate(cell_x * 7, cell_y * 10);
  v1.add(vleft).mult(0.5 * (cell_x, cell_y));
  v2.add(vmiddle).mult(1 * (cell_x, cell_y));
  v3.add(vright).mult(0.5 * (cell_x, cell_y));
  make_cube_v();
  make_outline();
  fill(random(colorbg));
  quad(0, 0, v1.x, v1.y, v12.x, v12.y, v2.x, v2.y);
  quad(0, 0, v2.x, v2.y, v32.x, v32.y, v3.x, v3.y);
  quad(v2.x, v2.y, v12.x, v12.y, v22.x, v22.y, v32.x, v32.y);
  fill(random(colors11));
  line_gradient_color(v2.x,v2.y,random(colors11),random(colors12))
  quad(0, 0, v1.x, v1.y, v12.x, v12.y, v2.x, v2.y);
  noFill();
  pop();
  
  //cube b02
  push();
  set_basic_vec();
  translate(cell_x * (11-1/3), cell_y * 10);
  v1.add(vleft).mult(2 * (cell_x, cell_y));
  v2.add(vmiddle).mult(1 * (cell_x, cell_y));
  v3.add(vright).mult(0.5 * (cell_x, cell_y));
  make_cube_v();
  make_outline();
  fill(random(colorbg));
  quad(0, 0, v1.x, v1.y, v12.x, v12.y, v2.x, v2.y);
  quad(0, 0, v2.x, v2.y, v32.x, v32.y, v3.x, v3.y);
  quad(v2.x, v2.y, v12.x, v12.y, v22.x, v22.y, v32.x, v32.y);
  line_gradient_color(v12.x,v32.y,random(colors21),random(colors22))
  quad(v2.x, v2.y, v12.x, v12.y, v22.x, v22.y, v32.x, v32.y);
  noFill();
  pop();
   
  //cube 05
  push();
  set_basic_vec();
  translate(cell_x * 7, cell_y * 9);
  v1.add(vleft).mult(2 * (cell_x, cell_y));
  v2.add(vmiddle).mult(1 * (cell_x, cell_y));
  v3.add(vright).mult((1 / 3) * (cell_x, cell_y));
  make_cube_v();
  make_outline();
  fill(random(colorbg));
  quad(0, 0, v1.x, v1.y, v12.x, v12.y, v2.x, v2.y);
  quad(0, 0, v2.x, v2.y, v32.x, v32.y, v3.x, v3.y);
  quad(v2.x, v2.y, v12.x, v12.y, v22.x, v22.y, v32.x, v32.y);
  fill(random(colors11));
  line_gradient_color(v2.x,v2.y,random(colors12),random(colors11))
  quad(0, 0, v2.x, v2.y, v32.x, v32.y, v3.x, v3.y);
  noFill();
  pop();
  
  //cube 06-behind
  push();
  set_basic_vec();
  translate(cell_x * 11, cell_y * (7-1/3));
  v1.add(vleft).mult(0.5 * (cell_x, cell_y));
  v2.add(vmiddle).mult( 1* (cell_x, cell_y));
  v3.add(vright).mult((4/3) * (cell_x, cell_y));
  make_cube_v();
  make_outline();
  fill(random(colorbg));
  // quad(0, 0, v1.x, v1.y, v12.x, v12.y, v2.x, v2.y);
  quad(0, 0, v2.x, v2.y, v32.x, v32.y, v3.x, v3.y);
  quad(v2.x, v2.y, v12.x, v12.y, v22.x, v22.y, v32.x, v32.y);
  fill(random(colors11));
  // line_gradient_color(v2.x,v2.y,random(colors11),random(colors12))
  // quad(0, 0, v1.x, v1.y, v12.x, v12.y, v2.x, v2.y);
  noFill();
  pop();
  
  //cube b04
  push();
  set_basic_vec();
  translate(cell_x * 10, cell_y * 7);
  v1.add(vleft).mult(1 * (cell_x, cell_y));
  v2.add(vmiddle).mult(3 * (cell_x, cell_y));
  v3.add(vright).mult((1/3) * (cell_x, cell_y));
  make_cube_v();
  make_outline();
  fill(random(colorbg));
  quad(0, 0, v1.x, v1.y, v12.x, v12.y, v2.x, v2.y);
  quad(0, 0, v2.x, v2.y, v32.x, v32.y, v3.x, v3.y);
  quad(v2.x, v2.y, v12.x, v12.y, v22.x, v22.y, v32.x, v32.y);
  line_gradient_color(v12.x,v32.y,random(colors21),random(colors22))
  quad(v2.x, v2.y, v12.x, v12.y, v22.x, v22.y, v32.x, v32.y);
  noFill();
  pop();
  
  //cube 06
  push();
  set_basic_vec();
  translate(cell_x * 7, cell_y * 8);
  v1.add(vleft).mult(0.5 * (cell_x, cell_y));
  v2.add(vmiddle).mult(1 * (cell_x, cell_y));
  v3.add(vright).mult(1 * (cell_x, cell_y));
  make_cube_v();
  make_outline();
  fill(random(colorbg));
  quad(0, 0, v1.x, v1.y, v12.x, v12.y, v2.x, v2.y);
  quad(0, 0, v2.x, v2.y, v32.x, v32.y, v3.x, v3.y);
  quad(v2.x, v2.y, v12.x, v12.y, v22.x, v22.y, v32.x, v32.y);
  fill(random(colors11));
  line_gradient_color(v2.x,v2.y,random(colors11),random(colors12))
  quad(0, 0, v1.x, v1.y, v12.x, v12.y, v2.x, v2.y);
  noFill();
  pop();
  
  //cube b03
  push();
  set_basic_vec();
  translate(cell_x * 3, cell_y * 6);
  v1.add(vleft).mult(1 * (cell_x, cell_y));
  v2.add(vmiddle).mult(1 * (cell_x, cell_y));
  v3.add(vright).mult(1 * (cell_x, cell_y));
  make_cube_v();
  make_outline();
  fill(random(colorbg));
  quad(0, 0, v1.x, v1.y, v12.x, v12.y, v2.x, v2.y);
  quad(0, 0, v2.x, v2.y, v32.x, v32.y, v3.x, v3.y);
  quad(v2.x, v2.y, v12.x, v12.y, v22.x, v22.y, v32.x, v32.y);
  line_gradient_color(v2.y,v32.y,random(colors21),random(colors22))
  quad(v2.x, v2.y, v12.x, v12.y, v22.x, v22.y, v32.x, v32.y);
  noFill();
  pop();
  
  //cube 07
  push();
  set_basic_vec();
  translate(cell_x * 7, cell_y * 7);
  v1.add(vleft).mult(1 * (cell_x, cell_y));
  v2.add(vmiddle).mult(1 * (cell_x, cell_y));
  v3.add(vright).mult((1 / 3) * (cell_x, cell_y));
  make_cube_v();
  make_outline();
  fill(random(colorbg));
  quad(0, 0, v1.x, v1.y, v12.x, v12.y, v2.x, v2.y);
  quad(0, 0, v2.x, v2.y, v32.x, v32.y, v3.x, v3.y);
  quad(v2.x, v2.y, v12.x, v12.y, v22.x, v22.y, v32.x, v32.y);
  fill(random(colors11));
  line_gradient_color(v2.x,v2.y,random(colors12),random(colors11))
  quad(0, 0, v2.x, v2.y, v32.x, v32.y, v3.x, v3.y);
  noFill();
  pop();
  
  //cube 08
  push();
  set_basic_vec();
  translate(cell_x * 7, cell_y * 6);
  v1.add(vleft).mult(0.5 * (cell_x, cell_y));
  v2.add(vmiddle).mult(1 * (cell_x, cell_y));
  v3.add(vright).mult(0.5 * (cell_x, cell_y));
  make_cube_v();
  make_outline();
  fill(random(colorbg));
  quad(0, 0, v1.x, v1.y, v12.x, v12.y, v2.x, v2.y);
  quad(0, 0, v2.x, v2.y, v32.x, v32.y, v3.x, v3.y);
  quad(v2.x, v2.y, v12.x, v12.y, v22.x, v22.y, v32.x, v32.y);
  fill(random(colors11));
  line_gradient_color(v2.x,v2.y,random(colors11),random(colors12))
  quad(0, 0, v1.x, v1.y, v12.x, v12.y, v2.x, v2.y);
  noFill();
  pop();
 
  //cube 09
  push();
  set_basic_vec();
  translate(cell_x * 7, cell_y * 5);
  v1.add(vleft).mult(3 * (cell_x, cell_y));
  v2.add(vmiddle).mult(1 * (cell_x, cell_y));
  v3.add(vright).mult((1 / 3) * (cell_x, cell_y));
  make_cube_v();
  make_outline();
  fill(random(colorbg));
  quad(0, 0, v1.x, v1.y, v12.x, v12.y, v2.x, v2.y);
  quad(0, 0, v2.x, v2.y, v32.x, v32.y, v3.x, v3.y);
  quad(v2.x, v2.y, v12.x, v12.y, v22.x, v22.y, v32.x, v32.y);
  fill(random(colors11));
  line_gradient_color(v2.x,v2.y,random(colors12),random(colors11))
  quad(0, 0, v2.x, v2.y, v32.x, v32.y, v3.x, v3.y);
  noFill();
  pop();
  
  //cube 10
  push();
  set_basic_vec();
  translate(cell_x * 7, cell_y * 4);
  v1.add(vleft).mult(0.5 * (cell_x, cell_y));
  v2.add(vmiddle).mult(1 * (cell_x, cell_y));
  v3.add(vright).mult((5/3) * (cell_x, cell_y));
  make_cube_v();
  make_outline();
  fill(random(colorbg));
  quad(0, 0, v1.x, v1.y, v12.x, v12.y, v2.x, v2.y);
  quad(0, 0, v2.x, v2.y, v32.x, v32.y, v3.x, v3.y);
  quad(v2.x, v2.y, v12.x, v12.y, v22.x, v22.y, v32.x, v32.y);
  fill(random(colors11));
  line_gradient_color(v2.x,v2.y,random(colors11),random(colors12))
  quad(0, 0, v1.x, v1.y, v12.x, v12.y, v2.x, v2.y);
  noFill();
  pop();
  
  //cube 11
  push();
  set_basic_vec();
  translate(cell_x * 7, cell_y * 3);
  v1.add(vleft).mult(1.5 * (cell_x, cell_y));
  v2.add(vmiddle).mult(1 * (cell_x, cell_y));
  v3.add(vright).mult((1 / 3) * (cell_x, cell_y));
  make_cube_v();
  make_outline();
  fill(random(colorbg));
  quad(0, 0, v1.x, v1.y, v12.x, v12.y, v2.x, v2.y);
  quad(0, 0, v2.x, v2.y, v32.x, v32.y, v3.x, v3.y);
  quad(v2.x, v2.y, v12.x, v12.y, v22.x, v22.y, v32.x, v32.y);
  fill(random(colors11));
  line_gradient_color(v2.x,v2.y,random(colors12),random(colors11))
  quad(0, 0, v2.x, v2.y, v32.x, v32.y, v3.x, v3.y);
  noFill();
  pop();
}

function make_outline() {
  line(0, 0, v3.x, v3.y);
  line(0, 0, v1.x, v1.y);
  line(0, 0, v2.x, v2.y);
  line(v3.x, v3.y, v32.x, v32.y);
  line(v2.x, v2.y, v32.x, v32.y);
  line(v2.x, v2.y, v12.x, v12.y);
  line(v1.x, v1.y, v12.x, v12.y);
  line(v22.x, v22.y, v32.x, v32.y);
  line(v22.x, v22.y, v12.x, v12.y);
}

function line_gradient_color(x,y,color1,color2){ 
  this.x =x;
  this.y =y;
  this.color1 = color1;
  this.color2 = color2;
  this.grad = drawingContext.createLinearGradient(this.x, this.y, 0, 0);
  this.grad.addColorStop(0.05, this.color1);
  this.grad.addColorStop(0.95, this.color2);
  drawingContext.fillStyle = this.grad;
}

function keyTyped() {
  if (key === "s" || key === "S") {
    //noLoop();
    saveCanvas("Composition_NO.1_2", "png");
  }
}

