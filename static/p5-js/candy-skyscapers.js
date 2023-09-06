let palette;

function setup() {
	createCanvas(2000, 2000);
	colorMode(HSB, 360, 100, 100, 100);
	angleMode(DEGREES);
	palette = shuffle(chromotome.get().colors);
	while (palette.length < 3) {
		palette = shuffle(chromotome.get().colors);
	}
	for (let i = 0; i < palette.length; i++) {
		palette[i] = color(palette[i]);
	}
	noLoop();
}

function draw() {
	randomSeed(100);

	background(random(palette));

	let minY = -height;
	let minX = -width / 10;
	let maxY = height;
	let maxW = width + width / 10;

	let x = minX;
	let y = minY;
	let xStep, yStep;
	while (y < maxY) {
		yStep = random(height / 15);
		x = minX;
		while (x < maxW) {
			xStep = random(width / 10, width / 5);
			if (random(100) > 50) {
				drawBuilding(
					x,
					y + random(-height / 10, height / 10),
					xStep,
					height - y + height / 10
				);
			}
			x += xStep;
		}
		y += yStep;
	}

	// filter(GRAY);
}

function drawBuilding(x, y, w, h) {
	noStroke();

	let colors = shuffle(palette.concat());
	let c1 = colors[0];
	let c2 = colors[1];
	let c3 = colors[2];

	let r = w / random(1.5, 5);

	let angle = -30;

	let tx1 = x;
	let ty1 = y;
	let tx2 = x + w - cos(angle) * r;
	let ty2 = y;
	let tx3 = tx2 + cos(angle) * r;
	let ty3 = ty2 + sin(angle) * r;
	let tx4 = tx1 + cos(angle) * r;
	let ty4 = ty1 + sin(angle) * r;

	push();
	fill(0, 0, 90);
	drawingContext.shadowColor = color(0, 0, 0, 33);
	drawingContext.shadowBlur = w / 5;

	beginShape();
	vertex(tx1, ty1);
	vertex(tx4, ty4);
	vertex(tx3, ty3);
	vertex(tx3, ty3 + h);
	vertex(tx4, ty4 + h);
	vertex(tx1, ty1 + h);
	endShape(CLOSE);
	pop();

	let _tw = tx2 - tx1;
	let _th = abs(ty3 - ty2);
	// quad(tx1, ty1, tx2, ty2, tx3, ty3, tx4, ty4);

	let myColor = [color(0, 0, 100, 0), colors[0]];

	push();
	translate(x, y);
	shearX(90 - angle);
	scale(1, -1);

	angleMode(RADIANS);
	let np = max(_tw, _th);
	patternColors(myColor);
	patternAngle(random(TWO_PI));
	pattern(randPattern(random(np / 15, np)));
	rectPattern(0, 0, _tw, _th);
	angleMode(DEGREES);

	pop();

	let rh = h - sin(angle) * r;
	let rw = w - cos(angle) * r;

	push();
	translate(x, y);
	colors = shuffle(palette);
	angleMode(RADIANS);
	np = max(rh, rw);
	patternColors(myColor);
	patternAngle(random(TWO_PI));
	pattern(randPattern(random(np / 15, np)));
	rectPattern(0, 0, rw, rh);
	angleMode(DEGREES);

	fill(0, 0, 0, 15);
	rect(0, 0, rw, rh);

	pop();

	push();
	fill(0, 0, 100, 0);
	quad(tx2, ty2, tx3, ty3, tx3, ty3 + rh, tx2, ty2 + rh);
	drawingContext.clip();
	push();
	translate(tx2, ty2);
	shearY(angle);
	patternColors(myColor);
	angleMode(RADIANS);
	// patternAngle(random(TWO_PI));
	pattern(randPattern(random(np / 15, np)));
	rectPattern(0, 0, rw, rh);
	angleMode(DEGREES);

	pop();
	fill(0, 0, 0, 30);
	quad(tx2, ty2, tx3, ty3, tx3, ty3 + rh, tx2, ty2 + rh);

	pop();
}

function randPattern(t) {
	const ptArr = [
		PTN.stripe(t / int(random(6, 12))),
		// PTN.stripeCirce(t / int(random(6, 12))),

		// PTN.stripeRadial(TAU / int(random(3, 10))),
		PTN.wave(t / int(random(1, 3)), t / int(random(10, 20)), t / 5, t / 10),
		PTN.dot(t / 10, (t / 10) * random(0.2, 1)),
		PTN.checked(t / int(random(5, 20)), t / int(random(5, 20))),
		PTN.cross(t / int(random(10, 20)), t / int(random(20, 40))),
		// PTN.triangle(t / int(random(5, 20)), t / int(random(5, 20))),
	];
	return random(ptArr);
}