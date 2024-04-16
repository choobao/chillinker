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

// 버튼 클릭 이벤트
// 팔로잉/팔로워
$('#profile-follow').click(function () {
  window.location.href = '/main'; // 임시로 메인으로 이동함. 추후 수정 요망.
});

// 내 리뷰
$('#profile-review').click(function () {
  window.location.href = '/main'; // 임시로 메인으로 이동함. 추후 수정 요망.
});

// 보고싶어요
$('#profile-like').click(function () {
  window.location.href = '/user/likes';
});

// 내 컬렉션
$('#profile-col').click(function () {
  window.location.href = '/collections';
});

// 내가 북마크한 컬렉션
$('#profile-bookmark-col').click(function () {
  window.location.href = '/bookmark';
});

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
        alert('프로필이 성공적으로 업데이트되었습니다.');
        window.location.href = '/users/mypage'; // 이전 페이지(마이페이지)로 리다이렉트
      },
      error: function (response) {
        alert(response.responseJSON.message);
      },
    });
  });
});
