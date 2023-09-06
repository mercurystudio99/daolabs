let palette;
let rs;

function setup() {
  createCanvas(800, 800, WEBGL);
  colorMode(HSB, 360, 100, 100, 100);
  angleMode(DEGREES);

  palette = [color(200, 50, 100), color(0, 30, 100)];
  ortho(-width / 2, width / 2, -height / 2, height / 2, -5000, 5000);
  rs = random(10000);
}

function draw() {
  background(20, 10, 80);

  randomSeed(rs);

  directionalLight(color(0, 0, 100), 0, 0, -1);
  directionalLight(color(0, 0, 50), 0, 0, 1);
  directionalLight(color(0, 0, 100), 1, 0, 0);
  directionalLight(color(0, 0, 100), 0, 1, 0);

  let offset = -width / 15;
  separateGrid(-width / 2 - offset, -height / 2 - offset, width + offset * 2);
  noLoop();
}

function separateGrid(x, y, d) {
  let sepNum = int(random(1, 5));
  let w = d / sepNum;

  for (let i = x; i < x + d - 1; i += w) {
    for (let j = y; j < y + d - 1; j += w) {
      if ((random(100) < 90 && w > width / 15) || d > width * 1.1) {
        separateGrid(i, j, w);
      } else {
        let cx = i + w / 2;
        let cy = j + w / 2;
        push();
        translate(cx, cy, 0);
        scale(0.8);
        itokiriMochi(0, 0, 0, w / 1.5);
        pop();
      }
    }
  }
}

function itokiriMochi(x, y, z, size) {
  push();
  translate(x, y, z);
  rotateX(random(-90));
  rotateY(random(-90, 90) / 2);
  // rotateZ(random(-90,90));

  rotateX(90);
  noStroke();
  push();
  scale(1, 1, 0.5);
  fill(0, 0, 100);
  cylinder(size / 2, size, 64, 64);
  scale(0.66, 1.01, 0.66);
  fill(0, 0, 10);
  cylinder(size / 2, size, 64, 64);

  let n = 0;
  for (let angle = -90 + 70; angle <= -90 + 90 + 20; angle += 20) {
    let x = sin(angle) * size * 0.75;
    let z = cos(angle) * size * 0.75;
    push();
    translate(x, 0, z);
    rotateX(90);
    rotate(-angle);
    fill(palette[n++ % palette.length]);
    box((15 / 200) * size, (30 / 200) * size, size * 0.9);
    pop();
  }
  pop();
  pop();
}
