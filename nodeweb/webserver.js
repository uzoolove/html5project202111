const http = require('http');
const fs = require('fs');
const path = require('path');

var home = path.join(__dirname, 'html');

var server = http.createServer(function(req, res){
  console.log(req.method, req.url, req.httpVersion);
  console.log(req.headers['user-agent']);
  var filename = req.url;

  // 동기 방식
  var data = fs.readFileSync(path.join(home, filename));

  res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
  res.end(data);
  // res.end('<h1>첫번째 HTTP 서버.</h1>');
});
server.listen(1234, function(){
  console.log('HTTP 서버 구동 완료.');
});