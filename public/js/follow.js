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
