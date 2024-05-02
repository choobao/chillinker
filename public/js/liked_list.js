$(document).ready(function () {
  var currSortType = new URLSearchParams(window.location.search).get(
    'sortType',
  );
  if (currSortType) {
    $('#sort-option').val(currSortType);
  }

  $('#sort-option').change(function () {
    var value = $(this).val();
    window.location.href = `?sortType=${value}`;
  });
});
