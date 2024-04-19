document.addEventListener('DOMContentLoaded', function () {
  var modal = document.getElementById('collectionModal');

  // 여기에 린님 페이지 넣기
  // var btn = document.getElementById('profile-edit-btn');
  const contentRemoveBtn = document.querySelectorAll(
    '.collection_content_adjust_btn',
  );
  const collectionModifyBtn = document.querySelectorAll('.collection_edit_btn');
  // const collectionAddBtn = document.querySelectorAll('.collection_content_adjust_btn');
  //삭제, 수정, 작품관리(삭제), 생성
  var collectionAddBtn = document.getElementById('add_collection_btn');

  // var contentRemoveBtn = document.getElementById(
  //   'collection_content_adjust_btn',
  // );
  var collectionModifyBtn = document.getElementById('collection_edit_btn');

  document.getElementsByClassName('collection_content_adjust_btn');

  var span = document.getElementsByClassName('close')[0];

  contentRemoveBtn.onclick = function () {
    modal.style.display = 'block';
  };

  collectionModifyBtn.onclick = function () {
    modal.style.display = 'block';
  };

  collectionAddBtn.onclick = function () {
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
    $('.close', '.cancel_btn').click(function () {
      $('#collection-modal').hide();
    });

    // 폼 제출 이벤트 - 컬렉션 생성
    $('#addCollectionForm').submit(function (e) {
      e.preventDefault(); // 기본 제출 동작을 방지

      var formData = new FormData(this); // 폼 데이터를 FormData 객체로 생성

      $.ajax({
        url: '/collections', // 데이터를 전송할 서버의 URL
        type: 'POST',
        data: formData,
        processData: false, // processData와 contentType을 false로 설정하여,
        contentType: false, // FormData 객체를 제대로 전송할 수 있게 함
        success: function (data) {
          alert('프로필이 성공적으로 업데이트되었습니다.');
          window.location.href = '/collections'; // 이전 페이지(컬렉션)로 리다이렉트
        },
        error: function (response) {
          alert(response.responseJSON.message);
        },
      });
    });

    // 폼 제출 이벤트 - 컬렉션 수정
    $('#updateCollectionForm').submit(function (e) {
      e.preventDefault(); // 기본 제출 동작을 방지

      var formData = new FormData(this); // 폼 데이터를 FormData 객체로 생성
      var collectionId = window.location.pathname.split('/').pop();

      $.ajax({
        url: `/collections/${collectionId}`, // 데이터를 전송할 서버의 URL
        type: 'PATCH',
        data: formData,
        processData: false, // processData와 contentType을 false로 설정하여,
        contentType: false, // FormData 객체를 제대로 전송할 수 있게 함
        success: function (data) {
          alert('프로필이 성공적으로 업데이트되었습니다.');
          window.location.href = '/collections'; // 이전 페이지(컬렉션)로 리다이렉트
        },
        error: function (response) {
          alert(response.responseJSON.message);
        },
      });
    });

    // 폼 제출 이벤트 - 컨텐츠 삭제
    $('#deleteContentForm').submit(function (e) {
      e.preventDefault(); // 기본 제출 동작을 방지

      var formData = new FormData(this); // 폼 데이터를 FormData 객체로 생성
      var collectionId = window.location.pathname.split('/').pop();
      var webContentId = $(this).data('webContentId');

      $.ajax({
        url: `/collections/${collectionId}/content/${webContentId}`, // 데이터를 전송할 서버의 URL
        type: 'DELETE',
        data: formData,
        processData: false, // processData와 contentType을 false로 설정하여,
        contentType: false, // FormData 객체를 제대로 전송할 수 있게 함
        success: function (data) {
          alert('프로필이 성공적으로 업데이트되었습니다.');
          window.location.href = '/collections'; // 이전 페이지(컬렉션)로 리다이렉트
        },
        error: function (response) {
          alert(response.responseJSON.message);
        },
      });
    });
  });
});
