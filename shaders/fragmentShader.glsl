precision mediump float;

varying vec4 gradient;

void main(){
	//цвет, соответственно R, G, B, A, в данном случае через градиент
	gl_FragColor = vec4(abs(normalize(gradient)));	
}