var ConvertArrayToTwoDimensional = function(array, elemInRow){
    var result = [];
    var temp = [];
    array.forEach(function(item) {
        temp.push(item);
        if (temp.length === elemInRow){
            result.push(temp);
            temp = [];
        }
      });

    return result;
}

var ConvertArrayToOneDimensional = function(array){
    var result = [];
    array.forEach(element => {
        element.forEach(elem => {
            result.push(elem);
        });
    });
    
    return result;
}


var MultiplyMatrices = function(firstMatrix, secondMatrix){
    var result = [];

    //проход по каждому элементу массива
    for (var i = 0; i < firstMatrix.length; i++){
        var temp = [];
        for (var j = 0; j < secondMatrix[0].length; j++){
            
            //проход по строке/столбцу
            var sum = 0;
            for (var t = 0; t < firstMatrix.length; t++){
                sum += firstMatrix[i][t] * secondMatrix[t][j];
            }
            temp.push(sum);

        }
        result.push(temp);
    }
    
    return result;
}


var Multiply4x4Matrices = function(firstMatrix, secondMatrix){
    m1 = ConvertArrayToTwoDimensional(firstMatrix, 4);
    m2 = ConvertArrayToTwoDimensional(secondMatrix, 4);
    var result = MultiplyMatrices(m1, m2);
    var final = ConvertArrayToOneDimensional(result);

    return final;
}


function DegreesToRadians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}
