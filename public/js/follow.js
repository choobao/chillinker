// 팔로우 버튼 클릭 이벤트

document.addEventListener('DOMContentLoaded', function () {
  console.log('dd');
  const followBtns = document.querySelectorAll('.unfollowing_btn');

  followBtns.forEach(function (followBtn) {
    followBtn.addEventListener('click', function () {
      const index = this.id.split('-')[1];
      const followId = this.id.split('-')[0];
      console.log(index, followId);
    });
  });
});

// $(document).ready(function () {
//   // 팔로잉/언팔로우 버튼 클릭 이벤트 처리
//   $('.unfollowing_btn').on('click', '.unfollowing_btn', function (event) {
//     event.preventDefault(); // 기본 동작 방지

//     // 클릭된 버튼에 대한 정보 가져오기
//     var $button = $(this);
//     var userId = $button.data('id');
//     console.log('유저아이디 봅시다:', userId);
//     var isFollowing = $button.data('is-following');

//     // AJAX 요청을 통해 서버에 팔로잉/언팔로우 요청 보내기
//     $.ajax({
//       url: `/users/${userId}/follows/follow`,
//       type: 'POST',
//       success: function (data) {
//         // 성공적으로 처리된 경우 버튼 상태 업데이트
//         $button.text(isFollowing ? '언팔로우' : '팔로잉');
//         $button.data('is-following', !isFollowing);
//       },
//       error: function (xhr, status, error) {
//         // 에러 처리
//         console.error('팔로잉/언팔로우 요청 실패:', error);
//         // 실패 메시지를 사용자에게 보여줄 수도 있음
//         alert('팔로잉/언팔로우 요청을 처리하는 중에 오류가 발생했습니다.');
//       },
//     });
//   });
// });

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
