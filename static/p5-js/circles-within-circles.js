//reference: @senbaku's awesome idea 
//https://twitter.com/senbaku/status/1407524300647591946
//and uila @muilavalium's clever solution
//https://twitter.com/muilavalium/status/1407907000575565825

function setup() {
	createCanvas(800, 800);
	angleMode(DEGREES);
}

function draw() {
	background(220);
	let r = sqrt(sq(width) + sq(height));
	let depth = 2;
	drawRadialCircle(width / 2, height / 2, r, depth);
	noLoop();
}

function drawRadialCircle(x, y, rMax, depth) {
	push();
	translate(x, y);

	let angleStep = 360 / 12;
	for (let angle = 0; angle < 360; angle += angleStep) {
		push();
		rotate(angle);
		// line(-r / 2, 0, r / 2, 0);
		let x = 10;
		let y = x * tan(angleStep / 2);
		let h = sqrt(sq(x) + sq(y));
		let s = (h + y) / (h - y);
		while (x < rMax) {
			push();
			circle(x, y, 2 * y);
			if (2 * y > 20 && 2 * y < width && depth > 0) {
				drawingContext.clip();
				drawRadialCircle(x, y, 2 * y, depth - 1);
			}
			pop();
			x = x * s;
			y = y * s;
		}
		pop();
	}
	pop();

	noLoop();
}