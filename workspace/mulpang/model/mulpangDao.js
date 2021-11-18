var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var util = require('util');
var path = require('path');
var fs = require('fs');
var moment = require('moment');
var MyUtil = require('../utils/myutil');

// DB 접속
var db;
var client = new MongoClient('mongodb://localhost:27017', { useUnifiedTopology: true });
client.connect(function(err){
	if(err) console.error(err);
	db = client.db('mulpang');
	db.member = db.collection('member');
	db.shop = db.collection('shop');
	db.coupon = db.collection('coupon');
	db.purchase = db.collection('purchase');
	db.epilogue = db.collection('epilogue');
	console.info('DB 접속 완료.');
});

// 쿠폰 목록조회
module.exports.couponList = function(qs, cb){
  qs = qs || {};
	// 검색 조건
	var query = {};
	// 1. 판매 시작일이 지난 쿠폰, 구매 가능 쿠폰(기본 검색조건)	
  var now = moment().format('YYYY-MM-DD hh:mm:ss');
  query['saleDate.start'] = {$lte: now};
  query['saleDate.finish'] = {$gte: now};
	// 2. 전체/구매가능/지난쿠폰
  switch(qs.date){
    case 'all':
      delete query['saleDate.finish'];
      break;
    case 'past':
      query['saleDate.finish'] = {$lt: now};
      break;
  }
	// 3. 지역명	
  if(qs.location){
    query['region'] = qs.location;
  }
	// 4. 검색어
  if(qs.keyword && qs.keyword.trim()!=''){
    var regExp = new RegExp(qs.keyword, 'i');
    query['$or'] = [{couponName: regExp}, {desc: regExp}];
  }

	// 정렬 옵션
	var orderBy = {};
	// 1. 사용자 지정 정렬 옵션
  if(qs.order){
    orderBy[qs.order] = -1; // 내림차순
  }
	// 2. 판매 시작일 내림차순(최근 쿠폰)
  orderBy['saleDate.start'] = -1;
	// 3. 판매 종료일 오름차순(종료 임박 쿠폰)
  orderBy['saleDate.finish'] = 1;

	// 출력할 속성 목록
	var fields = {
		couponName: 1,
		image: 1,
		desc: 1,
		primeCost: 1,
		price: 1,
		useDate: 1,
		quantity: 1,
		buyQuantity: 1,
		saleDate: 1,
		position: 1
	};
	
	// TODO 전체 쿠폰 목록을 조회한다.
  var count = 0;
  var offset = 0;
  if(qs.page){
    count = 5;
    offset = (qs.page-1) * count;
  }

	var cursor = db.coupon.find(query);
  cursor.count(function(err, totalCount){
    cursor.project(fields).sort(orderBy).skip(offset).limit(count).toArray(function(err, result){
      console.log(result.length, '건');
      result.totalPage = Math.floor((totalCount+count-1)/count);
      cb(result);
    });
  });

};

// 쿠폰 상세 조회
module.exports.couponDetail = function(io, _id, cb){
	// coupon, shop, epilogue 조인
  db.coupon.aggregate([
    {
      $match: { _id: ObjectId(_id) }
    }, {
      // shop 조인
      $lookup: {
        from: 'shop',
        localField: 'shopId',   // coupon.shopId
        foreignField: '_id',  // shop._id
        as: 'shop'
      }
    }, {
      // shop 조인 결과를(배열) 낱개의 속성으로 변환
      $unwind: '$shop'
    }, {
      // epilogue 조인
      $lookup: {
        from: 'epilogue',
        localField: '_id',   // coupon._id
        foreignField: 'couponId',  // epilogue.couponId
        as: 'epilogueList'
      }
    }
  ]).next(function(err, coupon){
    console.log(coupon);
	  // 뷰 카운트를 하나 증가시킨다.
    db.coupon.updateOne({_id: coupon._id}, {$inc: {viewCount: 1}}, function(){
      // 웹소켓으로 수정된 조회수 top5를 전송한다.
      topCoupon('viewCount', function(result){
        io.emit('top5', result);
      });
    });

    cb(coupon);
  });
};

// 구매 화면에 보여줄 쿠폰 정보 조회
module.exports.buyCouponForm = function(_id, cb){
	var fields = {
		couponName: 1,
    price: 1,
    quantity: 1,
    buyQuantity: 1,
    'image.detail': 1
	};
	// TODO 쿠폰 정보를 조회한다.
	db.coupon.findOne({_id: ObjectId(_id)}, {projection: fields}, function(err, result){
    cb(result);
  });
};

// 쿠폰 구매
module.exports.buyCoupon = function(params, cb){
	// 구매 컬렉션에 저장할 형태의 데이터를 만든다.
	var document = {
		couponId: ObjectId(params.couponId),
		email: 'uzoolove@gmail.com',	// 나중에 로그인한 id로 대체
		quantity: parseInt(params.quantity),
		paymentInfo: {
			cardType: params.cardType,
			cardNumber: params.cardNumber,
			cardExpireDate: params.cardExpireYear + params.cardExpireMonth,
			csv: params.csv,
			price: parseInt(params.unitPrice) * parseInt(params.quantity)
		},
		regDate: moment().format('YYYY-MM-DD hh:mm:ss')
	};

	// TODO 구매 정보를 등록한다.
  db.purchase.insertOne(document, function(err, result){
    if(err){
      console.error(err);
      cb({message: '쿠폰 구매에 실패했습니다. 잠시후 다시 시도하시기 바랍니다.'});
    }else{
      // TODO 쿠폰 구매 건수를 하나 증가시킨다.
      db.coupon.updateOne({_id: document.couponId}, {$inc: {buyQuantity: document.quantity}}, function(){
        cb(null, document.couponId);
      });      
    }
  });
};	
	
// 추천 쿠폰 조회
var topCoupon = module.exports.topCoupon = function(condition, cb){
	var order = {};
  order[condition] = -1;

  var query = {};
  var now = moment().format('YYYY-MM-DD hh:mm:ss');
  query['saleDate.start'] = {$lte: now};
  query['saleDate.finish'] = {$gte: now};

  db.coupon.aggregate([
    { $match: query }, 
    { $sort: order }, 
    { $limit: 5 }, 
    {
      $project: {
        couponName: 1,
        value: '$'+condition
      }
    }
  ]).toArray(function(err, result){
    cb(result);
  });
};

// 지정한 쿠폰 아이디 목록을 받아서 남은 수량을 넘겨준다.
module.exports.couponQuantity = function(coupons, cb){
  coupons = coupons.map(function(couponId){
    return ObjectId(couponId);
  });
  db.coupon.find(
    {_id: {$in: coupons}}, 
    {projection: {quantity: 1, buyQuantity: 1, couponName: 1}})
    .toArray(function(err, result){
      cb(result);
  });
};

// 임시로 저장한 프로필 이미지를 회원 이미지로 변경한다.
function saveImage(tmpFileName, profileImage){
	var tmpDir = path.join(__dirname, '..', 'public', 'tmp');
  var profileDir = path.join(__dirname, '..', 'public', 'image', 'member');
  var org = path.join(tmpDir, tmpFileName);
  var dest = path.join(profileDir, profileImage);
	// TODO 임시 이미지를 member 폴더로 이동시킨다.
	fs.rename(org, dest, function(err){
    if(err) console.error(err);
  });
}

// 회원 가입
module.exports.registMember = function(params, cb){
	var member = {
    _id: params._id,
    password: params.password,
    profileImage: params._id,
    regDate: moment().format('YYYY-MM-DD hh:mm:ss')
  };
  db.member.insertOne(member, function(err, result){
    // 아이디가 중복된 경우
    if(err && err.code == 11000){
      err = {message: '이미 등록된 이메일입니다.'};
    }else{
      saveImage(params.tmpFileName, member.profileImage);
    }
    cb(err, result);
  });
};

// 로그인 처리
module.exports.login = function(params, cb){
	// TODO 지정한 아이디와 비밀번호로 회원 정보를 조회한다.
	// db.member.findOne(params, {projection: {profileImage: 1}}, function(err, result){
  //   if(!result){  // 로그인 실패
  //     err = {message: '아이디와 비밀번호를 확인하시기 바랍니다.'};
  //   }
  //   cb(err, result);
  // });

  err = {message: '해당 아이디가 없습니다.'};
  err = {message: '비밀번호가 맞지 않습니다.'};
};

// 회원 정보 조회
module.exports.getMember = function(userid, cb){
	
};

// 회원 정보 수정
module.exports.updateMember = function(userid, params, cb){
	
};

// 쿠폰 후기 등록
module.exports.insertEpilogue = function(userid, params, cb){
	
};