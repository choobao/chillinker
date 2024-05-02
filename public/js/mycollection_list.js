document.addEventListener('DOMContentLoaded', function () {
  var removeContentModal = document.querySelector('.remove-content-modal');
  var modifyContentModal = document.querySelector('.modify-colleciton-modal');
  var addContentModal = document.querySelector('.add-collection-modal');

  const contentRemoveBtns = document.querySelectorAll(
    '.collection_content_adjust_btn',
  );

  const collectionModifyBtn = document.querySelectorAll('.collection_edit_btn');

  const collectionAddBtn = document.querySelector('.add_collection_btn');

  const collectionDelBtn = document.querySelectorAll('.collection_delete_btn');

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
          location.reload(true);
        },
        error: function (response) {
          alert(response.responseJSON.message);
        },
      });
    });
  });

  $('.close').click(function () {
    addContentModal.style.display = 'none';
    removeContentModal.style.display = 'none';
    modifyContentModal.style.display = 'none';
  });

  contentRemoveBtns.forEach(function (contentRemoveBtn) {
    contentRemoveBtn.addEventListener('click', function () {
      const index = this.id.split('-')[1];
      const collectionId = document.getElementById(
        `collectionId-${index}`,
      ).textContent;

      $.ajax({
        url: `/collections/info/${collectionId}`,
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
      removeContentModal.style.display = 'block';
    });
  });

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

      $('#updateCollectionForm').submit(function (e) {
        e.preventDefault();

        var formData = new FormData(this);
        $.ajax({
          url: `/collections/${collectionId}`,
          type: 'PATCH',
          data: formData,
          processData: false,
          contentType: false,
          success: function (data) {
            alert('컬렉션이 수정되었습니다.');
            window.location.href = '/collections';
          },
          error: function (response) {
            alert(response.responseJSON.message);
          },
        });
      });
    });
  });

  collectionAddBtn.addEventListener('click', function () {
    addContentModal.style.display = 'block';
  });

  $('#addCollectionForm').submit(function (e) {
    e.preventDefault();

    var formData = new FormData(this);
    $.ajax({
      url: '/collections',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function (data) {
        alert('컬렉션이 생성되었습니다.');
        window.location.href = '/collections';
      },
      error: function (response) {
        alert(response.responseJSON.message);
      },
    });
  });
});
