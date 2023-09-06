function setup() {
	createCanvas(windowWidth, windowHeight);
}

function draw() {
	background(240);
	let offset = -width / 10;
	noFill();
	let yStep = (height + offset * 2) / 15;
	for (let y = offset; y <= height - offset; y += yStep) {
		let num = int(1 + 3 * noise(y/100, frameCount / 100));
		let arr = [];
		for (let i = 0; i < num; i++) {
			let n = sq(sq(noise(y / 10, frameCount / 200))) * (width - offset * 2);
			n = max(n, 1);
			arr.push(n);
		}
		drawingContext.setLineDash(arr);
		drawingContext.lineDashOffset = y - frameCount / 10;
		strokeWeight(yStep/1.5);
		strokeCap(SQUARE);
		beginShape();
		for(let x = offset ; x < width - offset; x += 5){
			let ny = y + sin(y/330+x/300) * 150 * sin(frameCount/60) * cos(y/300);
			vertex(x,ny);
		}
		endShape();
	}
}