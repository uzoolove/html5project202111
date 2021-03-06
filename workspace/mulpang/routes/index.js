var express = require('express');
var router = express.Router();
var model = require('../model/mulpangDao');
var MyUtil = require('../utils/myutil');
var checkLogin = require('../middleware/checklogin');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/today');
});

// 오늘 메뉴
router.get('/today', function(req, res, next) {
  if(req.query.page){
    req.query.page = parseInt(req.query.page);
  }else{
    req.query.page = 1;
    if(req.query.date){
      req.url += '&page=1';
    }else{
      req.url += '?page=1';
    }
  }
  model.couponList(req.query, function(list){
    list.page = {};
    if(req.query.page > 1){
      list.page.pre = req.url.replace('page='+req.query.page, 'page='+(req.query.page-1));
    }
    if(req.query.page < list.totalPage){
      list.page.next = req.url.replace('page='+req.query.page, 'page='+(req.query.page+1));
    }
    res.render('today', {list: list, query: req.query, options: MyUtil.generateOptions});
  });  
});

// 상세 조회
router.get('/coupons/:no', function(req, res, next) {
  var io = req.app.get('io');
  model.couponDetail(io, req.params.no, function(coupon){
    res.render('detail', {coupon, toStar: MyUtil.toStar});
  });
});

// 쿠폰 구매 화면
router.get('/purchase/:no', checkLogin, function(req, res, next) {
  model.buyCouponForm(req.params.no, function(coupon){
    res.render('buy', {coupon});
  });
});

// 쿠폰 구매
router.post('/purchase', checkLogin, function(req, res, next) {
  req.body.email = req.session.user._id;
  model.buyCoupon(req.body, function(err, result){
    if(err){
      next(err);
      // res.json({errors: err});
    }else{
      res.end('ok');
    }
  });
});

// 근처 메뉴
router.get('/location', function(req, res, next){
  model.couponList(null, function(list){
    // res.render('location', {list});
    res.locals.list = list;
    res.render('location');
  });  
});
// 추천 메뉴
router.get('/best', function(req, res, next){
  res.render('best');
});
// top5 쿠폰 조회
router.get('/topCoupon', function(req, res, next){
  model.topCoupon(req.query.condition, function(list){
    res.json(list);
  });  
});
// 모두 메뉴
router.get('/all', function(req, res, next){
  model.couponList(req.query, function(list){
    res.render('all', {list, query: req.query, options: MyUtil.generateOptions});
  });
});
// 쿠폰 남은 수량 조회
router.get('/couponQuantity', function(req, res, next){
  model.couponQuantity(req.query.couponIdList.split(','), function(list){
    res.contentType('text/event-stream');
    res.write(`data: ${JSON.stringify(list)}\n`);
    res.write(`retry: ${1000*10}\n`);
    res.end('\n');
  });
});


// http://localhost/today.html -> req.params.page = 'today'
router.get('/:page.html', function(req, res, next) {
  res.render(req.params.page);
});

module.exports = router;
