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
