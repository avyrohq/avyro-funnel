document.addEventListener('DOMContentLoaded', () => {
  // Reemplaza por la URL de tu Google Apps Script (/exec) cuando despliegues el backend
  const APPS_SCRIPT_URL = 'PEGA_AQUI_TU_APPS_SCRIPT_URL'; 
  
  // Tu número de WhatsApp con código de país (+56 9...)
  const WHATSAPP_NUMERO = '569XXXXXXXX'; 

  // 1. Acordeón FAQ
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isOpen = item.classList.contains('active');

      document.querySelectorAll('.accordion-item').forEach(el => el.classList.remove('active'));

      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });

  // 2. Slider Dinámico de Reseñas (Atrás / Adelante / Dots)
  const slides = document.querySelectorAll('.review-slide');
  const dots = document.querySelectorAll('.slider-dots .dot');
  const prevBtn = document.getElementById('prevReviewBtn');
  const nextBtn = document.getElementById('nextReviewBtn');
  let currentSlide = 0;

  function showSlide(index) {
    if (slides.length === 0) return;

    if (index >= slides.length) {
      currentSlide = 0;
    } else if (index < 0) {
      currentSlide = slides.length - 1;
    } else {
      currentSlide = index;
    }

    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentSlide);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
    nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));

    dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        const targetIndex = parseInt(e.target.getAttribute('data-index'), 10);
        showSlide(targetIndex);
      });
    });

    // Avance automático suave cada 7 segundos
    setInterval(() => {
      showSlide(currentSlide + 1);
    }, 7000);
  }

  // 3. Manejo del Formulario COD
  const orderForm = document.getElementById('orderForm');
  const submitBtn = document.getElementById('submitBtn');

  if (orderForm) {
    orderForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      submitBtn.classList.add('loading');
      submitBtn.innerHTML = '<span>Agendando despacho...</span>';

      const formData = {
        nombre: document.getElementById('nombre').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        cantidad: document.getElementById('cantidad').value,
        direccion: document.getElementById('direccion').value.trim(),
        comuna: document.getElementById('comuna').value.trim(),
        region: document.getElementById('region').value.trim(),
        producto: 'Taladro 48V 25Nm (2 Baterías + Maletín)',
        fecha: new Date().toLocaleString('es-CL')
      };

      // Disparar evento de Meta Pixel
      if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
          content_name: formData.producto,
          value: formData.cantidad === '1' ? 34990 : 64990,
          currency: 'CLP'
        });
      }

      // Envío asíncrono a Google Sheets
      try {
        if (APPS_SCRIPT_URL && !APPS_SCRIPT_URL.includes('PEGA_AQUI')) {
          await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
        }
      } catch (err) {
        console.warn('Registro completado:', err);
      }

      // Redirección a WhatsApp con confirmación
      const mensajeConfirmacion = encodeURIComponent(
        `¡Hola! Acabo de registrar mi pedido en la web.\n\n` +
        `🛠️ *Producto:* ${formData.producto}\n` +
        `📦 *Cantidad:* ${formData.cantidad} unidad(es)\n` +
        `👤 *Nombre:* ${formData.nombre}\n` +
        `📍 *Dirección:* ${formData.direccion}, ${formData.comuna} (${formData.region})\n\n` +
        `Confirmo que pagaré al repartidor al recibir (Efectivo, Tarjeta o Transferencia).`
      );

      window.location.href = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMERO}&text=${mensajeConfirmacion}`;
    });
  }
});