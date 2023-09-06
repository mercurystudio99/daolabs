let roadCords = []
let padding = 120

function setup() {
	createCanvas(500, 500);
	background(220);
	const roadCords = buildRoads()
	push()
		roadCords.forEach(([x, y]) => {
			noStroke()
			fill("salmon")
			let _x = padding + x
			let _y = padding + y
			ellipse(_x, _y, 5)
		})
	pop()
	
	let yMax = height-padding*2
	let _currentX = 0
	let xMax = width-padding*2
	let colIndex = 0
	while (_currentX < xMax) {
		let currentY = 0
		let buildingIndex = 0
		while (currentY < yMax) {
			let px = currentY/yMax
			let cWidth = random(15, 50)
			let cDepth = random(20, 35)
			let x =
				padding +
				_currentX +
				noise(colIndex/4 + buildingIndex/4) * (75+colIndex*4) +
				sin(colIndex/2 + buildingIndex/3) * 20
			let y = padding + currentY
			drawCeiling({
				x,
				y,
				px,
				cDepth,
				cWidth,
			})
			currentY += cWidth * 1.1
			buildingIndex++
			push()
				fill("tomato")
				// ellipse(x, y, 7)
			pop()
		}
		colIndex++
		_currentX += 100
	}
}

function draw() {}

function buildRoads() {
	// main road (N-S)
	let unitSize = 30
	let xMax = width-padding*2
	let xMid = xMax/2
	let yMax = height-padding*2
	let x = xMid * random(0.8, 1.2) // somewhere in the middle
	let y = 0
	let xDelta = random(-1, 1)
	while(y < yMax) {
		roadCords.push([x, y])
		y += unitSize
		x += xDelta * 15
	}
	return roadCords
}

function drawCeiling({ x, y, px, cDepth, cWidth }) {
	let cd = cDepth // ceiling depth
	let cw = cWidth // ceiling width
	let leftX = -cd
	let midX = 0
	let rightX = cd
	let yShift = map(px, 0, 1, 8, -8)
	let topY = y
	let bottomY = y + cw
	let cords = [
		...randomCords([x+leftX, topY+yShift], [x, topY], 3), // top left to mid
		...randomCords([x, topY], [x+rightX, topY+yShift], 3), // mid to top right
		...randomCords([x+rightX, topY+yShift], [x+rightX, topY+yShift+cw], 3), // right border
		...randomCords([x+rightX, topY+yShift+cw], [x, bottomY], 3), // bottom right to mid
		...randomCords([x, bottomY], [x+leftX, bottomY+yShift], 3), // mid to bottom left
		...randomCords([x+leftX, bottomY+yShift], [x+leftX, topY+yShift], 3), // mid to bottom left
	]
	noFill()
	strokeWeight(0.6)
	beginShape()
		cords.forEach(([x, y]) => {
			push()
				curveVertex(x + random(-2, 2), y + random(-2, 2))
			pop()
		})
	endShape()
	beginShape()
		// mid
		randomCords([x, topY], [x, bottomY], 2).forEach(([x, y]) => {
			push()
				curveVertex(x + random(-2, 2), y + random(-2, 2))
			pop()
		})
	endShape()
	// fill left
	beginShape()
		push()
			let lineAmt = cw/4
			for (let i = 1; i < lineAmt; i++) {
				let delta = cw * i/lineAmt
				let cords = randomCords([x+leftX, topY+yShift+delta], [x, topY+delta], 3)
				cords.forEach(([x, y], index) => {
					if (index < 2 || index > cords.length -2) {
						return
					}
					curveVertex(x + random(-2, 2), y + random(-2, 2))
				})
			}
		pop()
	endShape()
}

function randomCords(startCord, endCord, amt, sorting = "asc") {
	let [xStart, yStart] = startCord
	let [xEnd, yEnd] = endCord
	let cords = []
	for (let i=0; i<amt; i++) {
		let randomX, randomY
		if (abs(xStart-xEnd) > abs(yStart-yEnd)) {
			randomX = random(xStart, xEnd)
			randomY = map(randomX, xStart, xEnd, yStart, yEnd)
		} else {
			randomY = random(yStart, yEnd)
			randomX = map(randomY, yStart, yEnd, xStart, xEnd)
		}
		cords.push([randomX, randomY])
	}
	return [startCord, startCord, ...cords, endCord, endCord]
}
