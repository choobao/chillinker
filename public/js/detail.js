$(document).ready(function () {
  $('#myform').submit(function (e) {
    e.preventDefault(); // 폼 기본 제출 막기

    console.log('dd');

    // 폼 데이터 수집
    var formData = {
      content: $('textarea[name="content"]').val(),
      rate: parseInt($('input[name="rate"]:checked').val(), 10), // rate를 숫자로 변환
      isSpoiler: $('input[name="isSpoiler"]').is(':checked'), // isSpoiler를 불리언 값으로 변환
    };

    // AJAX 요청
    $.ajax({
      type: 'POST',
      url: '/books/<%- content.id %>', // 실제 서버 URL로 대체
      data: formData,
      success: function (response) {
        // 성공적으로 데이터를 전송한 후의 처리
        console.log('서버 응답:', response);
      },
      error: function (xhr, status, error) {
        // 오류 처리
        console.error('오류 발생:', error);
      },
    });
  });
});
