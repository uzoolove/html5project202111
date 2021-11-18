const net = require('net');
var tcpServer = net.createServer(function(socket){
  console.log('클라이언트 접속', socket.remoteAddress);
  socket.on('error', function(){
    console.log('클라이언트 접속 종료.', socket.remoteAddress);
  });
  socket.on('data', function(data){
    console.log(data.toString());
  });
});
tcpServer.listen(1234, function(){
  console.log('TPC 서버 구동 완료.');
});