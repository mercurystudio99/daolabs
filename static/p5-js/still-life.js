//for #wccChallenge (more info at https://openprocessing.org/curation/78544) on theme of Brutalism
//I started by vaguely trying to make a generative sketch of Habitat 67 
//Sketch gradually became more and more... alienating? How I feel about most Brutalist buildings. Went with it.
//Lots of interesting coding challenges to solve, to allow the generated buildings to be a bit surreal but semi-plausible (no floating parts, at least)


let vG //vertical grainy
let wi //windows
let wf //window frame
let floorHeight
let py
let persons=0
bottomFloor=[]

function setup() {
	createCanvas(800, 600);
	
	//vertical grainy texture
	vG= createGraphics(600, 600)
	vG.background('#F1E9DB')
	vG.stroke('#716A5C')
	vG.noFill()
	for(let x=-10; x<vG.width+10; x+=4){
		vG.strokeWeight(1)
		for(let y=-10; y<vG.height+10; y+=1){
			let wave=map(noise(x/10, y/10), 0, 1, -3, 3)
			vG.point(x+wave, y)
		}
	}
	//windowFrame
	wf= createGraphics(100, 75)
	wf.background('#F1E9DB')
	wf.erase()
	wf.rect(wf.width*0.1, wf.height*0.1, wf.width*0.8, wf.height*0.8, 10)
	wf.noErase()
	
	image(wf, 100, 100)
	
	//'windows'
	wi= createGraphics(400, 400)
	wi.stroke('#716A5C')
	wi.background('#F1E9DB')
	for(let x=-10; x<wi.width+10; x+=1.2){
		for(let y=-10; y<wi.height+10; y+=1.2){
			wi.stroke('#716A5C')
			wi.strokeWeight(1)
			wi.point(x, y)
		}
	}
	
	
	background('#F1E9DB');
	stroke('#716A5C')
	noFill()
	imageMode(CENTER)
	rectMode(CENTER)
	
	//ground
	strokeWeight(0.5)
	line(0,400 ,width, 400)
	for(let x=0; x<=width; x+=2){
	p=map(x, 125, 675, PI/3, -PI/3)
	push()
	translate(x, 400)
	rotate(p)
	line(0, 0, 0, 400)
	pop()	
	}
 yer=400
 slab=1
 while(yer<600){
	yer+=slab
	line(0, yer, width, yer)
	 slab*=1.1
	 
 }
	
	strokeWeight(1)
	
	//place 'blocks'
	let noOfFloors= floor(random(3, 6))
	floorHeight=300/noOfFloors
  
		buildTopLevel(height-(100+(noOfFloors*floorHeight)), floorHeight)
	
	//place people(but only one or two)
	for(let i=0; i<bottomFloor.length; i++){
		leftedge= bottomFloor[i].x-(bottomFloor[i].w)/2
		for(let j=0; j<bottomFloor.length; j++){
			d=leftedge-(bottomFloor[j].x+(bottomFloor[j].w)/2)
			//print(d)
			if(d>100){
			let px=	bottomFloor[i].x- d/2
			if(persons<2){
			person(px)
				persons+=1
			}
			}	
		}
	}
	
	//tree placement
	let farthestRight= width/2
	let farthestLeft= width/2
	for(let block of bottomFloor){
	let right= block.x+block.w/2
	if(right>farthestRight){
		farthestRight=right
	}
		let left=block.x-block.w/2
		if(left<farthestLeft){
		farthestLeft=left
	}
	}
  if(farthestRight<500){
		let placer=(width-farthestRight)/2
	tree(farthestRight+placer)
	}else{
		if(farthestLeft>200){
		let placer=farthestLeft/3
	tree(farthestLeft-placer)
		}
	}
}

//the functions


function buildTopLevel(y, h){
let noOfBlocks=floor(random(2, 6))	
 for(let i=0; i<noOfBlocks; i++){
	 let x=random(200, 600)
	 let w=random(20, 200)
	 let windowDiv=floor(random(25, 100))
		let noWindows=floor(w/windowDiv)
		let wW= w/(noWindows+1)
		let wH= h*0.8
		fill('#716A5C')
	 let shadowYoffset= map(y, 100, 500, 15, -2)
		rect(x-10, y+ shadowYoffset, w, h )
	 quad(x-w/2, y-h/2, x-w/2-10, y-h/2+ shadowYoffset, x+w/2-10, y+h/2+ shadowYoffset , x+w/2, y+h/2)
	  noFill()
		image(vG, x, y, w, h, 0, 0, w, h)
		rect(x, y, w, h, 5)
		push()
		//place windows
		translate(x-w/2, y)
		for(let i=wW; i<=w-wW; i+=wW){
			image(wi, i, 0, wW*0.8, wH, 0, 0, wW*0.8, wH)
			image(wf, i, 0, wW, wH)
		}
		pop() 
	 buildLevelUnder(x, y+h, h)
 }

}


function buildLevelUnder(xer, y, h){
	let no=floor(random(1, 4))
	let w= random(20, 200)
	let x= xer+random(-w/2, w/2)
	
	let windowDiv=floor(random(25, 100))
		let noWindows=floor(w/windowDiv)
		let wW= w/(noWindows+1)
		let wH= h*0.8
		
		fill('#716A5C')
	 let shadowYoffset= map(y, 150, 500, 15, -5)
		rect(x-10, y+ shadowYoffset, w, h)
	 quad(x-w/2, y-h/2, x-w/2-10, y-h/2+ shadowYoffset, x+w/2-10, y+h/2+ shadowYoffset , x+w/2, y+h/2)
	  noFill()
		image(vG, x, y, w, h, 0, 0, w, h)
		rect(x, y, w, h, 5)
		push()
		//place windows
		translate(x-w/2, y)
		for(let i=wW; i<=w-wW; i+=wW){
			image(wi, i, 0, wW*0.8, wH, 0, 0, wW*0.8, wH)
			image(wf, i, 0, wW, wH)
		}
		pop() 
	
	//break statment, add bottom block data to array for people/tree placement
	if(y<400){
		buildLevelUnder(x, y+h, h)
	}
	else{
		//add x pos and w to an array
		var block ={
			x: x,
			w: w
		}
		bottomFloor.push(block)
		py=y+60
	}
	
}


function tree(x){
	strokeWeight(2)
	line(x, 475, x, 475-floorHeight*0.65)
	push()
	translate(x, 475-floorHeight*0.65)
	branch(floorHeight*0.33)
	pop()
	//shadow
	push()
	translate(x, 475)
	scale(0.75, 0.3)
	shearX(PI / 4.0)
	line(0, 0, 0, -floorHeight*0.65)
	push()
	translate(0, -floorHeight*0.65)
	branch(floorHeight*0.33)
	pop()
	pop()
	
	fill('#716A5C')
	noStroke()
	quad(x-floorHeight/10, 475-floorHeight/40, x-floorHeight/20, 475+floorHeight/30,x+ floorHeight/10,475+floorHeight/40, x+ floorHeight/20, 475-floorHeight/40 )
	noFill()
}

function branch(size){
	strokeWeight(1)
	push()
	rotate(random(-PI/8, -PI/4))
	line(0, 0, 0, -size)
	translate(0, -size)
	if(size>2){
		branch(size*0.7)
	}
	pop()
	push()
	rotate(random(PI/8, PI/4))
	line(0, 0, 0, -size)
	translate(0, -size)
	if(size>4){
		branch(size*0.7)
	}
	pop()
}


function person(x){
	fill('#716A5C')
	let yer=py
	let ph= floorHeight*0.6
	ellipse(x, yer-ph/4, ph/8, ph/6)
	rect(x, yer, ph/5, ph/3, 10)
	rect(x-ph/18, yer+ph/4, ph/17, ph/3)
	rect(x+ph/18, yer+ph/4, ph/17, ph/3)
	push()
	translate(x-ph/20, yer-ph/18)
	rotate(PI/10)
	rect(0, 0, ph/18, ph/4)
	pop()
	//shadow
	push()
	translate(x-ph*0.5, yer+ph/6)
	scale(1.2, 0.6)
	shearX(PI / 4.0)
	ellipse(0, -ph/4, ph/8, ph/6)
	rect(0, 0, ph/5, ph/3, 10)
	rect(-ph/18, ph/4, ph/17, ph/3)
	rect(ph/18, ph/4, ph/17, ph/3)
	pop()
	
	noFill()
}
