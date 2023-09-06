function setup() {
	createCanvas(800, 800);
	colorMode(HSB, 360, 100, 100, 100);

	angleMode(DEGREES);
	noSmooth();
}

function draw() {
	background(0, 0, 90);

	drawingContext.shadowColor = color(0, 0, 0, 33);
	drawingContext.shadowBlur = width / 30;
	noStroke();
	for (let k = 0; k < 5; k++) {

		for (let y = 0; y <= height; y += 100) {

			let x = -width / 2;

			while (x < width * 3 / 2) {
				let xStep = max(width / 25, random(random()) * width / 2);
				let cx1 = x + xStep / 2 + cos(y * 0.9 * k + frameCount / 3) * width / 4;
				let cx2 = x + xStep / 2 + sin(y * 1.1 * k + frameCount / 2) * width / 4;
				let cy = y;
				push()
				translate(cx1, cy);
				// rotate(cx1/10);
				if (random(100) > 50) {
					drawArc(0, 0, xStep, xStep, 0, 180, PIE, int(random(3, 6)));
				} else {
					drawTriangle(-xStep / 2, 0, xStep / 2, 0, 0, xStep / 2, int(random(3, 6)));
				}
				pop();
				push();
				translate(cx2, cy);
				// rotate(180-cx2/10);
				if (random(100) > 50) {
					drawArc(0, 0, xStep, xStep, 0 + 180, 180 + 180, PIE, int(random(3, 6)));
				} else {
					drawTriangle(-xStep / 2, 0, +xStep / 2, 0, 0, -xStep / 2, int(random(3, 6)));
				}
				pop();
				x += xStep;
			}
		}
	}
	noLoop();
}

function drawArc(cx, cy, dw, dh, sa, ea, shape, sep) {
	for (let i = 1; i > 0; i -= 1 / sep) {
		push();
		scale(i);
		strokeWeight(1 / i);
		arc(cx, cy, dw, dh, sa, ea, shape);
		pop();
	}
}

function drawTriangle(x1, y1, x2, y2, x3, y3, sep) {
	for (let i = 1; i > 0; i -= 1 / sep) {
		push();
		scale(i);
		strokeWeight(1 / i);
		triangle(x1, y1, x2, y2, x3, y3);
		pop();
	}
}