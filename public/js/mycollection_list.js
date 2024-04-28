document.addEventListener('DOMContentLoaded', function () {
  //모달 배경
  var removeContentModal = document.querySelector('.remove-content-modal');
  var modifyContentModal = document.querySelector('.modify-colleciton-modal');
  var addContentModal = document.querySelector('.add-collection-modal');
  //작품관리 버튼
  const contentRemoveBtns = document.querySelectorAll(
    '.collection_content_adjust_btn',
  );
  //컬렉션 수정 버튼
  const collectionModifyBtn = document.querySelectorAll('.collection_edit_btn');

  //컬렉션 생성 버튼
  const collectionAddBtn = document.querySelector('.add_collection_btn');

  //컬렉션 삭제 버튼
  const collectionDelBtn = document.querySelectorAll('.collection_delete_btn');

  //컬렉션 삭제
  collectionDelBtn.forEach(function (collectionDelBtn) {
    collectionDelBtn.addEventListener('click', function () {
      const index = this.id.split('-')[1];
      const collectionId = document.getElementById(
        `collectionId-${index}`,
      ).textContent;

      $.ajax({
        url: `/collections/${collectionId}`,
        type: 'DELETE',
        success: function () {
          alert('컬렉션이 삭제되었습니다.');
          location.reload(true); // 이전 페이지(컬렉션)로 리다이렉트
        },
        error: function (response) {
          alert(response.responseJSON.message);
        },
      });
    });
  });

  //모달창 닫는 부분
  $('.close').click(function () {
    addContentModal.style.display = 'none';
    removeContentModal.style.display = 'none';
    modifyContentModal.style.display = 'none';
  });

  //컨텐츠 삭제 창에 컨텐츠 목록 표시 + 컨텐츠 삭제 작업
  contentRemoveBtns.forEach(function (contentRemoveBtn) {
    contentRemoveBtn.addEventListener('click', function () {
      const index = this.id.split('-')[1];
      const collectionId = document.getElementById(
        `collectionId-${index}`,
      ).textContent;

      $.ajax({
        url: `/collections/info/${collectionId}`, // 데이터를 전송할 서버의 URL
        type: 'POST',
        success: function (data) {
          if (data.length === 0) {
            let message = `<h1 class="no-content"> 아직 컬렉션에 작품이 없습니다.<br> 작품을 담아보세요! </h1>
            <a class="to-main-btn" href='/main'>메인으로</a>`;
            $('.delete_content_list').html(message);
          } else {
            let titles = '';
            data.forEach(({ title, id }) => {
              titles += `<li>
            <label for="remove-content-title">${title}</label>
            <input type="button" value="삭제" onclick="deleteContent(${collectionId}, ${id})" />
          </li>`;
            });
            $('.delete_content_list').html(titles);
          }
        },
        error: function (response) {
          alert(response.responseJSON.message);
        },
      });
      removeContentModal.style.display = 'block'; //모달창 열어줌.
    });
  });

  //컬렉션 수정
  collectionModifyBtn.forEach(function (collectionModifyBtn) {
    collectionModifyBtn.addEventListener('click', function () {
      const index = this.id.split('-')[1];
      const collectionId = document.getElementById(
        `collectionId-${index}`,
      ).textContent;

      $.ajax({
        url: `/collections/col-list/info/${collectionId}`,
        type: 'GET',
        success: function (data) {
          let editCollection = `<label for="cover">컬렉션 이미지 업로드</label>
            <br />
            <input type="file" name="coverImage" id="cover" accept="image/*" />
            <input type="submit" value="" />
            <br />
            <label for="title">컬렉션 제목</label>
            <input type="text" name="title" id="title" value="${data.title}" />
            <br />
            <label for="desc">컬렉션 설명</label>
            <textarea name="desc" id="" cols="30" rows="10" >${data.desc}</textarea>
            <br />
            <div class="btn_area">
              <input type="submit" value="완료"/>
            </div>`;
          $('#updateCollectionForm').html(editCollection);
        },
        error: function (response) {
          alert(response.responseJSON.message);
        },
      });
      modifyContentModal.style.display = 'block';

      // 폼 제출 이벤트 - 컬렉션 수정
      $('#updateCollectionForm').submit(function (e) {
        e.preventDefault(); // 기본 제출 동작을 방지

        var formData = new FormData(this); // 폼 데이터를 FormData 객체로 생성
        $.ajax({
          url: `/collections/${collectionId}`, // 데이터를 전송할 서버의 URL
          type: 'PATCH',
          data: formData,
          processData: false, // processData와 contentType을 false로 설정하여,
          contentType: false, // FormData 객체를 제대로 전송할 수 있게 함
          success: function (data) {
            alert('컬렉션이 수정되었습니다.');
            window.location.href = '/collections'; // 이전 페이지(컬렉션)로 리다이렉트
          },
          error: function (response) {
            alert(response.responseJSON.message);
          },
        });
      });
    });
  });

  //컨텐츠 추가 버튼 -> 모달
  collectionAddBtn.addEventListener('click', function () {
    addContentModal.style.display = 'block';
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
        alert('컬렉션이 생성되었습니다.');
        window.location.href = '/collections'; // 이전 페이지(컬렉션)로 리다이렉트
      },
      error: function (response) {
        alert(response.responseJSON.message);
      },
    });
  });
});
