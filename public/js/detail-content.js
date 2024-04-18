$(document).ready(function () {
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
