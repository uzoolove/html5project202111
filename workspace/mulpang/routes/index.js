var express = require('express');
var router = express.Router();
var model = require('../model/mulpangDao');
var MyUtil = require('../utils/myutil');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/today');
});

// 오늘 메뉴
router.get('/today', function(req, res, next) {
  model.couponList(function(list){
    res.render('today', {list: list});
  });  
});

// 상세 조회
router.get('/coupons/:no', function(req, res, next) {
  model.couponDetail(req.params.no, function(coupon){
    res.render('detail', {coupon, toStar: MyUtil.toStar});
  });
});

// 쿠폰 구매 화면
router.get('/purchase/:no', function(req, res, next) {
  model.buyCouponForm(req.params.no, function(coupon){
    res.render('buy', {coupon});
  });
});


// http://localhost/today.html -> req.params.page = 'today'
router.get('/:page.html', function(req, res, next) {
  res.render(req.params.page);
});

module.exports = router;
