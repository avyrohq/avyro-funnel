document.addEventListener('DOMContentLoaded', () => {
  // Tu URL de Google Apps Script (/exec)
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzlQoPITzLr6XQejLSXONmCvoC1madPgPT_JZUBLJp6_vvafxDjB-Lt0fkPZRfFZ6uW5Q/exec';[cite: 6]
  
  // Tu número de WhatsApp receptor
  const WHATSAPP_NUMERO = '56922241846';[cite: 6]

  // Escala de precios de ofertas
  const PRECIOS_MAP = {
    1: 14990,
    2: 19990,
    3: 29990,
    4: 34990
  };

  // ========================================================
  // 1. Carrusel de Reseñas (Flechas + Dots + Rotación)
  // ========================================================
  const slides = document.querySelectorAll('.review-slide');
  const dots = document.querySelectorAll('.slider-dots .dot');
  const prevBtn = document.getElementById('prevReviewBtn');
  const nextBtn = document.getElementById('nextReviewBtn');
  let currentSlide = 0;
  let autoplayTimer = null;

  function showSlide(index) {
    if (!slides.length) return;

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

  function restartAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 7000);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showSlide(currentSlide - 1);
      restartAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showSlide(currentSlide + 1);
      restartAutoplay();
    });
  }

  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      const targetIndex = parseInt(e.currentTarget.getAttribute('data-index'), 10);
      showSlide(targetIndex);
      restartAutoplay();
    });
  });

  restartAutoplay();

  // ========================================================
  // 2. Autoformateador de Teléfono (+56 9 1234 5678)
  // ========================================================
  const telefonoInput = document.getElementById('telefono');
  if (telefonoInput) {
    telefonoInput.addEventListener('input', (e) => {
      let raw = e.target.value.replace(/\D/g, '');

      if (raw.startsWith('56')) {
        raw = raw.substring(2);
      }

      raw = raw.substring(0, 9);

      if (raw.length === 0) {
        e.target.value = '';
      } else if (raw.length === 1) {
        e.target.value = raw;
      } else if (raw.length <= 5) {
        e.target.value = `${raw[0]} ${raw.substring(1)}`;
      } else {
        e.target.value = `${raw[0]} ${raw.substring(1, 5)} ${raw.substring(5)}`;
      }
    });
  }

  // ========================================================
  // 3. Actualización de Total en Tiempo Real
  // ========================================================
  const cantidadSelect = document.getElementById('cantidad');
  const summaryTotalAmount = document.getElementById('summaryTotalAmount');

  function formatoMoneda(valor) {
    return '$' + Number(valor).toLocaleString('es-CL') + ' CLP';
  }

  function actualizarPrecioEnVivo() {
    if (!cantidadSelect || !summaryTotalAmount) return;
    const qty = parseInt(cantidadSelect.value, 10) || 2;
    const precioFinal = PRECIOS_MAP[qty] || 19990;
    summaryTotalAmount.textContent = formatoMoneda(precioFinal);
  }

  if (cantidadSelect) {
    cantidadSelect.addEventListener('change', actualizarPrecioEnVivo);
    cantidadSelect.addEventListener('input', actualizarPrecioEnVivo);
    actualizarPrecioEnVivo();
  }

  // ========================================================
  // 4. Envío Asíncrono a Google Sheets y WhatsApp
  // ========================================================
  const orderForm = document.getElementById('orderForm');
  const submitBtn = document.getElementById('submitBtn');

  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.innerHTML = '<span>Redirigiendo a WhatsApp...</span>';
      }

      const qty = parseInt(document.getElementById('cantidad').value, 10) || 2;
      const totalPagar = PRECIOS_MAP[qty] || 19990;

      // Limpieza de teléfono
      let digitos = (document.getElementById('telefono').value || '').replace(/\D/g, '');
      if (digitos.startsWith('56')) {
        digitos = digitos.substring(2);
      }
      digitos = digitos.substring(0, 9);
      if (digitos.length === 8) {
        digitos = '9' + digitos;
      }

      const telefonoSheet = "'+56" + digitos;
      const telefonoWhatsApp = "+56" + digitos;

      const regionSelect = document.getElementById('region');
      const regionVal = regionSelect ? regionSelect.value : '';

      const shippingSelected = document.querySelector('input[name="shipping"]:checked');
      const metodoEnvio = shippingSelected ? shippingSelected.value : 'Envío estándar a regiones';

      const formData = {
        nombre: (document.getElementById('nombre').value || '').trim(),
        telefono: telefonoSheet,
        cantidad: qty,
        total: totalPagar,
        direccion: (document.getElementById('direccion').value || '').trim(),
        comuna: (document.getElementById('comuna').value || '').trim(),
        region: regionVal,
        envio: metodoEnvio,
        producto: 'Bálsamo hidratante VITALIS',
        fecha: new Date().toLocaleString('es-CL')
      };

      // Disparar Lead en Meta Pixel
      if (typeof fbq !== 'undefined') {
        try {
          fbq('track', 'Lead', {
            content_name: formData.producto,
            value: formData.total,
            currency: 'CLP'
          });
        } catch (errPixel) {
          console.warn('Pixel error:', errPixel);
        }
      }

      // Envío en segundo plano a Google Sheets
      if (APPS_SCRIPT_URL && !APPS_SCRIPT_URL.includes('PEGA_AQUI')) {[cite: 6]
        try {
          fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          }).catch(errFetch => console.warn('Fetch error:', errFetch));
        } catch (errPost) {
          console.warn('Error post sheets:', errPost);
        }
      }

      // Redirección a WhatsApp
      const mensajeConfirmacion = encodeURIComponent(
        `¡Hola! Acabo de registrar mi pedido en la web de Coreanas (Avyro).\n\n` +
        `🌸 *Producto:* ${formData.producto}\n` +
        `📦 *Cantidad:* ${formData.cantidad} unidad(es)\n` +
        `🚚 *Método:* ${formData.envio}\n` +
        `💰 *Total a pagar:* ${formatoMoneda(formData.total)}\n` +
        `👤 *Nombre:* ${formData.nombre}\n` +
        `📞 *Teléfono:* ${telefonoWhatsApp}\n` +
        `📍 *Dirección:* ${formData.direccion}, ${formData.comuna} (${formData.region})\n\n` +
        `Confirmo que pagaré al repartidor al recibir en mi domicilio (Efectivo, Tarjeta o Transferencia bancaria).`
      );

      const targetUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMERO}&text=${mensajeConfirmacion}`;[cite: 6]

      setTimeout(() => {
        window.location.href = targetUrl;
      }, 250);
    });
  }
});