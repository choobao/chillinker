$(document).ready(function () {
  $('#myform').submit(function (e) {
    e.preventDefault(); // 폼 기본 제출 막기

    var url = window.location.href;
    var idUrl = url.split('?')[0];

    // 폼 데이터 수집
    var formData = {
      content: $('textarea[name="content"]').val(),
      rate: parseInt($('input[name="rate"]:checked').val(), 10), // rate를 숫자로 변환
      isSpoiler: $('input[name="isSpoiler"]').is(':checked'), // isSpoiler를 불리언 값으로 변환
    };

    // AJAX 요청
    $.ajax({
      type: 'POST',
      url: idUrl,
      contentType: 'application/json', // 요청의 Content-Type을 application/json으로 설정
      data: JSON.stringify(formData),
      success: function (data) {
        location.reload(true);
      },
      error: function (response) {
        alert(response.responseJSON.message);
      },
    });
  });
});
