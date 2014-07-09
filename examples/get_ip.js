var http = require("http");

function onRequest(request, response) {
    var data = {};
    if(typeof(request.headers["x-forwarded-for"]) != 'undefined'){
        data.ip_address = request.headers["x-forwarded-for"];
    }
    else{
        data.ip_address = request.connection.remoteAddress;
    }
    response.writeHead(200, {
        "Content-Type": "text/json",
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST'
    });
    response.write(JSON.stringify(data));
    response.end();
}

http.createServer(onRequest).listen(8082);