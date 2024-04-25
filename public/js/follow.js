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

// 무한 스크롤 -> 동작은 하는거 확인 일단 팔로잉 버튼 끝나면 다시 보기

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

// js만 쓴 로직(안돌아감..)

// let page = 1; // 초기 페이지 번호
// let isLoading = false; // 데이터를 로드 중인지 여부를 나타내는 변수

// // 스크롤 이벤트 감지
// window.addEventListener('scroll', () => {
//   // 문서의 높이와 스크롤 위치를 이용하여 페이지 하단 도달 여부 확인
//   if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
//     loadMoreData();
//   }
// });

// // 추가 데이터를 로드하는 함수
// function loadMoreData() {
//   // 데이터를 이미 로드 중인 경우 더 이상의 요청을 방지하기 위해 isLoading 변수를 확인
//   if (!isLoading) {
//     isLoading = true; // 데이터 로딩 시작

//     // 서버로 요청을 보내는 fetch 함수를 이용하여 데이터를 가져옴
//     fetch(`/api/followers?page=${page}`)
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error('Network response was not ok');
//         }
//         return response.json();
//       })
//       .then((data) => {
//         appendData(data); // 받은 데이터를 추가
//         page++; // 페이지 번호 증가
//         isLoading = false; // 데이터 로딩 종료
//       })
//       .catch((error) => {
//         console.error('Error fetching data:', error);
//         isLoading = false; // 데이터 로딩 종료
//       });
//   }
// }

// // 받은 데이터를 화면에 추가하는 함수
// function appendData(data) {
//   const list = document.querySelector('.following_list');
//   data.forEach((follower) => {
//     const li = document.createElement('li');
//     li.innerHTML = `
//                     <a class="profile_link" href="#">
//                         <img src="/profile_sample.png" alt="profile image">
//                         <span class="name">${follower.followers_nickname}</span>
//                         <span class="intro">${follower.followers_email}</span>
//                     </a>
//                     ${follower.isFollowing ? '<a class="unfollowing_btn" href="#">언팔로우</a>' : '<a class="unfollowing_btn" href="#">팔로잉</a>'}
//                 `;
//     list.appendChild(li);
//   });
// }
