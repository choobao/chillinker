$(document).ready(function () {
  $('#register-form').submit(function (e) {
    e.preventDefault();

    var formData = new FormData(this);

    $.ajax({
      url: '/users/register',
      type: 'POST',
      data: formData,
      processData: false,
      success: function (data) {
        alert('Welcome to Chillinker!');
        window.location.href = '/main';
      },
      error: function (response) {
        alert(response.responseJSON.message);
      },
    });
  });
});
