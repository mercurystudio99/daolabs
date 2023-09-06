### Open Processing

A render which processes arbitrary p5.js sketches for NFTs should expect to be called via its route, and pass either base64 encoded JSON which contains various keys and values including data payload of the base64 encoded p5.js sketch, or the script key to contain the IPFS CID of the p5.js sketch.

In order to render the sketch, prepared sketches may have updated `createCanvas` to conform to the canvas resolution of the playback environment. Other keys for the JSON payload may include random seeds, expressed as an array of which the original script random seeds are stripped out and provided outside the executing code. This is to allow for deterministic rendering of the sketch, and to allow for the same sketch to be rendered in multiple contexts.

#### Organization of p5.js sketches

The p5.js sketches contained in this directory are intended to be deployed to IPFS and accessible as loadable examples for users for backgrounds, or to create a p5.js sketch NFT. The sketches are named corresponding with the same name within `static` which contains an image of the output. Where possible, the canvas resolution has been updated to 450x450px.

```js
let f = 0;
const a = 4.2;
const b = 4;

p5.disableFriendlyErrors = true;

setup = (_) => {
	createCanvas((w = 500), w, WEBGL);
};

draw = (_) => {
	background(0);
	pointLight(w, w, w, -w, w);
	ambientLight(w / 4);
	noStroke();

	for (t = 0; t <= w; t += 0.11) {
		fill(t);
		translate(
			(a + b) * cos(t) - b * cos((a / b + 1) * t + f),
			(p = (a + b) * sin(t) - b * sin((a / b + 1) * t + f)) - 0.03,
			0.13
		);
		box((t / w) * 12);
	}
	f += 0.05;
};
```

```js
let t = 0;

setup = (_) => {
	createCanvas((W = 500), W);
};

draw = (_) => {
	background(0);
	noStroke();

	const g = drawingContext.createRadialGradient(W / 2, W / 2, W / 4, W / 2, W / 2, W / 1.75);
	g.addColorStop(0.5, 'white');
	g.addColorStop(0.9, '#aaa');
	g.addColorStop(1, '#999');
	blendMode(MULTIPLY);
	drawingContext.fillStyle = g;
	rect(0, 0, W, W);

	for (i = 0; i < 20; i++) {
		push();
		let j = i + (t % 1);
		let x = cos(j / TAU) * 250 + 250;
		let w = sin(j / TAU) * 20;
		blendMode(EXCLUSION);
		rect(x, 0, w, W);
		rect(0, x, W, w);
		pop();
	}
	translate(250, -100);
	rotate(QUARTER_PI);

	drawingContext.shadowBlur = 150;
	drawingContext.shadowColor = 'black';

	fill(0);
	rect(125, 125, W / 2, W / 2);
	fill(W);

	for (i = 10; i > 0; i--) {
		push();
		let j = i - (t % 1);
		let x = cos(j / PI) * 125 + 250;
		let w = sin(j / PI) * 20;
		blendMode(EXCLUSION);
		rect(x, 125, w, W / 2);
		rect(125, x, W / 2, w);
		pop();
	}

	t += 0.025;
};
```
