var MongoClient = require('mongodb').MongoClient;
var util = require('util');
var db;
// DB 접속
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url, { useUnifiedTopology: true });

// Database Name
// const dbName = 'myProject';
const dbName = 'mulpang';

// Use connect method to connect to the server
client.connect(function(err){
  if(err) console.error(err);
  console.log('Connected successfully to server');  
  db = client.db(dbName);
  // db.dropDatabase(function(){
    db.board = db.collection('board');
    db.coupon = db.collection('coupon');

    setTimeout(function(){
      client.close();
    }, 1000);

    todo11();
  // });
});

// 등록할 게시물
var b1 = {no: 1, name: "admin", title: "[공지]게시판 사용규칙 안내입니다.", content: "잘 쓰세요."};
var b2 = {no: 2, name: "kim", title: "첫번째 글을 올리네요.", content: "잘 보이나요?"};
var b3 = {no: 3, name: "lee", title: "그렇다면 두번째 글은...", content: "잘 보이겠죠?"};

// 로그 메세지 출력
function myLog(str, result){
	console.info(str);
	console.debug(util.inspect(result, {depth: 5}) + "\n");
}

// TODO 1. board 컬렉션에 데이터 등록
// insertOne({등록할 문서}), insertMany([{등록할 문서}, {등록할 문서}])
async function todo1(){
	await db.board.insertOne(b1);
  await db.board.insertMany([b2, b3]);
  todo2();
}

// TODO 2. 모든 board 데이터의 모든 속성 조회
// find()
function todo2(){
	db.board.find().toArray(function(err, data){
    myLog('TODO 2. 모든 board 데이터의 모든 속성 조회', data);
    todo3();
  });
}

// TODO 3. 데이터 조회(kim이 작성한 게시물 조회)
// find({검색조건})
function todo3(){
	db.board.find({name: 'kim'}).toArray(function(err, data){
    myLog('TODO 3. 데이터 조회(kim이 작성한 게시물 조회)', data);
    todo4();
  });
}

// TODO 4. 모든 board 데이터의 작성자 속성만 조회(_id 포함)
// find({검색조건}, {projection: {출력컬럼}})
function todo4(){
	db.board.find({}, {projection: {name: 1}}).toArray(function(err, data){
    myLog('TODO 4. 모든 board 데이터의 작성자 속성만 조회(_id 포함)', data);
    todo5();
  });
}

// TODO 5. kim이 작성한 게시물의 제목 조회(_id 미포함)
// find({검색조건}, {projection: {출력컬럼}})
function todo5(){
  db.board.find({name: 'kim'}, {projection: {_id: 0, title: 1}}).toArray(function(err, data){
    myLog('TODO 5. kim이 작성한 게시물의 제목 조회(_id 미포함)', data);
    todo6();
  });
}

// TODO 6. 첫번째 게시물 조회(1건)
// findOne()
function todo6(){
  db.board.findOne(function(err, data){
    myLog('TODO 6. 첫번째 게시물 조회(1건)', data);
    todo7();
  });
}

// TODO 7. 게시물 조회(lee가 작성한 데이터 1건 조회)
// findOne({검색조건})
function todo7(){
	db.board.findOne({name: 'lee'}, function(err, data){
    myLog('TODO 7. 게시물 조회(lee가 작성한 데이터 1건 조회)', data);
    todo8();
  });
}

// TODO 8. 게시물 수정(3번 게시물의 내용 수정)
// updateOne({검색조건}, {수정할 문서})
function todo8(){
	db.board.updateOne({no: 3}, {$set: {content: '수정함.'}}, function(err, data){
    list('TODO 8. 게시물 수정(3번 게시물의 내용 수정)', todo9);
  });
}

// 전체 게시물을 조회하여 지정한 문자열을 출력하고
// next 함수를 호출한다.
function list(str, next){
	db.board.find().toArray(function(err, result){
		myLog(str, result);
		if(next){
			next();
		}
	});
}

// TODO 9. 1번 게시물에 댓글 추가
function todo9(){
	var comment = {
    name: '이영희',
    content: '퍼가요~~~'
  };
  db.board.updateOne({no: 1}, {$push: {comments: comment}}, function(err, data){
    console.log(data.result);
    list('TODO 9. 1번 게시물에 댓글 추가', todo10);
  });
}

// TODO 10. 2번 게시물 삭제
// deleteOne({검색 조건})
function todo10(){
	db.board.deleteOne({no: 2}, function(err, data){
    console.log(data.result);
    list('TODO 10. 2번 게시물 삭제');
  });
}

// TODO 11. mulpang DB coupon collection 조회
// 1. 모든 쿠폰 목록을 조회한다.
function todo11(){
  db.coupon.find().toArray(function(err, data){
    myLog('TODO 11. mulpang DB coupon collection 조회', data);
  });
}






































