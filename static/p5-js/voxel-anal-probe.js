let f = 0
const a = 4.2
const b = 4

p5.disableFriendlyErrors = true;

setup = _ => {
	createCanvas(w = 500, w, WEBGL);
}

draw = _ => {
	background(0);
	pointLight(w, w, w, -w, w);
	ambientLight(w / 4);
	noStroke();

	for (t = 0; t <= w; t += 0.11) {
		fill(t);
		translate(
			(a + b) * cos(t) - b * cos((a / b + 1) * t + f),
			(p = (a + b) * sin(t) - b * sin((a / b + 1) * t + f)) - 0.03, 0.13);
		box(t / w * 12);
	}
	f += 0.05;
}