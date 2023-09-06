let f = 0;

setup = _ => {
	createCanvas(W = 400, W, WEBGL);
	noStroke();
}

draw = _ => {
	background(0);
	[W, n = 0].map(I => pointLight([W], i = TAU, I, W));
	rotateY(f);
	for(let i = 0; i < TAU; i += PI / 256){
		push();
		rotate(i);
		translate(99, 0);
		rotateY((f + i) * 3);
		if(n++ % 8 == 0) torus(20, 1);
		push();
		braid(30);
		braid(-60);
		pop();
		pop();
	}
	f += 0.01;
}

braid = b => (translate(b, 0), box(2, 3, 20));