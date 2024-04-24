/* <div class="modal_content">
  <form
    name="delete_content_form"
    method="delete"
    action="/collections/<%= item.id %>/content/<%= item.webContents.webContentId %>"
    id="deleteContentForm"
  >
    <ul class="delete_content_list"></ul>
  </form>
</div>; */

console.log('dfdf');

var collectionBtn = document.querySelector('.col-button-icon');

var removeContentModal = document.getElementById('remove-content-modal');
var modal = document.getElementById('modal');
var colModal = document.querySelector('.collection_modal');

// var span = document.getElementsByClassName('close')[0];

// btn.onclick = function () {
//   modal.style.display = 'block';
// };

// span.onclick = function () {
//   modal.style.display = 'none';
// };

// window.onclick = function (event) {
//   if (event.target == modal) {
//     modal.style.display = 'none';
//     window.onclick = null;
//   }
// };
////////////

collectionBtn.click(function () {
  // 모달 창 보이기
  modal.style.display = 'block';
  // 모달 내용 변경
  $.ajax({
    url: `/info/${collectionId}`,
    type: 'POST',
    success: function (data) {
      let editCollection = `
                <label for="title">컬렉션 제목</label>
                <input type="text" name="title" id="title" value="${data.title}" />
                <br />
                <div class="btn_area">
                  <input type="submit" value="완료"/>
                </div>`;
      // 컬렉션 모달 내용 변경
      $('.collection_modal').html(editCollection);
    },
    error: function (response) {
      alert(response.responseJSON.message);
    },
  });
});

$(document).ready(function () {
  console.log('연결');

  console.log(colModal);

  $(collectionBtn).click(function () {
    // 모달 창 보이기
    backModal.style.display = 'block';
    // 모달 내용 변경
    $.ajax({
      url: `/collections/info/${collectionId}`,
      type: 'POST',
      success: function (data) {
        let editCollection = `
                  <label for="title">컬렉션 제목</label>
                  <input type="text" name="title" id="title" value="${data.title}" />
                  <br />
                  <div class="btn_area">
                    <input type="submit" value="완료"/>
                  </div>`;
        // 컬렉션 모달 내용 변경
        $('.collection_modal').html(editCollection);
      },
      error: function (response) {
        alert(response.responseJSON.message);
      },
    });
  });
});

// collectionModifyBtn.forEach(function (collectionModifyBtn) {
//   collectionModifyBtn.addEventListener('click', function () {
//     const index = this.id.split('-')[1];
//     const collectionId = document.getElementById(
//       `collectionId-${index}`,
//     ).textContent;

//     $.ajax({
//       url: `/collections/col-list/info/${collectionId}`,
//       type: 'GET',
//       success: function (data) {
//         let editCollection = `<label for="cover">컬렉션 이미지 업로드</label>
//             <br />
//             <input type="file" name="coverImage" id="cover" accept="image/*" />
//             <input type="submit" value="" />
//             <br />
//             <label for="title">컬렉션 제목</label>
//             <input type="text" name="title" id="title" value="${data.title}" />
//             <br />
//             <label for="desc">컬렉션 설명</label>
//             <textarea name="desc" id="" cols="30" rows="10" >${data.desc}</textarea>
//             <br />
//             <div class="btn_area">
//               <input type="submit" value="완료"/>
//             </div>`;
//         $('#updateCollectionForm').html(editCollection);
//       },
//       error: function (response) {
//         alert(response.responseJSON.message);
//       },
//     });
//     modifyContentModal.style.display = 'block';

//     // 폼 제출 이벤트 - 컬렉션 수정
//     $('#updateCollectionForm').submit(function (e) {
//       e.preventDefault(); // 기본 제출 동작을 방지

//       var formData = new FormData(this); // 폼 데이터를 FormData 객체로 생성
//       console.log(formData);
//       $.ajax({
//         url: `/collections/${collectionId}`, // 데이터를 전송할 서버의 URL
//         type: 'PATCH',
//         data: formData,
//         processData: false, // processData와 contentType을 false로 설정하여,
//         contentType: false, // FormData 객체를 제대로 전송할 수 있게 함
//         success: function (data) {
//           alert('컬렉션이 수정되었습니다.');
//           window.location.href = '/collections'; // 이전 페이지(컬렉션)로 리다이렉트
//         },
//         error: function (response) {
//           alert(response.responseJSON.message);
//         },
//       });
//     });
//   });
// });
