// Объявление глобальных переменных
var gl, program;
var defaultPositionMatrix = []; //используется x, y, z 		 (буфер вершин)
var indices = [];				//индексы соединяемых вершин (буфер индексов)
var scaleValue = 0.8;
var matrixTranslation = [];
var matrixRotation = [];
var postOperationMatrix = [];
var matrixPerspective = [];


//загрузка шейдеров
var InitWebGL = function() {
	var VSText, FSText;
	loadTextResource('/shaders/vertexShader.glsl')
	.then(function(result) {
		VSText = result;
		return loadTextResource('/shaders/fragmentShader.glsl');
	})
	.then(function(result){
		FSText = result;
		return StartWebGL(VSText, FSText);
	})
	.catch(function(error) {
		alert('Error with loading resources. See console.');
		console.error(error);
	})
}


//запуск webgl
var StartWebGL = function(vertexShaderText, fragmentShaderText) {

	var canvas = document.getElementById('example-canvas');
	gl = canvas.getContext('webgl');

	if (!gl) {
		alert('Your browser does not support WebGL');
		return;
	}

	program = gl.createProgram();

	var scaleSlider = document.getElementById('scale');
	scaleSlider.addEventListener('input', function(event){
		ScaleChanged(event.target.value)
	});

	canvas.height = gl.canvas.clientHeight;
	canvas.width = gl.canvas.clientWidth;

	// Создание обработчика события на клик
	window.addEventListener('keydown', function(event){
		OnButtonPressed(event);
	})

	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	//инициализация матриц перемещения и поворота
	mat4.identity(matrixTranslation);
	mat4.identity(matrixRotation);
	mat4.identity(matrixPerspective);

	//заготовка для матрицы перспективной проекции
	matrixPerspective = mat4.perspective(35, canvas.width / canvas.height, 1, 20);
	mat4.translate(matrixTranslation, [0, -0.0, -3]);

	//изначальный поворот чтоб смотрелось красивее
	mat4.rotateX(matrixRotation, DegreesToRadians(-45));
	mat4.rotateZ(matrixRotation, DegreesToRadians(-30));

	//сетка
	var n = 100;
	var t = n / 2.0;
	for (var i = 0; i < n; i++){
		for (var j = 0; j < n; j++){
			defaultPositionMatrix.push((j - t) / t);
			defaultPositionMatrix.push((i - t) / t);
			defaultPositionMatrix.push(0);
		}
	}

	//индексы соединяемых вершин
	var index = 0;
	var vertex = 0;
	for (var i = 0; i < n - 1; i++)
	{
		for (var j = 0; j < n - 1; j++)
		{
			indices[index] = vertex;
			indices[index + 1] = vertex + 1;
			indices[index + 2] = vertex + n + 1;
			indices[index + 3] = vertex;
			indices[index + 4] = vertex + n;
			indices[index + 5] = vertex + n + 1;
			index += 6;
			vertex++;
		}
		vertex++;
	}

	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	
	gl.shaderSource(vertexShader, vertexShaderText);
	gl.shaderSource(fragmentShader, fragmentShaderText);

	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		alert('Error compiling vertex shader!');
		console.error('Shader error info: ', gl.getShaderInfoLog(vertexShader));
	}
	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		alert('Error compiling fragment shader!');
		console.error('Shader error info: ', gl.getShaderInfoLog(fragmentShader));
	}

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);

	gl.linkProgram(program);
	gl.validateProgram(program);

	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
		console.error('Error validating program ', gl.getProgramInfoLog(program));

		return;
	}

	Draw();
};


//функция отрисовки
var Draw = function() {
	postOperationMatrix = Multiply4x4Matrices(matrixRotation, matrixTranslation);
	postOperationMatrix = Multiply4x4Matrices(postOperationMatrix, matrixPerspective);

	var vertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(defaultPositionMatrix), gl.STATIC_DRAW);

	indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    // указываем число линий. это число равно числу индексов
    indexBuffer.numberOfItems = indices.length;

	var positionAttribLocation = gl.getAttribLocation(program, 'vertexPosition');

	gl.vertexAttribPointer(
		positionAttribLocation, 				// ссылка на атрибут
		3, 										// кол-во элементов на 1 итерацию
		gl.FLOAT, 								// тип данных
		gl.FALSE, 								// нормализация
		3 * Float32Array.BYTES_PER_ELEMENT, 	// элементов массива на одну вершину
		0 * Float32Array.BYTES_PER_ELEMENT 		// отступ для каждой вершины
	);

	gl.enableVertexAttribArray(positionAttribLocation);

	var scaleUniformLocation = gl.getUniformLocation(program, "scale");
	gl.uniform1f(scaleUniformLocation, scaleValue);
	
	var PostOperationLocationPosition = gl.getUniformLocation(program, "postOperationMatrix");
	gl.uniformMatrix4fv(PostOperationLocationPosition, false, postOperationMatrix);

	//var matrixTranslationLocation = gl.getUniformLocation(program, "translation");
	//gl.uniformMatrix4fv(matrixTranslationLocation, false, matrixTranslation);

	var matrixRotateLocation = gl.getUniformLocation(program, "rotation");
	gl.uniformMatrix4fv(matrixRotateLocation, false, matrixRotation);

	gl.clearColor(0.75, 0.9, 1.0, 1.0);										//цвет фона
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.useProgram(program);
	//gl.drawArrays(gl.TRIANGLES, 0, defaultPositionMatrix.length / 3);	//треугольники, количество элементов
	gl.drawElements(gl.TRIANGLES, indexBuffer.numberOfItems, gl.UNSIGNED_SHORT, 0);
};


//при нажатии кнопки
function OnButtonPressed(event) {
	switch (event.code){
		case 'ArrowUp':
			mat4.translate(matrixTranslation, [0.0, 0.01, 0.0]);
			break;
		
		case 'ArrowDown':
			mat4.translate(matrixTranslation, [0.0, -0.01, 0.0]);
			break;
		
		case 'ArrowLeft':
			mat4.translate(matrixTranslation, [-0.01, 0.0, 0.0]);
			break;
		
		case 'ArrowRight':
			mat4.translate(matrixTranslation, [0.01, 0.0, 0.0]);
			break;

		case 'KeyZ':
			mat4.translate(matrixTranslation, [0.0, 0.0, 0.03]);
			break;
		
		case 'KeyX':
			mat4.translate(matrixTranslation, [0.0, 0.0, -0.03]);
			break;

		case 'KeyA':
			mat4.rotateY(matrixRotation, DegreesToRadians(3));
			break;
		
		case 'KeyD':
			mat4.rotateY(matrixRotation, -DegreesToRadians(3));
			break;

		case 'KeyW':
			mat4.rotateX(matrixRotation, DegreesToRadians(3));
			break;
		
		case 'KeyS':
			mat4.rotateX(matrixRotation, -DegreesToRadians(3));
			break;
		
		case 'KeyQ':
			mat4.rotateZ(matrixRotation, DegreesToRadians(3));
			break;
		
		case 'KeyE':
			mat4.rotateZ(matrixRotation, -DegreesToRadians(3));
			break;
		
		default:
			break;
	}
	Draw();
};


//при изменении значения слайдера
function ScaleChanged(value){
	scaleValue = parseFloat(value);
	Draw();
}

//запуск после прогрузки webgl
document.addEventListener('DOMContentLoaded', function() {
	InitWebGL();
});

