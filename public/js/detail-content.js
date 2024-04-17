$(document).ready(function () {
  $('#like-btn').click(function () {
    var url = window.location.href.split('/');
    var contentId = url[url.length - 1];

    $.ajax({
      url: `/likes/change?contentId=${contentId}`,
      type: 'POST',
      data: $(this).serialize(),
      success: function (data) {
        alert('내 보관함에 추가되었습니다.');
        location.reload(true);
      },
      error: function (response) {
        alert(response.responseJSON.message);
      },
    });
  });
});
