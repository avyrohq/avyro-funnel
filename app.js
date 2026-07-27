// Reloj de cuenta regresiva persistente con localStorage
function startTimer(display) {
  const durationInSeconds = 15 * 60; // 15 minutos en segundos
  let endTime = localStorage.getItem('timerEndTime');

  // Si no existe un tiempo de fin guardado o ya expiró, creamos uno nuevo
  if (!endTime || Date.now() > parseInt(endTime, 10)) {
    endTime = Date.now() + durationInSeconds * 1000;
    localStorage.setItem('timerEndTime', endTime);
  } else {
    endTime = parseInt(endTime, 10);
  }

  function updateTimer() {
    const now = Date.now();
    let remainingTime = Math.floor((endTime - now) / 1000);

    // Si el tiempo terminó, reiniciamos el ciclo de 15 minutos
    if (remainingTime <= 0) {
      endTime = Date.now() + durationInSeconds * 1000;
      localStorage.setItem('timerEndTime', endTime);
      remainingTime = durationInSeconds;
    }

    let minutes = Math.floor(remainingTime / 60);
    let seconds = remainingTime % 60;

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    if (display) {
      display.textContent = minutes + ":" + seconds;
    }
  }

  // Ejecutar inmediatamente y luego cada segundo
  updateTimer();
  setInterval(updateTimer, 1000);
}

window.onload = function () {
  const display = document.querySelector('#countdown');
  if (display) {
    startTimer(display);
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