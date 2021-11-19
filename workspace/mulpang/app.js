var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/today', function(req, res, next){
  // 미들웨어 만드는 방법
  // 1. req, res, next를 매개변수로 정의한다.
  // 2. 기능 구현
  // 3-1. 클라이언트에 응답(res.end(), res.render(), res.json() ...)
  // 3-2. 다음 미들웨어 호출(next())
  console.log(req.body);
  console.log(req.cookies);
  console.log(req.session);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(/^((?!\/couponQuantity).)*$/, session({
  cookie: {maxAge: 1000*60},
  secret: 'sometext',
  rolling: true,  // 매 요청마다 세션 갱신
  resave: false,  // 세션이 수정되지 않으면 서버에 다시 저장하지 않음
  saveUninitialized: false  // 세션에 아무 값도 저장하지 않으면 클라이언트에 전송안함
}), function(req, res, next){
  // ejs 렌더링에 사용할 로그인 정보 저장
  res.locals.user = req.session.user;
  next();
});

app.use(logger('dev'));


app.use('/today', function(req, res, next){
  console.log(req.body);
  console.log(req.cookies);
  console.log(req.session);
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404, req.url + ' Not Found!!!'));
});

// error handler
app.use(function(err, req, res, next) {
  console.error(err.stack);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
