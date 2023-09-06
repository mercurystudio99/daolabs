let url = [
	"https://colors.muz.li/palette/9999ff/6b7db3/e6ecff/ffd699/b3966b",
	"https://colors.muz.li/palette/072448/54d2d2/ffcb00/f8aa4b/ff6150",
	"https://colors.muz.li/palette/ffa822/134e6f/ff6150/1ac0c6/dee0e6",
	"https://colors.muz.li/palette/8a00d4/d527b7/f782c2/f9c46b/e3e3e3",
];
let palette;
let texture;

function setup() {
	createCanvas(800, 800);
	colorMode(HSB, 360, 100, 100, 100);
	angleMode(DEGREES);
	palette = createPalette(random(url));

	texture = createGraphics(width, height);
	texture.colorMode(HSB, 360, 100, 100, 100);
	texture.angleMode(DEGREES);

	texture.stroke(0, 0, 0, 2);
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
	background(0, 0, 95);

	let cell = int(random(2, 5));
	for (let k = 0; k < 3; k++) {
		let cells = pow(cell, k);
		let offset = width / 15;
		let margin = 0; // offset / 2;

		let d = (width - offset * 2 - margin * (cells - 1)) / cells;
		for (let j = 0; j < cells; j++) {
			for (let i = 0; i < cells; i++) {
				let c1 = random(palette);

				let h2 = constrain(hue(c1) + random(-15, 15), 0, 360);
				let s2 = constrain(saturation(c1) + random(-15, 15), 0, 100);
				let b2 = constrain(brightness(c1) + random(-25, -5), 0, 100);

				let c2 = color(h2, s2, b2);

				let x = offset + i * (d + margin) + d / 2;
				let y = offset + j * (d + margin) + d / 2;

				// if (random() > 0.75) continue;
				push();
				translate(x, y);
				// scale(0.66);

				let gradient = drawingContext.createLinearGradient(
					d / 2,
					-d / 2,
					-d / 2,
					d / 2
				);
				gradient.addColorStop(0, c1);
				gradient.addColorStop(1.0, c2);
				noStroke();
				drawingContext.fillStyle = gradient;

				drawingContext.shadowColor = color(0, 0, 0, 25);
				drawingContext.shadowBlur = d / 10;
				drawingContext.shadowOffsetX = (cos(90 + 45) * d) / 10;
				drawingContext.shadowOffsetY = (sin(90 + 45) * d) / 10;

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
				pop();
			}
		}
	}
	image(texture, 0, 0);

	noLoop();
}

function createPalette(_url) {
	let slash_index = _url.lastIndexOf("palette/");
	let pallate_str = _url.slice(slash_index + "palette".length + 1);
	let arr = pallate_str.split("/");
	for (let i = 0; i < arr.length; i++) {
		arr[i] = color("#" + arr[i]);
	}
	return arr;
}