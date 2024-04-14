$(document).ready(function () {
  $('#register-form').submit(function (e) {
    e.preventDefault();

    $.ajax({
      url: '/users/register',
      type: 'POST',
      data: $(this).serialize(),
      success: function (data) {
        window.location.href = '/main';
      },
      error: function (response) {
        alert(response.responseJSON.message);
      },
    });
  });
});
