// Reloj de cuenta regresiva
function startTimer(duration, display) {
  let timer = duration, minutes, seconds;
  setInterval(function () {
      minutes = parseInt(timer / 60, 10);
      seconds = parseInt(timer % 60, 10);

      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;

      if (display) {
        display.textContent = minutes + ":" + seconds;
      }

      if (--timer < 0) {
          timer = duration;
      }
  }, 1000);
}

window.onload = function () {
  let fifteenMinutes = 60 * 15,
      display = document.querySelector('#countdown');
  if(display) {
      startTimer(fifteenMinutes, display);
  }

  // Evento para rastrear el clic al Checkout en Meta Pixel
  const ctaButtons = document.querySelectorAll('a[href*="hotmart.com"]');
  ctaButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      if (typeof fbq !== 'undefined') {
        fbq('track', 'InitiateCheckout');
      }
    });
  });

  // Funcionalidad del Acordeón FAQ
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      item.classList.toggle('active');
    });
  });
};