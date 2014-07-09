var http = require("http");
var qs = require('querystring');

function onRequest(request, response) {
    var sendIt = function(data){
        var gb = require('geolocation_basic_node');
        var gbn = new gb();
        var imports = {
            'request': request,
            'response': response,
            'http': http,
            'data': data
        };
        gbn.init(imports);
    };
    if(request.url.indexOf('favicon.ico') == -1){
        if(request.method == 'POST'){
            var post = '';
            request.on('data', function (data) {
                post += data;
            });
            request.on('end', function () {
                sendIt(qs.parse(post));
            });
        }
        else{
            var url = request.url.split('?');
            sendIt(qs.parse(url[1]));
        }
    }
    else{
        //console.log('favorite icon requested');
    }
}

http.createServer(onRequest).listen(8080);