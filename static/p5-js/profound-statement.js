// Community Statement on “NFT art” Logo
/*
 * creator : Takawo Shunsuke (@takawo)
 * web : https://nft-art-statement.github.io/
 * License : CreativeCommons Attribution NonCommercial ShareAlike https://creativecommons.org/licenses/by-nc-sa/3.0/
 * release : 2022/02/20
 */

let str = "This statement is profound.”".replace(/ /g, "");
let font;
let colors;

function preload() {
	font = loadFont("Montserrat-SemiBoldItalic.ttf");
}

function setup() {
	createCanvas(800, 800);
	colorMode(HSB, 360, 100, 100, 100);
	angleMode(DEGREES);
	pixelDensity(2);
	
	colors = [color(0, 0, 100), color(0, 0, 90), color(0, 0, 0)];
	randomSeed(20220220);
}

function draw() {
	clear();

	let offset = width / 6;
	let margin = 0;

	drawFrame(
		offset / 2 - 1,
		offset / 2 - 1,
		width - offset + 2,
		height - offset + 2,
		offset / 2
	);

	let _str = str;

	fill(colors[1]);
	rect(offset, offset, width - offset * 2, height - offset * 2);

		let kMax = 5;
	let cellsMin = ceil(sqrt(_str.length));
	let cellsMax = cellsMin * 1.5;
	let cells = round(random(cellsMin, cellsMax));

	let d = (width - offset * 2 - margin * (cells - 1)) / cells;
	for (let k = 0; k < kMax; k++) {
		let arr = [];
		for (let i = 0; i < cells * cells; i++) {
			arr.push(random());
		}
		let selected_arr = arr.concat();
		selected_arr.sort(function(a, b) {
			return b - a;
		});
		selected_arr.length = _str.length;
		for (let i = 0; i < cells; i++) {
			for (let j = 0; j < cells; j++) {
				let n = i + j * cells;
				let num = arr[n];
				let x = offset + j * (d + margin) + d / 2;
				let y = offset + i * (d + margin) + d / 2;
				let rotate_num = int(random(4));
				if (k == kMax - 1 && selected_arr.includes(num)) {
					push();
					textAlign(CENTER, CENTER);
					textSize(d / 1.2);
					textStyle(BOLD);
					textFont(font);
					push();
					strokeWeight(d / 7);
					strokeJoin(ROUND);
					stroke(colors[0]);
					fill(colors[2]);
					text(_str.substr(0, 1), x, y - d / 7);
					pop();
					_str = _str.slice(1);
					pop();
				} else {
					push();
					translate(x, y);
					rotate((rotate_num + k) * 360 / 4);
					push();
					translate(-d / 2, -d / 2);
					noStroke();
					pop();
					let v = 0;
					for (let e = d * 2; e > (d * 2) / 5; e -= (d * 2) / 5) {
						fill(v++ % 2 == 0 ? colors[1] : colors[0]);
						arc(-d / 2, -d / 2, round(e), round(e), 0, 90);
					}
					pop();
				}
			}
		}
	}
	noLoop();
}

function drawFrame(x, y, w, h, o) {
	let bool = random() > 0.5;
	drawSideRect(x, y, o, o, bool);
	drawSideRect(x + w - o, y, o, o + 0.01, bool);
	drawSideRect(x, y + h - o, o, o + 0.01, bool);
	drawSideRect(x + w, y + h, -o, -o, !bool);

	drawSideRect(x + o, y, w - o * 2, o);
	drawSideRect(x + o, y + h, w - o * 2, -o);

	drawSideRect(x, y + o, o, h - o * 2);
	drawSideRect(x + w - o, y + o, o, h - o * 2);
}

function drawSideRect(x, y, w, h, isHorizontal = random() > 0.5) {
	fill(colors[0]);
	rect(x, y, w, h);
	push();
	translate(x, y);
	let o;
	let sep = int(random([2, 3, 4, 5]));
	let step = sep + (sep - 1) + 2;

	if (w == h) {
		if (h < 0) scale(1, -1);
		if (w < 0) scale(-1, 1);
		o = abs(h / step);
		for (let i = 0; i < step; i++) {
			if (i % 2 == 1) {
				if (isHorizontal) {
					fill(colors[i % 2]);
					rect(o, o * i, abs(w) - o * 2, o);
				} else {
					fill(colors[i % 2]);
					rect(o, o * i, abs(w) - o * 2, o);
				}
			}
		}
	} else if (abs(w) > abs(h)) {
		if (h < 0) scale(1, -1);
		o = abs(h / step);
		for (let i = 0; i < step; i++) {
			if (i % 2 == 1) {
				fill(colors[i % 2]);
				rect(o, o * i, abs(w) - o * 2, o);
			}
		}
	} else {
		if (w < 0) scale(-1, 1);
		o = abs(w / step);
		for (let i = 0; i < step; i++) {
			if (i % 2 == 1) {
				fill(colors[i % 2]);
				rect(o * i, o, o, abs(h) - o * 2);
			}
		}
	}
	pop();
}