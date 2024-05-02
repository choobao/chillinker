document.addEventListener('DOMContentLoaded', function () {
  var dates = document.querySelectorAll('.review_date');

  dates.forEach(function (dateElement) {
    var dateText = dateElement.textContent || dateElement.innerText;

    var date = new Date(dateText);

    var formattedDate =
      date.getFullYear() +
      '-' +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      '-' +
      ('0' + date.getDate()).slice(-2);

    dateElement.textContent = formattedDate;
  });
});

const spoilerBtns = document.querySelectorAll('.alert_detail_link');
const myReview = document.getElementById(`review-wrapper`);

window.addEventListener('load', function () {
  spoilerBtns.forEach(function (spoilerBtn) {
    const index = spoilerBtn.id.split('-')[1];
    const spoilerBlind = document.getElementById(`alert_article-${index}`);
    const content = document.getElementById(`item-content-${index}`);

    if (spoilerBlind && !myReview) {
      spoilerBlind.style.position = 'absolute';
      content.style.display = 'none';
    }
  });
});

$(document).ready(function () {
  var userId = document.getElementById('userId').textContent;
  var contentId = document.getElementById('contentId').textContent;

  $('#collection-btn').click(function () {
    if (!userId) {
      alert('로그인이 필요한 서비스입니다!');
      return;
    } else {
      $('#modal').show();
      $('#collection-modal').show();

      $('.close').click(function () {
        $('#modal').hide();
        $('#collection-modal').hide();
      });
    }

    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = 'none';
        window.onclick = null;
      }
    };

    $.ajax({
      type: 'GET',
      url: `/collections/title/${userId}`,
      success: function (datas) {
        let editCollections = '';

        if (datas.length === 0) {
          editCollections = `
          <div class='new-col'>
            <div class='new-col-title'>
              <p>내 컬렉션이 없습니다. 새로운 컬렉션을 만들어보세요!</p>
            </div>
            <div class="btn_area">
            <a href="/collections">
            <button type="button" class="new-col-btn">
              만들러가기
            </button></a>
          </div>
          </div>
          `;
        } else {
          datas.forEach(function (data) {
            let editCollection = `
              <div class='col-title' id='col_title-${data.id}'>
                <label class='col-title-list' for="title-${data.id}">${data.title}</label>
                <br />
                <div class="btn_area">
                  <button type="button" class="preference-button col-add-btn">
                    추가
                  </button>
                </div>
              </div>
            `;
            editCollections += editCollection;
          });
        }

        $('.modal_content').html(editCollections);
      },
      error: function (response) {
        alert(response.responseJSON.message);
      },
    });
  });

  $('.collection_modal').on('click', '.col-add-btn', function () {
    var userId = document.getElementById('userId').textContent;
    var contentId = document.getElementById('contentId').textContent;
    var collectionId = $(this).closest('.col-title').attr('id').split('-')[1];

    $.ajax({
      type: 'POST',
      url: `/collections/${collectionId}/content/${contentId}`,
      success: function (datas) {
        alert(`작품이 추가되었습니다!`);
        $('#modal').hide();
        $('#collection-modal').hide();
      },
      error: function (response) {
        alert(response.responseJSON.message);
      },
    });
  });
});

spoilerBtns.forEach(function (spoilerBtn) {
  spoilerBtn.addEventListener('click', function () {
    const index = this.id.split('-')[1];
    const spoilerBlind = document.getElementById(`alert_article-${index}`);
    const reviewWrap = document.getElementById(`review-wrapper-${index}`);

    const content = document.getElementById(`item-content-${index}`);

    spoilerBlind.style.display = 'none';
    reviewWrap.style.display = 'block';
    content.style.display = 'block';
  });
});

document.addEventListener('DOMContentLoaded', function () {
  var url = window.location.href;
  var idUrl = url.split('?')[0];

  const editButtons = document.querySelectorAll('.editButton');
  const deleteButtons = document.querySelectorAll('.deleteButton');
  const saveButtons = document.querySelectorAll('.saveButton');
  const likeButtons = document.querySelectorAll('.rui_button_white_25');

  likeButtons.forEach(function (likeButton) {
    likeButton.addEventListener('click', function () {
      const index = this.id.split('-')[1];
      const reviewId = document.getElementById(`reviewId-${index}`).textContent;

      $.ajax({
        type: 'Post',
        url: `/reviews/${reviewId}/likes`,
        contentType: 'application/json',
        success: function (data) {
          location.reload(true);
        },
        error: function (response) {
          alert(response.responseJSON.message);
        },
      });
    });
  });

  editButton.addEventListener('click', function () {
    const editwrapper = document.getElementById(`editWrapper`);
    const saveButton = document.getElementById(`saveButton`);
    const reviewContent = document.getElementById(`reviewWrapper`);

    this.style.display = 'none';
    saveButton.style.display = 'block';
    editwrapper.style.display = 'block';
    reviewContent.style.display = 'none';
  });

  saveButton.addEventListener('click', function () {
    const reviewId = document.getElementById(`reviewId`).textContent;
    const editContentInput = document.getElementById(`editInput`);
    const editRateInput = document.getElementById(`editRateInput`);

    var formData = {
      content: editContentInput.value,
      rate: parseInt(editRateInput.value, 10),
      isSpoiler: $('input[name="editIsSpoiler"]').is(':checked'),
    };

    $.ajax({
      type: 'Patch',
      url: `${idUrl}/${reviewId}`,
      contentType: 'application/json',
      data: JSON.stringify(formData),
      success: function (data) {
        location.reload(true);
      },
      error: function (response) {
        alert(response.responseJSON.message);
        location.reload(true);
      },
    });
  });

  deleteButton.addEventListener('click', function () {
    const reviewId = document.getElementById(`reviewId`).textContent;

    $.ajax({
      type: 'Delete',
      url: `${idUrl}/${reviewId}`,
      contentType: 'application/json',
      success: function (data) {
        location.reload(true);
      },
      error: function (response) {
        alert(response.responseJSON.message);
      },
    });
  });

  const reviewWraps = document.querySelectorAll('.review-wrapper');
  const spiolerBlinds = document.querySelectorAll('.alert_article');

  var reviewItems = document.querySelectorAll('.show_review');

  reviewItems.forEach(function (reviewItem) {
    var index = reviewItem.id.split('-')[1];
    var spiolerBlinds = document.getElementById(`alert_article-${index}`);
    var reviewWrapper = document.getElementById(`review-wrapper-${index}`);
    const content = document.getElementById(`item-content-${index}`);

    if (spiolerBlinds) {
      reviewWrapper.style.display = 'none';
    }
  });
});

$(document).ready(function () {
  $('#myform').submit(function (e) {
    e.preventDefault();

    var url = window.location.href;
    var idUrl = url.split('?')[0];

    var formData = {
      content: $('textarea[name="content"]').val(),
      rate: Math.round(Number($('input[name="rate"]:checked').val())),
      isSpoiler: $('input[name="isSpoiler"]').is(':checked'),
    };

    $.ajax({
      type: 'POST',
      url: idUrl,
      contentType: 'application/json',
      data: JSON.stringify(formData),
      success: function (data) {
        location.href = `${idUrl}?option=c`;
      },
      error: function (response) {
        alert(response.responseJSON.message);
      },
    });
  });
});

$('#like-btn').click(function () {
  var contentId = $('#content-id').val();

  $.ajax({
    url: `/likes/change?contentId=${contentId}`,
    type: 'POST',
    data: $(this).serialize(),
    success: function (data) {
      location.reload(true);
    },
    error: function (response) {
      alert(response.responseJSON.message);
    },
  });
});
