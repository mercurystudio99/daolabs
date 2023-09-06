t=0;
function setup() {
	createCanvas(w=500,w);
	noStroke();
}
function draw() {
	for(i=20;i>0;i--){
		fill(i%2?240:20);
		for(j=0;j<20;j++){
			circle(2*w*noise(j,t,0)-w/2,2*w*noise(j,t,1)-w/2,w*i/20);
		}
	}
	t+=.001;
}