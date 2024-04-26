document.addEventListener('DOMContentLoaded', function () {
  // 모든 'review_date' 클래스를 가진 요소들을 찾음
  var dates = document.querySelectorAll('.review_date');

  dates.forEach(function (dateElement) {
    // 각 요소의 텍스트(날짜 데이터)를 가져옴
    var dateText = dateElement.textContent || dateElement.innerText;

    // 날짜 데이터를 Date 객체로 변환
    var date = new Date(dateText);

    // Date 객체를 'YYYY-MM-DD' 포맷으로 변환
    var formattedDate =
      date.getFullYear() +
      '-' +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      '-' +
      ('0' + date.getDate()).slice(-2);

    // 요소의 내용을 변경된 포맷의 날짜로 업데이트
    dateElement.textContent = formattedDate;
  });
});

const spoilerBtns = document.querySelectorAll('.alert_detail_link');
const myReview = document.getElementById(`review-wrapper`);

window.addEventListener('load', function () {
  spoilerBtns.forEach(function (spoilerBtn) {
    const index = spoilerBtn.id.split('-')[1];
    const spoilerBlind = document.getElementById(`alert_article-${index}`);

    // 스포일러 버튼이 존재하는 경우
    if (spoilerBlind && !myReview) {
      // 스포일러 버튼의 스타일에 position을 absolute로 설정합니다.
      spoilerBlind.style.position = 'absolute';
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
          // 데이터가 없는 경우 "내 컬렉션이 없습니다" 텍스트를 표시합니다.
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
          // 데이터가 있는 경우 컬렉션을 표시합니다.
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

    spoilerBlind.style.display = 'none';
    reviewWrap.style.display = 'block';
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
          location.reload(true); // 성공 시 페이지 새로고침
        },
        error: function (response) {
          alert(response.responseJSON.message); // 오류 발생 시 메시지 표시
        },
      });
    });
  });

  editButton.addEventListener('click', function () {
    // const reviewId = document.getElementById(`myReviewId`).textContent;

    const editwrapper = document.getElementById(`editWrapper`);
    const saveButton = document.getElementById(`saveButton`); // 저장 버튼 선택
    const reviewContent = document.getElementById(`reviewWrapper`); // 수정할 리뷰 내용 선택

    this.style.display = 'none'; // 현재 수정 버튼 숨기기
    saveButton.style.display = 'block'; // 저장 버튼 보이기
    editwrapper.style.display = 'block'; // 입력 필드 보이기
    reviewContent.style.display = 'none';
  });

  //전체 선택
  saveButton.addEventListener('click', function () {
    const reviewId = document.getElementById(`reviewId`).textContent;
    const editContentInput = document.getElementById(`editInput`); // 수정된 editContent 입력 필드 선택
    const editRateInput = document.getElementById(`editRateInput`); // 수정된 editRate 입력 필드 선택

    var formData = {
      content: editContentInput.value, // 수정된 방식으로 값을 가져옴
      rate: parseInt(editRateInput.value, 10), // 수정된 방식으로 값을 가져옴
      isSpoiler: $('input[name="editIsSpoiler"]').is(':checked'), // isSpoiler 불리언 값 변환은 그대로 유지
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

    // 삭제 요청 실행
    $.ajax({
      type: 'Delete',
      url: `${idUrl}/${reviewId}`,
      contentType: 'application/json',
      success: function (data) {
        location.reload(true); // 성공 시 페이지 새로고침
      },
      error: function (response) {
        alert(response.responseJSON.message); // 오류 발생 시 메시지 표시
      },
    });
  });

  const reviewWraps = document.querySelectorAll('.review-wrapper');
  const spiolerBlinds = document.querySelectorAll('.alert_article');

  var reviewItems = document.querySelectorAll('.show_review');

  reviewItems.forEach(function (reviewItem) {
    var index = reviewItem.id.split('-')[1]; // 현재 요소의 id를 가져옵니다.
    var spiolerBlinds = document.getElementById(`alert_article-${index}`);
    var reviewWrapper = document.getElementById(`review-wrapper-${index}`);

    if (spiolerBlinds) {
      reviewWrapper.style.display = 'none';
    }
  });

  likeButtons.forEach(function (likeButton) {
    likeButton.addEventListener('click', function () {
      const index = this.id.split('-')[1];
      const reviewId = document.getElementById(`reviewId-${index}`).textContent;

      $.ajax({
        type: 'Post',
        url: `${idUrl}/${reviewId}/likes`,
        contentType: 'application/json',
        success: function (data) {
          location.reload(true); // 성공 시 페이지 새로고침
        },
        error: function (response) {
          alert(response.responseJSON.message); // 오류 발생 시 메시지 표시
        },
      });
    });
  });
});

$(document).ready(function () {
  $('#myform').submit(function (e) {
    e.preventDefault(); // 폼 기본 제출 막기

    var url = window.location.href;
    var idUrl = url.split('?')[0];

    // 폼 데이터 수집
    var formData = {
      content: $('textarea[name="content"]').val(),
      rate: Math.round(Number($('input[name="rate"]:checked').val())), // rate를 숫자로 변환
      isSpoiler: $('input[name="isSpoiler"]').is(':checked'), // isSpoiler를 불리언 값으로 변환
    };

    // AJAX 요청
    $.ajax({
      type: 'POST',
      url: idUrl,
      contentType: 'application/json', // 요청의 Content-Type을 application/json으로 설정
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
