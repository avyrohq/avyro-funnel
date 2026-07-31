// Reloj de cuenta regresiva persistente con localStorage
function startTimer(display) {
  // Configuración inicial: 2 días, 5 horas, 14 minutos y 30 segundos
  const initialDays = 2;
  const initialHours = 5;
  const initialMinutes = 14;
  const initialSeconds = 30;

  // Convertimos la duración total a milisegundos
  const totalDurationMs = (
    (initialDays * 24 * 60 * 60) +
    (initialHours * 3600) +
    (initialMinutes * 60) +
    initialSeconds
  ) * 1000;

  let endTime = localStorage.getItem('timerEndTime');

  // Si no existe una fecha final guardada, o si el tiempo ya venció, creamos una nueva fecha límite desde AHORA
  if (!endTime || Date.now() > parseInt(endTime, 10)) {
    endTime = Date.now() + totalDurationMs;
    localStorage.setItem('timerEndTime', endTime);
  } else {
    endTime = parseInt(endTime, 10);
  }

  function updateTimer() {
    const now = Date.now();
    let remainingTime = Math.floor((endTime - now) / 1000);

    // Si el tiempo expira mientras el usuario está en la página, reinicia el ciclo
    if (remainingTime <= 0) {
      endTime = Date.now() + totalDurationMs;
      localStorage.setItem('timerEndTime', endTime);
      remainingTime = Math.floor(totalDurationMs / 1000);
    }

    let days = Math.floor(remainingTime / (24 * 3600));
    let hours = Math.floor((remainingTime % (24 * 3600)) / 3600);
    let minutes = Math.floor((remainingTime % 3600) / 60);
    let seconds = remainingTime % 60;

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    if (display) {
      display.textContent = `${days}d ${hours}:${minutes}:${seconds}`;
    }
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

// Abrir Modal de Imagen Full con animación
function openModal(imgSrc, title) {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('imgFull');
  const modalTitle = document.getElementById('modalTitle');
  
  modalImg.src = imgSrc;
  modalTitle.textContent = title;
  
  modal.style.display = "block";
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
}

// Cerrar Modal con animación suave
function closeModal() {
  const modal = document.getElementById('imageModal');
  modal.classList.remove('show');
  
  setTimeout(() => {
    modal.style.display = "none";
  }, 300);
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