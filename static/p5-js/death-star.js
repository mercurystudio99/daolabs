let nums
preload=_=>{
	const gui = new dat.gui.GUI()
	nums=new Nums
	gui.add(nums,'speed',.01,.3)
	gui.add(nums,'scale',12,30)
	gui.add(nums,'texture_depth',0,30)
}

class Nums{
	constructor(){
		this.speed=.1
		this.scale=22
		this.texture_depth=10
	}
}

setup=_=>{
  createCanvas(960, 540,WEBGL)
  noStroke()
	T=[]
	pg=createGraphics(s=64,s)
	for(i=0;i<=30;i++){
    for(y=s;y--;)for(x=s;x--;){
      pg.stroke((i+x+y^i+x-y)%9?[0,0]:[255]).point(x,y)
		}
		T[i]=createGraphics(s,s)
		T[i].image(pg,0,0,s,s)
	}
}

t=0
draw=_=>{
	texture(T[int(nums.texture_depth)])
	rotateX(.05)
	background(0)
	scale(nums.scale)
	t+=nums.speed
	for(i=300;i--;){
		const {x,y}=p5.Vector.fromAngle(i%PI,4)
		push()
		translate(x,y,(i+t)%32)
		box(cos(s=i**9%9)*2,sin(s)*2,s)
		pop()
	}
}