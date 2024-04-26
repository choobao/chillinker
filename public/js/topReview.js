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
