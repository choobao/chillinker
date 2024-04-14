var modal = document.getElementById('mypage-update');

var btn = document.getElementById('profile-edit-btn');

var span = document.getElementsByClassName('close')[0];

btn.onclick = function () {
  modal.style.display = 'block';
};

span.onclick = function () {
  modal.style.display = 'none';
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
};

$(document).ready(function () {
  // 모달 창 닫기 버튼 이벤트
  $('.close').click(function () {
    $('#mypage-update').hide();
  });

  // 폼 제출 이벤트
  $('#profile-form').submit(function (e) {
    e.preventDefault(); // 기본 제출 동작을 방지

    var formData = new FormData(this); // 폼 데이터를 FormData 객체로 생성

    $.ajax({
      url: '/users/mypage/update', // 데이터를 전송할 서버의 URL
      type: 'PATCH',
      data: formData,
      processData: false, // processData와 contentType을 false로 설정하여,
      contentType: false, // FormData 객체를 제대로 전송할 수 있게 함
      success: function (data) {
        alert('프로필이 성공적으로 업데이트되었습니다.'); // 성공 메시지
        window.location.href = '/users/mypage'; // 이전 페이지(마이페이지)로 리다이렉트
      },
      error: function (response) {
        //alert('프로필 업데이트에 실패했습니다.'); // 실패 메시지
        alert(response.responseJSON.message);
      },
    });
  });
});
