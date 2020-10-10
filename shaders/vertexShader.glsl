attribute vec3 vertexPosition;

uniform float scale;
//uniform mat4 translation;
uniform mat4 rotation;

uniform mat4 postOperationMatrix;

vec3 newPosition;
varying vec4 gradient;

void main(){
	//значения функции в вершинах
	float newX = vertexPosition[0] * 10.0;
	float newY = vertexPosition[1] * 10.0;
	float newZ = sin(newX) * cos(newY);

	//нормаль через градиент
	//df/dx = cos(x)*sin(y)		df/dy = -sin(x)*sin(y)
	float dfdx = cos(newX) * sin(newY);
	float dfdy = -sin(newX) * sin(newY);
	gradient = normalize(rotation * vec4(-dfdx, -dfdy, -1, 1));
	//gradient = normalize(postOperationMatrix * vec4(-dfdx, -dfdy, -1, 1));		//лекции по преобразованию нормалей

	//значение позиции после скалирования
	newPosition = vec3(newX, newY, newZ) * scale;

	//gl_Position = translation * rotation * vec4(newPosition / 10.0, 1); 
	gl_Position = postOperationMatrix * vec4(newPosition / 10.0, 1); 
}
