$(document).ready(function () {
  $('#like-btn').click(function () {
    var url = window.location.href.split('/')[2];
    var contentId = url[url.length - 1];

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
