let patterns = [];
let palette = [];
let canvas;

function setup() {
	canvas = createCanvas(500, 500, WEBGL);
	colorMode(HSB, 360, 100, 100, 100);

	angleMode(DEGREES);
	noStroke();

	ortho(-width / 2, width / 2, -height / 2, height / 2, -5000, 5000);

	while (palette.length < 3) {
		palette = shuffle(chromotome.get().colors);
	}

	for (let i = 0; i < 50; i++) {
		pc = random(palette);
		c = random(palette);
		while (pc == c) {
			c = random(palette);
		}
		let num = int(random(1, 4)) * 5;
		let pattern = createGraphics(num, num);
		pattern.background(pc);
		pattern.patternColors([pc, c]);
		pattern.patternAngle(random(TAU));
		pattern.pattern(randPattern(pattern.width, i));
		pattern.rectPattern(0, 0, pattern.width, pattern.height);
		patterns.push(pattern);
	}
}

function draw() {
	if (frameCount % (360 * 3) == 0) {
		palette = shuffle(chromotome.get().colors);
	}
	background(0, 0, 20);
	randomSeed(frameCount / (360 * 3));
	// orbitControl();
	ambientLight(0, 0, 40);
	directionalLight(color(0, 0, 70), 1, 0, -1);
	directionalLight(color(0, 0, 30), -1, 0, -1);
	directionalLight(color(0, 0, 50), 0, 1, 0);
	let offset = width / 15;

	let x = 0;
	let y = 0;
	let z = 0;

	let d = width * 2.75;
	let minD = width / 3;

	noStroke();
	push();
	rotateX(-15 * sin(frameCount / 3) - 40);
	rotateY(45 + frameCount / 3);
	translate(-d / 2, 0, -d / 2);
	separateGrid(x, y, z, d, minD);
	pop();

	// noLoop();
}

function separateGrid(x, y, z, d, minD) {
	let sep = int(random(2, 5));
	let w = d / sep;
	for (let j = 0; j < sep; j++) {
		for (let i = 0; i < sep; i++) {
			let nx = x + i * w;
			let nz = z + j * w;
			if (random(100) < 95 && w > minD) {
				separateGrid(nx, 0, nz, w, minD);
			} else {
				let h = random(minD / 5, d);
				let ny = -h / 2;
				push();
				translate(nx + w / 2, ny, nz + w / 2);
				// fill(random(palette));
				// if(random(100) > 50){
				// rotateX(180);
				//   cone(w * 0.4,h,int(random(5,10)));
				// }else{
				let g = random(patterns);
				let tex = canvas.getTexture(g);
				tex.setInterpolation(NEAREST, NEAREST);
				texture(g);
				box(w * 0.9, h, w * 0.9);
				// }
				pop();
			}
		}
	}
}

function randPattern(t, i) {
	const ptArr = [
		PTN.stripe(t / int(random(6, 12))),
		PTN.stripeCircle(t / int(random(6, 12))),
		PTN.stripePolygon(int(random(3, 7)), int(random(6, 12))),
		// PTN.stripeRadial(TAU / int(2 * random(1, 10))),
		PTN.wave(t / int(random(1, 3)), t / int(random(10, 20)), t / 5, t / 10),
		PTN.dot(t / 10, (t / 10) * random(0.2, 1)),
		PTN.checked(t / int(random(5, 20)), t / int(random(5, 20))),
		PTN.cross(t / int(random(10, 20)), t / int(random(20, 40))),
		PTN.triangle(t / int(random(5, 20)), t / int(random(5, 20))),
	];
	return ptArr[i % ptArr.length];
}