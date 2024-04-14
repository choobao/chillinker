var searchBtn = document.getElementById('search');
var searchInput = document.getElementById('search-input');

$(document).ready(function () {
  $(searchBtn).click(function () {
    let input = $(searchInput).val();
    window.location.replace('/search?query=' + input);
  });
});
