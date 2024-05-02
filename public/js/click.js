var searchBtn = document.getElementById('search');
var searchInput = document.getElementById('search-input');

$(document).ready(function () {
  $(searchBtn).click(function () {
    let input = $(searchInput).val();
    window.location.replace('/search?query=' + input);
  });
});

$(document).ready(function () {
  const accessToken = document.cookie
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith('accessToken='))
    .split('=')[1];

  const token = accessToken.replace(/^Bearer%20/, '');

  const base64Payload = token.split('.')[1];
  const decodedPayload = atob(base64Payload);
  const result = JSON.parse(decodedPayload);

  const expirationTime = new Date(result.exp * 1000).getTime();
  const issuedAtTime = new Date(result.iat * 1000).getTime();
  const currentTime = new Date().getTime();

  if (currentTime >= expirationTime) {
    $.ajax({
      type: 'POST',
      url: `/users/refresh`,
      success: function (datas) {
        location.reload(true);
      },
      error: function (response) {
        alert(response.responseJSON.message);
      },
    });
  }
});
