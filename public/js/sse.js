var modal1 = document.getElementById('alarm-modal');

var btn1 = document.getElementById('profile-alarm-col');

var span1 = document.getElementsByClassName('close')[1];

btn1.onclick = function () {
  modal1.style.display = 'block';
};

span1.onclick = function () {
  modal1.style.display = 'none';
};

window.onclick = function (event) {
  if (event.target == modal1) {
    modal1.style.display = 'none';
    window.onclick = null;
  }
};

$(document).ready(function () {
  $('#profile-alarm-col').click(function () {
    var userId = $('#userId').text();

    const eventSource = new EventSource(`http://localhost:3000/sse/${userId}`);

    eventSource.onmessage = (event) => {
      console.log('그냥 보내기');
      const data = JSON.parse(event.data);
      console.log('Received data:', data);
    };

    // SSE 연결이 열렸을 때
    eventSource.onopen = () => {
      console.log('SSE connection opened');
    };

    // SSE 연결이 닫혔을 때
    eventSource.onclose = () => {
      console.log('SSE connection closed');
    };

    // SSE 연결 에러가 발생했을 때
    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
    };

    // $.ajax({
    //   url: `/sse/${userId}`,
    //   type: 'GET',
    //   success: function () {
    //     // SSE 이벤트 수신
    //     eventSource.onmessage = (event) => {
    //       const data = JSON.parse(event.data);
    //       console.log('Received data:', data);
    //     };

    //     // SSE 연결이 열렸을 때
    //     eventSource.onopen = () => {
    //       console.log('SSE connection opened');
    //     };

    //     // SSE 연결이 닫혔을 때
    //     eventSource.onclose = () => {
    //       console.log('SSE connection closed');
    //     };

    //     // SSE 연결 에러가 발생했을 때
    //     eventSource.onerror = (error) => {
    //       console.error('SSE connection error:', error);
    //     };
    //   },
    //   error: function (response) {
    //     alert(response.responseJSON.message);
    //   },
    // });
  });
});
