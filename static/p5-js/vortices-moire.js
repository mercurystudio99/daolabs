const particles=[]
let timer=0

setup=()=>{
  createCanvas(w=450,w)
  noFill()
  for(let i=5;i--;){
    particles[i]={
      x:random(w),
      y:random(w),
      vx:random(1)<.5?-2:2,
      vy:random(1)<.5?-2:2
    }
  }
}

draw=()=>{
  timer+=.1
  background('black')
  stroke('white')

  for(p of particles){
    p.x+=p.vx
    if(p.x<0||p.x>w){
      p.vx*=-1
      p.x+=p.vx
    }
    p.y+=p.vy
    if(p.y<0||p.y>w){
      p.vy*=-1
      p.y+=p.vy
    }
  }

  const step=2
  for(let y=timer%step;y<w;y+=step){
    beginShape()
    for(let x=timer%step;x<w;x+=step){
      let difx=dify=0
      for(p of particles){
        const dx=p.x-x
        const dy=p.y-y
        const distance=max((dx**2+dy**2)/400,1)
        difx+=dx/distance
        dify+=dy/distance
      }
      curveVertex(x+difx, y+dify)
    }
    endShape()
  }
}