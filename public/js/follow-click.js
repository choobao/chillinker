$('#profile-follow-col').click(function () {
  var userId = $('#profile-id').text();
  console.log(userId);

  $.ajax({
    url: `/users/${userId}/follows/follow`,
    type: 'POST',
    success: function (data) {
      location.reload(true);
      alert('팔로우 상태를 변경하였습니다.');
    },
    error: function (response) {
      alert(response.responseJSON.message);
    },
  });
});
