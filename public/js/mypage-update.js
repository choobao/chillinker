var modal = document.getElementById('mypage-update');

var btn = document.getElementById('profile-edit-btn');

var span = document.getElementsByClassName('close')[0];

btn.onclick = function () {
  modal.style.display = 'block';
};

span.onclick = function () {
  modal.style.display = 'none';
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = 'none';
    window.onclick = null;
  }
};

$('#profile-follower').click(function () {
  window.location.href = '/user/follower';
});
$('#profile-following').click(function () {
  window.location.href = '/user/following';
});

$('#profile-review').click(function () {
  window.location.href = '/reviewedTitles';
});

$('#profile-like').click(function () {
  window.location.href = '/user/likes';
});

$('#profile-col').click(function () {
  window.location.href = '/collections';
});

$('#profile-bookmark-col').click(function () {
  window.location.href = '/bookmark';
});

var adultVerifyBtn = document.getElementById('adult-verify-btn');

var adultVerifyModal = document.getElementById('adult-verify');

if (adultVerifyBtn && adultVerifyModal) {
  adultVerifyBtn.onclick = function () {
    adultVerifyModal.style.display = 'block';
  };
}

const adultRequestList = document.getElementById('adult-verify-request-list');
if (adultRequestList) {
  $('#adult-verify-request-list').click(function () {
    window.location.href = '/admin/show/adultVerifyRequest';
  });
}

$(document).ready(function () {
  $('.update-close').click(function () {
    $('#mypage-update').hide();
  });

  $('#profile-form').submit(function (e) {
    e.preventDefault();

    var formData = new FormData(this);
    $.ajax({
      url: '/users/mypage/update',
      type: 'PATCH',
      data: formData,
      processData: false,
      contentType: false,
      success: function (data) {
        alert('프로필이 성공적으로 업데이트되었습니다.');
        window.location.href = '/users/mypage';
      },
      error: function (response) {
        alert(response.responseJSON.message);
      },
    });
  });

  if (adultVerifyModal) {
    $('.adult-close').click(function () {
      $('#adult-verify').hide();
    });
    $('#adult-verify-form').submit(function (e) {
      e.preventDefault();

      var formData = new FormData(this);

      $.ajax({
        url: '/users/sendAdultVerify',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
          alert(
            '성인인증 요청이 전송되었습니다. 요청 수락까지 최대 3일이 걸릴 수 있습니다.',
          );
          window.location.href = '/users/mypage';
        },
        error: function (response) {
          alert(response.responseJSON.message);
        },
      });
    });
  }
});

document.addEventListener('DOMContentLoaded', function () {
  var fileInput = document.getElementById('profile-update-img-input');
  var previewImg = document.getElementById('preview-img');

  fileInput.addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (!file) {
      return;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
      previewImg.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
});
