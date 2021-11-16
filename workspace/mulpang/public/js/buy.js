$(function(){
	setCancelEvent();
	setBuyEvent();
	setPriceEvent();	
});

// 취소 버튼 클릭
function setCancelEvent(){
	$('form button[type=reset]').click(function(){
    window.history.back();
  });
}

// 구매 버튼 클릭
function setBuyEvent(){
	$('.detail form').submit(function(){
    // form의 모든 입력요소를 querystring으로 변환
    var body = $(this).serialize();
    $.ajax('/purchase', {
      method: 'post',
      data: body,
      success: function(result){
        if(result.errors){
          alert(result.errors.message);
        }else{
          alert('쿠폰 구매가 완료 되었습니다.');
          location.href = '/';
        }
      }
    });
    return false; // submit 동작 취소
  });
}

// 구매수량 수정시 결제가격 계산
function setPriceEvent(){
	
}