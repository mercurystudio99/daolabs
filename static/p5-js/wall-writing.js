function setup() {
	createCanvas(800, 800);
	colorMode(HSB, 360, 100, 100, 100);
	angleMode(DEGREES);
}

function draw() {
	background(0, 0, 95);

	let offset = width / 25;
	let x = offset;
	let y = offset;
	let w = width - offset * 2;
	let h = height - offset * 2;
	let minD = offset * 2;

	separateGrid(x, y, w, h, minD);

	noLoop();
}

function separateGrid(x, y, w, h, minD) {
	let sep = int(random(2, 5));
	let nw = w / sep;
	let nh = h / sep;
	for (let j = 0; j < sep; j++) {
		for (let i = 0; i < sep; i++) {
			let nx = x + i * nw;
			let ny = y + j * nh;
			if (random() < 0.9 && min(nw, nh) > minD) {
				separateGrid(nx, ny, nw, nh, minD);
			} else {
				push();
				// rect(nx, ny, nw/2, nh);
				// drawingContext.clip();
				let scl = max(nw, nh) / 25;
				push();
				translate(nx + nw / 2, ny + nh / 2);
				rotate(int(random(4)) * 360 / 4);
				noFill();
				stroke(0);
				scale(scl);
				strokeWeight(1 / scl);
				let str = String.fromCharCode(65 + int(random(26)));
				P5.hershey.putText(str, {
					cmap: FONT_HERSHEY.GOTHIC_ENGLISH_TRIPLEX,
					align: "center",
					noise: 0,
				});
				pop();
				pop();
			}
		}
	}
}