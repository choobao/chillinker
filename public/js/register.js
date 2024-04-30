$(document).ready(function () {
  $('#register-form').submit(function (e) {
    e.preventDefault();

    var formData = new FormData(this);

    $.ajax({
      url: '/users/register',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function (data) {
        alert('Welcome to Chillinker!');
        window.location.href = '/main';
      },
      error: function (response) {
        alert(response.responseJSON.message);
      },
    });
  });
});

document.addEventListener('DOMContentLoaded', function () {
  var fileInput = document.getElementById('profile-register-img-input');
  var previewImg = document.getElementById('preview-img');

  fileInput.addEventListener('change', function (e) {
    var file = e.target.files[0]; // 사용자가 선택한 파일
    if (!file) {
      return; // 파일이 선택되지 않은 경우 함수 종료
    }

    var reader = new FileReader();
    reader.onload = function (e) {
      previewImg.src = e.target.result; // FileReader의 결과로 이미지의 src를 설정
    };
    reader.readAsDataURL(file); // 파일의 내용을 읽어 Data URL 형식의 문자열로 반환
  });
});
