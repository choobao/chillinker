$('#profile-follow-col').click(function () {
  var userId = $('#profile-id').text();
  console.log(userId);

  $.ajax({
    url: `/users/${userId}/follows/follow`,
    type: 'POST',
    success: function (data) {
      location.reload(true);
    },
    error: function (response) {
      alert(response.responseJSON.message);
    },
  });
});
