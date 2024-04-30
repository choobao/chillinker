// 팔로워 리스트 팔로우 버튼
document.addEventListener('DOMContentLoaded', function () {
  const followBtns = document.querySelectorAll('.following_btn');

  followBtns.forEach(function (followBtn) {
    const isFollowing = followBtn.dataset.isFollowing === 'true';
    updateButtonState(followBtn, isFollowing);

    followBtn.addEventListener('click', function () {
      const followId = this.id.split('-')[0];
      const isFollowing = this.dataset.isFollowing === 'true';

      const newState = !isFollowing;
      updateButtonState(followBtn, newState);
      alert('팔로우 상태를 변경하였습니다.');

      $.ajax({
        type: 'Post',
        url: `/users/${followId}/follows/follow`,
        contentType: 'application/json',
        data: JSON.stringify({ isFollowing: newState }),
        success: function (data) {
          localStorage.setItem(`followStatus-${followId}`, newState);
          location.reload(true);
        },
        error: function (response) {
          updateButtonState(followBtn, isFollowing);
          alert(response.responseJSON.message);
        },
      });
    });
  });

  function updateButtonState(button, isFollowing) {
    button.textContent = isFollowing ? '팔로우' : '팔로우';
    button.dataset.isFollowing = isFollowing;
  }

  followBtns.forEach(function (followBtn) {
    const followId = followBtn.id.split('-')[0];
    const storedStatus = localStorage.getItem(`followStatus-${followId}`);
    if (storedStatus !== null) {
      const isFollowing = storedStatus === 'true';
      updateButtonState(followBtn, isFollowing);
    }
  });
});

// 팔로잉 리스트 언팔로잉 버튼
document.addEventListener('DOMContentLoaded', function () {
  const followBtns = document.querySelectorAll('.unfollowing_btn');

  followBtns.forEach(function (followBtn) {
    const isFollowing = followBtn.dataset.isFollowing === 'true';
    updateButtonState(followBtn, isFollowing);

    followBtn.addEventListener('click', function () {
      const followId = this.id.split('-')[0];
      const isFollowing = this.dataset.isFollowing === 'true';

      const newState = !isFollowing;
      updateButtonState(followBtn, newState);
      alert('팔로우 상태를 변경하였습니다.');

      $.ajax({
        type: 'Post',
        url: `/users/${followId}/follows/follow`,
        contentType: 'application/json',
        data: JSON.stringify({ isFollowing: newState }),
        success: function (data) {
          localStorage.setItem(`followStatus-${followId}`, newState);
          location.reload(true);
        },
        error: function (response) {
          updateButtonState(followBtn, isFollowing);
          alert(response.responseJSON.message);
        },
      });
    });
  });

  function updateButtonState(button, isFollowing) {
    button.textContent = isFollowing ? '언팔로잉' : '언팔로잉';
    button.dataset.isFollowing = isFollowing;
  }

  followBtns.forEach(function (followBtn) {
    const followId = followBtn.id.split('-')[0];
    const storedStatus = localStorage.getItem(`followStatus-${followId}`);
    if (storedStatus !== null) {
      const isFollowing = storedStatus === 'true';
      updateButtonState(followBtn, isFollowing);
    }
  });
});

// 팔로워 리스트 무한 스크롤

// $(document).ready(function () {
//   // 사용자가 페이지 하단으로 스크롤했는지 확인
//   function isBottomOfPage() {
//     return $(window).scrollTop() + $(window).height() >= $(document).height();
//   }

//   // 사용자가 페이지 하단에 도달하면 서버에서 데이터 추가 로드
//   function loadMoreData() {
//     $.ajax({
//       url: '/users/:id/follows/followerList', // 데이터 가져올 서버 엔드포인트
//       type: 'GET',
//       success: function (data) {
//         // 기존 컨텐츠에 새 데이터 추가
//         $('.following_list').append(data);
//       },
//       error: function (xhr, status, error) {
//         console.error('Error loading more data:', error);
//       },
//     });
//   }

//   // 스크롤 이벤트 리스너: 사용자가 페이지를 스크롤 할때마다 해당 이벤트 리스너가 트리거
//   $(window).scroll(function () {
//     // 사용자가 페이지 하단으로 스크롤 했는지 확인
//     if (isBottomOfPage()) {
//       // 페이지 하단에 도달하면 추가데이터 로드
//       loadMoreData();
//     }
//   });
// });

// // 팔로잉 리스트 무한스크롤
// $(document).ready(function () {
//   // 사용자가 페이지 하단까지 스크롤했는지 확인하는 함수
//   function isBottomOfPage() {
//     return $(window).scrollTop() + $(window).height() >= $(document).height();
//   }

//   // 서버에서 추가 데이터를 로드하는 함수
//   function loadMoreData() {
//     var url = '/user/following';

//     $.ajax({
//       url: url,
//       type: 'GET',
//       success: function (data) {
//         $('.following_list').append(data);
//       },
//       error: function (xhr, status, error) {
//         console.error('추가 데이터를 로드하는 중 오류가 발생했습니다:', error);
//       },
//     });
//   }

//   // 데이터를 이미 로드 중인지를 추적하는 변수
//   var isLoading = false;

//   // 스크롤 이벤트 리스너
//   $(window).scroll(function () {
//     // 사용자가 페이지 하단에 도달했는지 확인
//     if (isBottomOfPage() && !isLoading) {
//       // 여러 번의 AJAX 요청을 방지하기 위해 isLoading을 true로 설정
//       isLoading = true;

//       // 추가 데이터를 로드
//       loadMoreData();
//     }
//   });

//   // 페이지가 로드될 때 초기 데이터를 로드
//   loadMoreData();
// });
