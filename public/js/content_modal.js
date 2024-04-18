var modal = document.getElementById('collectionModal');

var btn = document.getElementById('like-btn');

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

// 컨텐츠 id 받아오는 코드
$('.add-to-collection-btn').on('click', function (event) {
  event.preventDefault();

  var contentId = $(this).data('content-id');

  $('#contentIdInput').val(contentId);

  $('#collectionModal').show();
});

$(document).ready(function () {
  // 모달 창 닫기 버튼 이벤트
  $('.close', '.cancel_btn').click(function () {
    $('#collectionModal').hide();
  });

  // 폼 제출 이벤트
  $('#addContentForm').submit(function (e) {
    e.preventDefault(); // 기본 제출 동작을 방지

    var formData = new FormData(this); // 폼 데이터를 FormData 객체로 생성

    $.ajax({
      url: '/collections/:collectionId/content', // 데이터를 전송할 서버의 URL
      type: 'POST',
      data: formData,
      processData: false, // processData와 contentType을 false로 설정하여,
      contentType: false, // FormData 객체를 제대로 전송할 수 있게 함
      success: function (data) {
        alert('컨텐츠가 성공적으로 추가되었습니다.');
        window.location.href = '/collections'; // 작품페이지로 이동하는게 나을지
      },
      error: function (response) {
        alert(response.responseJSON.message);
      },
    });
  });
});
