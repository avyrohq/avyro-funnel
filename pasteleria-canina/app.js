// Función para inicializar y controlar el reloj de cuenta regresiva
function startTimer(duration, display) {
  let timer = duration, minutes, seconds;
  setInterval(function () {
      minutes = parseInt(timer / 60, 10);
      seconds = parseInt(timer % 60, 10);

      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;

      display.textContent = minutes + ":" + seconds;

      if (--timer < 0) {
          timer = duration; // Si llega a 0, reinicia el ciclo de 15 minutos automáticamente
      }
  }, 1000);
}

// Arranca el proceso apenas se monta la página en el navegador
window.onload = function () {
  let fifteenMinutes = 60 * 15,
      display = document.querySelector('#countdown');
  if(display) {
      startTimer(fifteenMinutes, display);
  }
};