var io = require('socket.io').listen(8081);
var gbn = require('geolocation_basic_node');


io.sockets.on('connection', function(socket){
    var module = null;
    var theClass = '';
    var type = '';
    var exporter = function(data){
        data.type = type;
        socket.emit('message', data);
    };
    var sendMessage = function(data){
        module[theClass](data, exporter);
    };
    socket.on('message', function(d){
        if(d != '[object Object]'){
            var data = JSON.parse(d);
            if(typeof(data.type) == 'undefined'){
                data.type = 'ip_address';
            }
            type = data.type;
            if(module == null){
                module = new gbn();
                if(typeof(data.ip_address) != 'undefined'){
                    module.ipAddress = data.ip_address;
                }
                module.init({
                    'socket': socket,
                    'http': require('http'),
                    'data': data
                }, sendMessage);
            }
            else{
                sendMessage(data);
            }
        }

    });
    socket.on('disconnect', function () { });
});