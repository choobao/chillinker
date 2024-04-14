const searchBtn = document.querySelector(
  'body > header > div > div > div > form > i',
);
const searchInput = document.querySelector('#search-input');

$(document).ready(function () {
  $(searchBtn).click(function () {
    let input = $(searchInput).val();
    window.location.replace('/search?query=' + input);
  });
});
