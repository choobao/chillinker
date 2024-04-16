$('#sort-option').change(function () {
  var value = $(this).val();
  window.location.href = `?sortType=${value}`;
});
