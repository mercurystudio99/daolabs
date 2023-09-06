function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  angleMode(DEGREES);
}

function draw() {
  clear();
  let offset = width / 20;
  let xMin = -offset;
  let yMin = -offset;
  let xMax = width + offset;
  let yMax = height + offset;

  let yBand = yMax - yMin;
  let xBand = xMax - xMin;

  let x = xMin;
  let y = yMin;
  let xStep, yStep;
  while (y < yMax) {
    x = xMin;
    yStep = random([yBand / 15, yBand / 25]);
    while (x < xMax) {
      xStep = random([yStep, yStep * 2, yStep, yStep * 3]);

      push();
      translate(x + xStep / 2, y + yStep / 2);
      scale((yStep - 10) / yStep);
      generateCarGraphics(0, 0, xStep, yStep);
      pop();

      x += xStep;
    }
    y += yStep;
  }

  let g = get();
  background(0, 0, 90);
  push();
  drawingContext.shadowColor = color(0, 0, 0, 30);
  drawingContext.shadowBlur = width / 20;
  image(g, 0, 0);
  pop();
  noLoop();
}

function generateCarGraphics(cx, cy, w, h) {
  let colors = shuffle(random(colorScheme).colors.concat());

  let body_color = colors[0];
  let tire_color = colors[1];
  let body_dark_color = color(
    hue(body_color),
    constrain(saturation(body_color) - 10, 0, 100),
    constrain(brightness(body_color) - 20, 0, 100)
  );
  let wheel_color = colors[2];
  let window_color = colors[3];
  let light_color = colors[4];

  push();
  translate(cx, cy);
  rectMode(CENTER);
  stroke(0, 0, 20);
  // noStroke();
  // rect(0, 0, w, h);
  // noFill();

  let car_body_width = w;
  let car_tire_size = random(car_body_width / 18, car_body_width / 5);
  let car_tire_wheel_size = random(car_tire_size / 4, car_tire_size / 2);
  let car_tire_fender_size = constrain(
    car_tire_size * random(1.5, 3),
    0,
    car_body_width / 2.5
  );
  let car_tire_fender_size2 = constrain(
    car_tire_fender_size * random(0.5, 1),
    car_tire_size * 1.1,
    car_tire_fender_size
  );

  let car_tire_x = car_body_width / 2 - car_tire_fender_size / 2;
  let car_body_height = h - car_tire_size / 2;
  let car_roof_width = random(car_tire_x, car_tire_x + car_tire_x);
  let car_roof_height = h - car_tire_size / 2 - car_tire_fender_size / 2;
  let car_roof_round = random(max(car_roof_width, car_roof_height)) / 4;

  push();
  translate(0, h / 2 - car_tire_size / 2);
  push();
  translate(0, -car_tire_fender_size / 4);
  rectMode(CENTER);
  push();
  fill(body_color);
  beginShape();
  for (let angle = 180; angle <= 270; angle += 1) {
    let r = car_tire_fender_size / 2;
    let x = -car_tire_x + cos(angle) * r;
    let y = +car_tire_fender_size / 4 + sin(angle) * r;
    vertex(x, y);
  }
  for (let angle = 270; angle <= 360; angle += 1) {
    let r = car_tire_fender_size / 2;
    let x = +car_tire_x + cos(angle) * r;
    let y = +car_tire_fender_size / 4 + sin(angle) * r;
    vertex(x, y);
  }
  endShape(CLOSE);
  drawingContext.clip();
  fill(light_color);
  circle(-car_tire_x - car_tire_fender_size / 2, 0, car_tire_fender_size);
  circle(+car_tire_x + car_tire_fender_size / 2, 0, car_tire_fender_size);

  pop();
  // rect(0,0,car_tire_x * 2, car_tire_fender_size / 2);
  pop();
  push();

  translate(0, -car_tire_fender_size / 2 - car_roof_height / 2);
  fill(body_color);
  rect(
    0,
    0,
    car_roof_width,
    car_roof_height,
    car_roof_round,
    car_roof_round,
    0,
    0
  );
  drawingContext.clip();

  push();
  translate(-car_roof_width / 2, (car_roof_height * 2) / 10);
  fill(window_color);
  rect(
    0,
    0,
    car_roof_width / 5,
    (car_roof_height * 8) / 10,
    car_roof_round / 4
  );
  pop();

  push();
  translate(car_roof_width / 2, (car_roof_height * 2) / 10);
  fill(window_color);
  rect(
    0,
    0,
    car_roof_width / 5,
    (car_roof_height * 8) / 10,
    car_roof_round / 4
  );
  pop();

  push();
  fill(window_color);
  let rs = random(0.5, 2);
  rect(
    -car_roof_width / 5 / rs,
    (car_roof_height * 2) / 10,
    car_roof_width / 5,
    (car_roof_height * 8) / 10,
    car_roof_round / 4,
    0,
    0,
    car_roof_round / 4
  );
  rect(
    car_roof_width / 5 / rs,
    (car_roof_height * 2) / 10,
    car_roof_width / 5,
    (car_roof_height * 8) / 10,
    0,
    car_roof_round / 4,
    car_roof_round / 4,
    0
  );

  pop();

  pop();

  push();
  translate(car_tire_x, 0);
  fill(body_dark_color);
  arc(0, 0, car_tire_fender_size2, car_tire_fender_size2, 180, 360, PIE);
  fill(tire_color);
  circle(0, 0, car_tire_size);
	for(let d = car_tire_size*0.95; d > car_tire_wheel_size; d -= car_tire_size/10){
		push();
		rotate(-d/2);
		drawingContext.setLineDash([d/TAU/2]);
		stroke(0,0,20);
		strokeWeight(car_tire_size/20);
		noFill();
		circle(0,0,d);
		pop();
	}
  fill(wheel_color);
  circle(0, 0, car_tire_wheel_size);
  pop();
  push();
  translate(-car_tire_x, 0);
  fill(body_dark_color);
  arc(0, 0, car_tire_fender_size2, car_tire_fender_size2, 180, 360, PIE);
  fill(tire_color);
  circle(0, 0, car_tire_size);
	
	for(let d = car_tire_size*0.95; d > car_tire_wheel_size; d -= car_tire_size/10){
		push();
		rotate(d/2);
		drawingContext.setLineDash([d/TAU/2]);
		stroke(0,0,20);
		strokeWeight(car_tire_size/20);
		noFill();
		circle(0,0,d);
		pop();
	}
	
  fill(wheel_color);
  circle(0, 0, car_tire_wheel_size);
  pop();
  pop();

  pop();
}

let colorScheme = [
  {
    name: "Benedictus",
    colors: ["#F27EA9", "#366CD9", "#5EADF2", "#636E73", "#F2E6D8"],
  },
  {
    name: "Cross",
    colors: ["#D962AF", "#58A6A6", "#8AA66F", "#F29F05", "#F26D6D"],
  },
  {
    name: "Demuth",
    colors: ["#222940", "#D98E04", "#F2A950", "#BF3E21", "#F2F2F2"],
  },
  {
    name: "Hiroshige",
    colors: ["#1B618C", "#55CCD9", "#F2BC57", "#F2DAAC", "#F24949"],
  },
  {
    name: "Hokusai",
    colors: ["#074A59", "#F2C166", "#F28241", "#F26B5E", "#F2F2F2"],
  },
  {
    name: "Hokusai Blue",
    colors: ["#023059", "#459DBF", "#87BF60", "#D9D16A", "#F2F2F2"],
  },
  {
    name: "Java",
    colors: ["#632973", "#02734A", "#F25C05", "#F29188", "#F2E0DF"],
  },
  {
    name: "Kandinsky",
    colors: ["#8D95A6", "#0A7360", "#F28705", "#D98825", "#F2F2F2"],
  },
  {
    name: "Monet",
    colors: ["#4146A6", "#063573", "#5EC8F2", "#8C4E03", "#D98A29"],
  },
  {
    name: "Nizami",
    colors: ["#034AA6", "#72B6F2", "#73BFB1", "#F2A30F", "#F26F63"],
  },
  {
    name: "Renoir",
    colors: ["#303E8C", "#F2AE2E", "#F28705", "#D91414", "#F2F2F2"],
  },
  {
    name: "VanGogh",
    colors: ["#424D8C", "#84A9BF", "#C1D9CE", "#F2B705", "#F25C05"],
  },
  {
    name: "Mono",
    colors: ["#D9D7D8", "#3B5159", "#5D848C", "#7CA2A6", "#262321"],
  },
  {
    name: "RiverSide",
    colors: ["#906FA6", "#025951", "#252625", "#D99191", "#F2F2F2"],
  },
];
