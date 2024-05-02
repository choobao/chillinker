console.log('dfdf');

var collectionBtn = document.querySelector('.col-button-icon');

var removeContentModal = document.getElementById('remove-content-modal');
var modal = document.getElementById('modal');
var colModal = document.querySelector('.collection_modal');

collectionBtn.click(function () {
  modal.style.display = 'block';

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
    backModal.style.display = 'block';

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

        $('.collection_modal').html(editCollection);
      },
      error: function (response) {
        alert(response.responseJSON.message);
      },
    });
  });
});
