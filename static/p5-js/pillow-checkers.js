let t = 0

setup = _ => {
	createCanvas(W = 500, W);
}

draw = _ => {
	background(0);
	noStroke();

	const g = drawingContext.createRadialGradient(W / 2, W / 2, W / 4, W / 2, W / 2, W / 1.75);
	g.addColorStop(0.5, 'white');
	g.addColorStop(0.9, '#aaa');
	g.addColorStop(1, '#999');
	blendMode(MULTIPLY)
	drawingContext.fillStyle = g;
	rect(0, 0, W, W)

	for (i = 0; i < 20; i++) {
		push()
		let j = i + t % 1
		let x = cos(j / TAU) * 250 + 250
		let w = sin(j / TAU) * 20
		blendMode(EXCLUSION)
		rect(x, 0, w, W)
		rect(0, x, W, w)
		pop()
	}
	translate(250, -100)
	rotate(QUARTER_PI);
	
	drawingContext.shadowBlur = 150;
	drawingContext.shadowColor = 'black';

	fill(0)
	rect(125, 125, W / 2, W / 2)
	fill(W)

	for (i = 10; i > 0; i--) {
		push()
		let j = i - t % 1
		let x = cos(j / PI) * 125 + 250
		let w = sin(j / PI) * 20
		blendMode(EXCLUSION)
		rect(x, 125, w, W / 2)
		rect(125, x, W / 2, w)
		pop()
	}

	t += .025
}