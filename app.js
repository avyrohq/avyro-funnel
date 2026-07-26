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

  // Evento para rastrear el clic al Checkout
  const ctaBtn = document.getElementById('btn-checkout');
  if(ctaBtn) {
    ctaBtn.addEventListener('click', function() {
      if (typeof fbq !== 'undefined') {
        fbq('track', 'InitiateCheckout');
      }
    });
  }
};