const images = [
    "images/s1.png",
    "images/s2.png",
    "images/s3.png"
  ];

  let currentImageIndex = 0;

  function showImage() {
    const wrapper = document.querySelector(".image-wrapper");
    wrapper.innerHTML = `<img src="${images[currentImageIndex]}" alt="Mood Image" class="mood-img">`;
  }

  function changeImage(direction) {
    currentImageIndex = (currentImageIndex + direction + images.length) % images.length;
    showImage();
  }

  // Show the first image on page load
  window.onload = showImage;