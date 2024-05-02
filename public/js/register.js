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
        window.location.href = '/main';
      },
      error: function (response) {
        alert(response.responseJSON.message);
      },
    });
  });
});

document.addEventListener('DOMContentLoaded', function () {
  var fileInput = document.getElementById('profile-register-img-input');
  var previewImg = document.getElementById('preview-img');

  fileInput.addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (!file) {
      return;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
      previewImg.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
});
