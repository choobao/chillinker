const sliderContainers = document.querySelectorAll('.slider'); // 모든 슬라이더 요소 선택
const prevButtons = document.querySelectorAll('.prev-button'); // 모든 이전 버튼 선택
const nextButtons = document.querySelectorAll('.next-button'); // 모든 다음 버튼 선택

let currentSlides = []; // 각 슬라이더의 현재 활성화된 카드 그룹 인덱스를 저장하는 배열

// 각 슬라이더에 대한 초기화 및 이벤트 연결
sliderContainers.forEach((sliderContainer, index) => {
  const contentsBox = sliderContainer.querySelector('.contents_box');
  const contents = sliderContainer.querySelectorAll('.contents');
  const prevButton = prevButtons[index];
  const nextButton = nextButtons[index];

  currentSlides.push(0); // 각 슬라이더의 초기 활성화된 카드 그룹 인덱스 설정

  const showSlide = (slideIndex) => {
    contents.forEach((content, index) => {
      // 8개의 카드만 활성화
      if (index >= slideIndex && index < slideIndex + 4) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });
  };

  const nextSlide = () => {
    currentSlides[index] += 4;

    // 카드 그룹 수 계산
    const slideGroupCount = Math.ceil(contents.length / 4);

    if (currentSlides[index] + 4 > contents.length) {
      // 마지막 카드 그룹으로 이동 (loop back)
      // currentSlides[index] = (slideGroupCount - 1) * 4;
      currentSlides[index] = 0;
    }

    contentsBox.style.transform = `translateX(-${currentSlides[index] * 260}px)`;
    // showSlide(currentSlide);
    showSlide(currentSlides[index]);
  };

  const prevSlide = () => {
    currentSlides[index] -= 4;

    if (currentSlides[index] < 0) {
      // 처음 카드 그룹으로 이동 (loop back)
      currentSlides[index] = contents.length - (contents.length % 4 || 4);
    }

    contentsBox.style.transform = `translateX(-${currentSlides[index] * 260}px)`;
    // showSlide(currentSlide);
    showSlide(currentSlides[index]);
  };

  prevButton.addEventListener('click', prevSlide);
  nextButton.addEventListener('click', nextSlide);

  // 각 슬라이더의 첫번째 카드 그룹 활성화
  showSlide(currentSlides[index]);
});
