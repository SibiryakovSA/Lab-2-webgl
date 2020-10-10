http = require("http");
fs = require("fs");


http.createServer(function(request, response){
    filePath = request.url.substr(1)  === "" ? "index.html" : request.url.substr(1);

    fs.readFile(filePath, (err, data) =>
    {
        if (err)
        {
            response.statusCode = 404;
            response.end("Resourse not found!");
        }
        else response.end(data);
    });
}).listen(3000);
console.log("Сервер запущен на localhost:3000");