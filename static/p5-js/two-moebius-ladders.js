let n=f=0;
setup = _=> {
	createCanvas(W=400,W,WEBGL);
	noStroke();
}
draw=_=>{
  ;[W,0].map(l=>pointLight([W],0,l,W));
  rotateY(f);
	
	let i=TAU;
  while(i>0){
    push();
    rotate(i-=PI/512); // PI/512 or PI/256
    translate(99,0,0);
    rotateY(i+f*3); // TRY THIS TOO: rotateY(f*3);
		if(n++%64==0) box(40,9,9); // n++%64 or n++%32 (check line 13)
    
		push();
    rail(30);
		rail(-60);
		pop();
		
    pop();
  }
	
	box(1000);
	f+=.01;
}
rail=r=>(translate(r,0),box(20,3,20,9));

// ----------------------------------------
// Minimized
// ----------------------------------------
// f=0,draw=a=>{for(f||createCanvas(W=400,W,WEBGL,T=translate,Y=rotateY),[W,n=0].map(a=>pointLight([W],i=TAU,a,W)),Y(f+=.01);i>0;)push(B=a=>(T(a,0),box(20,3,20,9))),rotate(i-=PI/512),T(99,0),Y(i+3*f),push(n++%64==0&&box(40,9,9,9)),B(30),pop(pop(B(-60)));box(1e3)};//#つぶやきProcessing