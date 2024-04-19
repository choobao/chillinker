document.addEventListener('DOMContentLoaded', function () {
  var removeContentModal = document.querySelector('.remove-content-modal');
  var modifyContentModal = document.querySelector('.modify-colleciton-modal');
  var addContentModal = document.querySelector('.add-collection-modal');

  const contentRemoveBtns = document.querySelectorAll(
    '.collection_content_adjust_btn',
  );

  $('.close').click(function () {
    removeContentModal.style.display = 'none';
    modifyContentModal.style.display = 'none';
    addContentModal.style.display = 'none';
  });

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
          let titles = '';
          data.forEach(({ title, id }) => {
            titles += `<li>
            <label for="remove-content-title">${title}</label>
            <input type="button" value="삭제" onclick="deleteContent(${collectionId}, ${id})" />
          </li>`;
          });
          $('.delete_content_list').html(titles);
        },
        error: function (response) {
          alert(response.responseJSON.message);
        },
      });
      removeContentModal.style.display = 'block';

      const selectedCollection = collection.find(
        (col) => col.id == collectionId,
      );

      if (selectedCollection) {
        let titles = '';
        selectedCollection.webContents.forEach((content) => {
          titles += `<p>${content.webContentTitle}</p>`;
        });

        document.getElementById('remove-content-modal_title').innerHTML =
          titles;
      }
    });
  });

  // const collectionModifyBtn = document.querySelectorAll('.collection_edit_btn');
  // const collectionAddBtn = document.querySelectorAll('.collection_content_adjust_btn');
  //삭제, 수정, 작품관리(삭제), 생성
  // var collectionAddBtn = document.getElementById('add_collection_btn');

  // // var contentRemoveBtn = document.getElementById(
  // //   'collection_content_adjust_btn',
  // // );
  // var collectionModifyBtn = document.getElementById('collection_edit_btn');

  // document.getElementsByClassName('collection_content_adjust_btn');

  // var span = document.getElementsByClassName('close')[0];

  // contentRemoveBtn.onclick = function () {
  //   modal.style.display = 'block';
  // };

  // collectionModifyBtn.onclick = function () {
  //   modal.style.display = 'block';
  // };

  // collectionAddBtn.onclick = function () {
  //   modal.style.display = 'block';
  // };

  // span.onclick = function () {
  //   modal.style.display = 'none';
  // };

  // window.onclick = function (event) {
  //   if (event.target == modal) {
  //     modal.style.display = 'none';
  //   }
  // };

  // $(document).ready(function () {
  //   // 모달 창 닫기 버튼 이벤트
  //   $('.close', '.cancel_btn').click(function () {
  //     $('#collection-modal').hide();
  //   });

  //   // 폼 제출 이벤트 - 컬렉션 생성
  //   $('#addCollectionForm').submit(function (e) {
  //     e.preventDefault(); // 기본 제출 동작을 방지

  //     var formData = new FormData(this); // 폼 데이터를 FormData 객체로 생성

  //     $.ajax({
  //       url: '/collections', // 데이터를 전송할 서버의 URL
  //       type: 'POST',
  //       data: formData,
  //       processData: false, // processData와 contentType을 false로 설정하여,
  //       contentType: false, // FormData 객체를 제대로 전송할 수 있게 함
  //       success: function (data) {
  //         alert('프로필이 성공적으로 업데이트되었습니다.');
  //         window.location.href = '/collections'; // 이전 페이지(컬렉션)로 리다이렉트
  //       },
  //       error: function (response) {
  //         alert(response.responseJSON.message);
  //       },
  //     });
  //   });

  //   // 폼 제출 이벤트 - 컬렉션 수정
  //   $('#updateCollectionForm').submit(function (e) {
  //     e.preventDefault(); // 기본 제출 동작을 방지

  //     var formData = new FormData(this); // 폼 데이터를 FormData 객체로 생성
  //     var collectionId = window.location.pathname.split('/').pop();

  //     $.ajax({
  //       url: `/collections/${collectionId}`, // 데이터를 전송할 서버의 URL
  //       type: 'PATCH',
  //       data: formData,
  //       processData: false, // processData와 contentType을 false로 설정하여,
  //       contentType: false, // FormData 객체를 제대로 전송할 수 있게 함
  //       success: function (data) {
  //         alert('프로필이 성공적으로 업데이트되었습니다.');
  //         window.location.href = '/collections'; // 이전 페이지(컬렉션)로 리다이렉트
  //       },
  //       error: function (response) {
  //         alert(response.responseJSON.message);
  //       },
  //     });
  //   });

  //   // 폼 제출 이벤트 - 컨텐츠 삭제
  //   $('#deleteContentForm').submit(function (e) {
  //     e.preventDefault(); // 기본 제출 동작을 방지

  //     var formData = new FormData(this); // 폼 데이터를 FormData 객체로 생성
  //     var collectionId = window.location.pathname.split('/').pop();
  //     var webContentId = $(this).data('webContentId');

  //     $.ajax({
  //       url: `/collections/${collectionId}/content/${webContentId}`, // 데이터를 전송할 서버의 URL
  //       type: 'DELETE',
  //       data: formData,
  //       processData: false, // processData와 contentType을 false로 설정하여,
  //       contentType: false, // FormData 객체를 제대로 전송할 수 있게 함
  //       success: function (data) {
  //         alert('프로필이 성공적으로 업데이트되었습니다.');
  //         window.location.href = '/collections'; // 이전 페이지(컬렉션)로 리다이렉트
  //       },
  //       error: function (response) {
  //         alert(response.responseJSON.message);
  //       },
  //     });
  //   });
  // });
});
