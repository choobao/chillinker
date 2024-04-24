function gotoBookDetail(book_id, book_isAdult, user_isAdult) {
  console.log(book_id, book_isAdult, user_isAdult);
  console.log(typeof book_id, typeof book_isAdult, typeof user_isAdult);
  if (book_isAdult === '1' && user_isAdult === '0') {
    alert('19세 이상만 이용가능한 작품입니다.');
  } else {
    window.location.href = `/books/${book_id}`;
  }
}
