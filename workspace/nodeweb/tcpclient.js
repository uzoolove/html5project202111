const net = require('net');
var target = {
  host: 'localhost',
  port: 1234
};

var socket = new net.Socket();
socket.connect(target.port, target.host, function(){
  console.log('서버 접속 완료.', target.host + ":" + target.port);
  socket.on('data', function(data){
    console.log(data.toString());
  });
  socket.write('GET / HTTP/1.1\n');
  socket.write('\n');
});