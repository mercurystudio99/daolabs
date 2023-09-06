let font;
let str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789,."
let graphics;

function preload() {
  font = loadFont("SRM_glyph-Semibold_beta.otf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  graphics = createGraphics(width, height);
  graphics.colorMode(HSB, 360, 100, 100, 100);
  graphics.stroke(0, 0, 0, 10);
  for (let i = 0; i < width * height * 5 / 100; i++) {
    graphics.point(random(graphics.width),
      random(graphics.height));
  }
  textFont(font);    
  noLoop();
}

function draw() {
  background(0, 0, 95);
  let offset = width / 10;
  separateGrid(-offset, -offset, max(width, height) + offset * 2);
  frameRate(1);
  image(graphics, 0, 0);
  //noLoop();
}

function separateGrid(x, y, d) {
  let sepNum = int(random(1, 4));
  let w = d / sepNum;
  for (let i = x; i < x + d - 1; i += w) {
    for (let j = y; j < y + d - 1; j += w) {
      if (random(100) < 90 && d > width / 5) {
        separateGrid(i, j, w);
      } else {

        let angle1 = random(360);
        let angle2 = (angle1+180)%360;
        
        let gradient = drawingContext.createLinearGradient(i,j,i+w,j+w);
        drawingContext.fillStyle = gradient;
        gradient.addColorStop(0,color(angle1,100,100));
        gradient.addColorStop(1,color(angle2,100,100));

        
        //rect(i, j, w, w);
        textAlign(CENTER, CENTER);
        // stroke(0,0,100);
        // strokeWeight(w/10);
        let s = str[int(random(str.length))];
        push();
        if (s != "G") {
          textSize(w * 1.2);
          text(s, i + w / 2, j + w / 2 - w / 5);
        } else {
          textSize(w * 1.1);
          text(s, i + w / 2, j + w / 2 - w / 4);
        }
        drawingContext.clip();
        rect(i,j,w,w);
        pop();
        if (s != "G") {
          textSize(w * 1.2);
          text(s, i + w / 2*0.99, j + w / 2*0.99 - w / 5);
        } else {
          textSize(w * 1.1);
          text(s, i + w / 2*0.99, j + w / 2*0.99 - w / 4);
        }
      }
    }
  }
}
