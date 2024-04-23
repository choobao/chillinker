var modal = document.getElementById('collection-modal');

var btn = document.getElementById('collection-btn');

var span = document.getElementsByClassName('close')[0];

btn.onclick = function () {
  modal.style.display = 'block';
};

span.onclick = function () {
  modal.style.display = 'none';
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
};

$(document).ready(function () {
  var url = window.location.href.split('/');
  var contentId = url[url.length - 1];

  $('.close').click(function () {
    $('#collection-modal').hide();
  });

  $('#collection-btn').on('click', function () {
    // 현재 컨텐츠의 ID 가져오기

    $.ajax({
      url: `/collections`,
      type: 'GET',
      dataType: 'json',
      data: $(this).serialize(),
      success: function (data) {
        console.log('가져오기 성공');
        console.log(data);
        // console.log(contentId);
        $.each(data, function (i) {
          var option = `<option value="${data[i].id}">${data[i].title}</option>`;
          $('#collection-select').append(option);
        });
      },
      error: function (response) {
        alert(response.responseJSON.message);
      },
    });
  });

  // 폼 제출 이벤트
  $('#addContentForm').submit(function (e) {
    e.preventDefault(); // 기본 제출 동작을 방지

    var formData = new FormData(this); // 폼 데이터를 FormData 객체로 생성

    var selectedOption = $('#collection-select').val();

    $.ajax({
      url: `/collections/${selectedOption}/content/${contentId}`, // 데이터를 전송할 서버의 URL -> 컬렉션 컨텐츠 추가
      type: 'POST',
      data: formData,
      processData: false, // processData와 contentType을 false로 설정하여,
      contentType: false, // FormData 객체를 제대로 전송할 수 있게 함
      success: function (data) {
        alert('컨텐츠가 성공적으로 추가되었습니다.');
      },
      error: function (response) {
        alert(response.responseJSON.message);
      },
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
});
