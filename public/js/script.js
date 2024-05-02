const sliderContainers = document.querySelectorAll('.slider');
const prevButtons = document.querySelectorAll('.prev-button');
const nextButtons = document.querySelectorAll('.next-button');

let currentSlides = [];

sliderContainers.forEach((sliderContainer, index) => {
  const contentsBox = sliderContainer.querySelector('.contents_box');
  const contents = sliderContainer.querySelectorAll('.contents');
  const prevButton = prevButtons[index];
  const nextButton = nextButtons[index];

  currentSlides.push(0);

  const showSlide = (slideIndex) => {
    contents.forEach((content, index) => {
      if (index >= slideIndex && index < slideIndex + 4) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });
  };

  const nextSlide = () => {
    currentSlides[index] += 4;

    const slideGroupCount = Math.ceil(contents.length / 4);

    if (currentSlides[index] + 1 > contents.length) {
      currentSlides[index] = 0;
    }

    contentsBox.style.transform = `translateX(-${currentSlides[index] * 260}px)`;

    showSlide(currentSlides[index]);
  };

  const prevSlide = () => {
    currentSlides[index] -= 4;

    if (currentSlides[index] < 0) {
      currentSlides[index] = contents.length - (contents.length % 4 || 4);
    }

    contentsBox.style.transform = `translateX(-${currentSlides[index] * 260}px)`;

    showSlide(currentSlides[index]);
  };

  prevButton.addEventListener('click', prevSlide);
  nextButton.addEventListener('click', nextSlide);

  showSlide(currentSlides[index]);
});

$(document).ready(function () {
  $(window).scroll(function () {
    if ($(this).scrollTop() > 100) {
      $('#top-btn').fadeIn();
    } else {
      $('#top-btn').fadeOut();
    }
  });

  $('#top-btn').click(function () {
    $('html, body').animate({ scrollTop: 0 }, 800);
    return false;
  });
});

document.querySelector('.prev-button').addEventListener('click', function () {
  const slider = document.querySelector('.slider');
  slider.scrollLeft -= 1080;
});

document.querySelector('.next-button').addEventListener('click', function () {
  const slider = document.querySelector('.slider');
  slider.scrollLeft += 1070;
});
