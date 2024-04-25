$(document).ready(function () {
  $('#register-form').submit(function (e) {
    e.preventDefault();

    var formData = new FormData(this);

    $.ajax({
      url: '/users/register',
      type: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function (data) {
        alert('Welcome to Chillinker!');
        window.location.href = '/users/login';
      },
      error: function (response) {
        alert(response.responseJSON.message);
      },
    });
  });
});
