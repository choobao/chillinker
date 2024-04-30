// 정렬
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

// 무한스크롤

// $(document).ready(function () {
//   // 무한 스크롤 활성화를 위한 함수 호출
//   activateInfiniteScroll();

//   // 무한 스크롤 활성화를 위한 함수
//   function activateInfiniteScroll() {
//     // 사용자가 페이지 하단으로 스크롤했는지 확인하는 함수
//     function isBottomOfPage() {
//       return $(window).scrollTop() + $(window).height() >= $(document).height();
//     }

//     // 사용자가 페이지 하단에 도달하면 서버에서 추가 데이터를 로드하는 함수
//     function loadMoreData() {
//       var url = 'user/likes?userId=' + userId + '&sortType=ADD_DT';
//       $.ajax({
//         url: url,
//         type: 'GET',
//         success: function (data) {
//           $('.contents_container').append(data);
//         },
//         error: function (xhr, status, error) {
//           console.error('데이터 로드 오류:', error);
//         },
//       });
//     }

//     // 스크롤 이벤트 리스너: 사용자가 페이지를 스크롤 할 때마다 트리거됩니다
//     $(window).scroll(function () {
//       // 사용자가 페이지 하단으로 스크롤 했는지 확인
//       if (isBottomOfPage()) {
//         // 페이지 하단에 도달하면 추가 데이터를 로드합니다.
//         loadMoreData();
//       }
//     });
//   }
// });
