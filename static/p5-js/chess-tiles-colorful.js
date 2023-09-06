//reference: @wks_js 's awesome idea about gradient!
// https://twitter.com/wks_jp/status/1405414155486580736
// https://webgradients.com
// https://github.com/itmeo/webgradients


let json;
let color_arr = [];
let texture;

function preload() {
	json = loadJSON("gradients-parsed.json", function() {
		for (let i = 0; i < Object.keys(json).length; i++) {
			color_arr.push(json[i]);
		}
	});
}

function setup() {
	createCanvas(800, 800);
	colorMode(HSB, 360, 100, 100, 100);
	angleMode(DEGREES);

	texture = createGraphics(width, height);
	texture.colorMode(HSB, 360, 100, 100, 100);
	texture.angleMode(DEGREES);

	texture.stroke(0, 0, 0, 1);
	for (let i = 0; i < (width * height * 1) / 100; i++) {
		let x = random(width);
		let y = random(height);
		let angle = 90 + random(15) * (random(100) > 50 ? -1 : 1);
		let d = width / 20;
		texture.line(
			x + cos(angle) * d,
			y + sin(angle) * d,
			x + cos(angle + 180) * d,
			y + sin(angle + 180) * d
		);
	}
}


function draw() {
	background(0, 0, 90);

	let cell = int(random(4, 12));
	for (let k = 0; k < 1; k++) {
		let cells = cell; //pow(cell, k);
		let offset = width / 15;
		let margin = 0; //offset / 3;

		let d = (width - offset * 2 - margin * (cells - 1)) / cells;

		for (let j = 0; j < cells; j++) {
			for (let i = 0; i < cells; i++) {
				let len = color_arr.length;
				let num = int(random(len));
				let gradient_palette = color_arr[num];
				color_arr.splice(num, 1);

				// print(gradient_palette);
				let angle = gradient_palette.deg;
				let gradient_colors = gradient_palette.gradient;

				let x = offset + i * (d + margin) + d / 2;
				let y = offset + j * (d + margin) + d / 2;
				let r = d / 2;

				// if (random() > 0.75) continue;
				push();
				translate(x, y);
				// scale(0.66);

				let gradient = drawingContext.createLinearGradient(
					cos(angle) * r,
					sin(angle) * r,
					cos(angle + 180) * r,
					sin(angle + 180) * r
				);

				let minC = color(0, 0, 100);
				let maxC = color(0, 0, 0);
				let n = 0;
				let minPos, maxPos;
				for (let col of gradient_colors) {
					// print(col);
					let c = color(col.color);
					if (brightness(c) < brightness(minC)) {
						minC = c;
						minPos = col.pos;
					}
					if (brightness(c) > brightness(maxC)) {
						maxC = c;
						maxPos = col.pos;
					}
					gradient.addColorStop(col.pos / 100, c);
				}

				let shadowAngle = minPos < maxPos ? 0:180;
				// gradient.addColorStop(1.0, c2);
				noStroke();
				drawingContext.fillStyle = gradient;

				drawingContext.shadowColor = color(0, 0, 0, 20);
				drawingContext.shadowBlur = d / 10;
				drawingContext.shadowOffsetX = (cos(shadowAngle) * d) / 20;
				drawingContext.shadowOffsetY = (sin(shadowAngle) * d) / 20;
				        switch (int(random(8))) {
				          case 0:
				            arc(-d / 2, -d / 2, d * 2, d * 2, 0, 90);
				            break;
				          case 1:
				            arc(d / 2, -d / 2, d * 2, d * 2, 90, 180);
				            break;
				          case 2:
				            arc(d / 2, d / 2, d * 2, d * 2, 180, 270);
				            break;
				          case 3:
				            arc(-d / 2, d / 2, d * 2, d * 2, 270, 360);
				            break;
				          case 4:
				            triangle(-d / 2, -d / 2, d / 2, d / 2, -d / 2, d / 2);

				            break;
				          case 5:
				            triangle(-d / 2, -d / 2, d / 2, d / 2, d / 2, -d / 2);
				            break;
				          case 6:
				            triangle(-d / 2, -d / 2, d / 2, -d / 2, -d / 2, d / 2);
				            break;
				          case 7:
				            triangle(-d / 2, d / 2, d / 2, d / 2, d / 2, -d / 2);
				            break;
				}
				// circle(0, 0, d);
				// rectMode(CENTER);
				// rect(0, 0, d);
				pop();
			}
		}
	}
	image(texture, 0, 0);

	noLoop();
}