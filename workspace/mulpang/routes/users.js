var express = require('express');
var router = express.Router();
var model = require('../model/mulpangDao');

// 회원 가입 화면
router.get('/new', function(req, res, next) {
  res.render('join');
});	
// 프로필 이미지 업로드
var path = require('path');
var tmp = path.join(__dirname, '..', 'public', 'tmp');
var multer = require('multer');
router.post('/profileUpload', multer({dest: tmp}).single('profile'), function(req, res, next) {
  console.log(req.file);
  res.end(req.file.filename);   // 임시 파일명 응답
});
// 회원 가입 요청
router.post('/new', function(req, res, next) {
  model.registMember(req.body, function(err, result){
    if(err){
      res.json({errors: err});
    }else{
      res.end('success');
    }
  });
});
// 간편 로그인
router.post('/simpleLogin', function(req, res, next) {
  model.login(req.body, function(err, user){
    if(err){
      res.json({errors: err});
    }else{
      req.session.user = user;
      res.json(user);
    }
  });
});
// 로그아웃
router.get('/logout', function(req, res, next) {
  res.redirect('/');
});
// 로그인 화면
router.get('/login', function(req, res, next) {
  res.render('login');
});
// 로그인
router.post('/login', function(req, res, next) {
  res.redirect('/');
});
// 마이 페이지
router.get('/', function(req, res, next) {
  res.render('mypage');
});
// 회원 정보 수정
router.put('/', function(req, res, next) {
  res.end('success');
});
// 구매 후기 등록
router.post('/epilogue', function(req, res, next) {
  res.end('success');
});


module.exports = router;
