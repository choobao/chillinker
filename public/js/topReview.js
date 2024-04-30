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

  //   const likeButtons = document.querySelectorAll('.my-rui_button_white_25');
  //   console.log(likeButtons);
  //   likeButtons.forEach(function (likeButton) {
  //     likeButton.addEventListener('click', function () {
  //       const index = this.id.split('-')[1];
  //       const reviewId = document
  //         .getElementById(`reviewId-${index}`)
  //         .getAttribute('val');
  //       console.log(reviewId);
  //       $.ajax({
  //         type: 'Post',
  //         url: `/reviews/${reviewId}/likes`,
  //         contentType: 'application/json',
  //         success: function (data) {
  //           location.reload(true); // 성공 시 페이지 새로고침
  //         },
  //         error: function (response) {
  //           alert(response.responseJSON.message); // 오류 발생 시 메시지 표시
  //         },
  //       });
  //     });
  //   });

  const urlParams = new URLSearchParams(window.location.search);
  const order = urlParams.get('order');

  const searchBtn1 = document.querySelector('.search_btn1');
  const searchBtn2 = document.querySelector('.search_btn2');

  if (order === 'recent') {
    searchBtn1.classList.add('active');
    searchBtn2.classList.remove('active');
  } else {
    searchBtn1.classList.remove('active');
    searchBtn2.classList.add('active');
  }
});
