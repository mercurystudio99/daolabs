//reference: Saskia Freeke(@sasj_nl)'s awesome grid geometry sketch. 
//https://twitter.com/sasj_nl/status/1322982858521268227

let cells, offset, margin, d;

function setup() {
	createCanvas(800, 800);
	colorMode(HSB, 360, 100, 100, 100);
	angleMode(DEGREES);
}

function draw() {
	background(0, 0, 90);
	cells = int(random(2, 8));
	offset = width / 15;
	margin = offset / 10;
	d = (width - offset * 2 - margin * (cells - 1)) / cells;

	for (let j = 0; j < cells; j++) {
		for (let i = 0; i < cells; i++) {
			let x = offset + i * (d + margin) + d / 2;
			let y = offset + j * (d + margin) + d / 2;
			// rect(x, y, d, d);
			drawFancyGrid(x, y, d);
		}
	}
	frameRate(0.5);
}

function drawFancyGrid(cx, cy, d) {
	push();
	translate(cx, cy);
	rotate(int(random(4)) * 360 / 4);
	translate(-d / 2, -d / 2);

	let cells2 = int(random(2, 8));
	let offset2 = 0;
	let margin2 = 0;
	let d2 = (d - offset2 * 2 - margin2 * (cells2 - 1)) / cells2;
	let shape_num = int(random(7));
	for (let j = 0; j < cells2; j++) {
		for (let i = 0; i < cells2; i++) {
			let x = offset2 + i * (d2 + margin2) + d2 / 2;
			let y = offset2 + j * (d2 + margin2) + d2 / 2;
			// rect(x, y, d, d);
			switch (shape_num) {
				case 0:
					circle(x, y, d2);
					break;
				case 1:
					rectMode(CENTER);
					rect(x, y, d2, d2);
					break;
				case 2:
					push();
					translate(x, y);
					rotate(int(random(4)) * 360 / 4);
					translate(-d2 / 2, -d2 / 2);
					arc(0, 0, d2 * 2, d2 * 2, 0, 90, PIE);
					pop();
					break;
				case 3:
					push();
					translate(x, y);
					rotate(int(random(4)) * 360 / 4);
					translate(-d2 / 2, -d2 / 2);
					triangle(0, 0, d2, d2, d2, 0);
					pop();
					break;
				case 4:
					push();
					translate(x, y);
					rotate(int(random(4)) * 360 / 4);
					translate(-d2 / 2, -d2 / 2);
					quad(0, 0, d2 / 2, 0, d2, d2, d2 / 2, d2)
					pop();
					break;
				case 5:
					push();
					translate(x, y);
					rotate(45);
					rectMode(CENTER);
					rect(0, 0, sqrt(sq(d2) / 2));
					pop();
					break;
				case 6:
					push();
					translate(x, y);
					rectMode(CENTER);
					rotate(int(random(4)) * 360 / 4);
					rect(0, 0, d2, d2, 0, d2, 0, d2);
					pop();
					break;
			}

		}
	}
	pop();
}