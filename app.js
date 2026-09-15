document.addEventListener('DOMContentLoaded', () => {
  // URL de tu Google Apps Script (/exec)
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzlQoPITzLr6XQejLSXONmCvoC1madPgPT_JZUBLJp6_vvafxDjB-Lt0fkPZRfFZ6uW5Q/exec';
  
  // Tu número de WhatsApp receptor
  const WHATSAPP_NUMERO = '56922241846';

  // Escala de precios por volumen
  const PRECIOS_MAP = {
    1: 34990,
    2: 64990,
    3: 89990,
    4: 109990
  };

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

  // 2. Slider de Reseñas
  const slides = document.querySelectorAll('.review-card');
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

    setInterval(() => {
      showSlide(currentSlide + 1);
    }, 7000);
  }

  // 3. Autoformateador de Teléfono Chileno (9 1234 5678)
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

  // 4. Actualización dinámica del total según cantidad
  const cantidadSelect = document.getElementById('cantidad');
  const summaryTotalAmount = document.getElementById('summaryTotalAmount');
  const offerPriceHighlight = document.getElementById('offerPriceHighlight');

  function obtenerTotal(qty) {
    return PRECIOS_MAP[qty] || (qty * 34990);
  }

  function formatoMoneda(valor) {
    return '$' + valor.toLocaleString('es-CL') + ' CLP';
  }

  if (cantidadSelect && summaryTotalAmount) {
    cantidadSelect.addEventListener('change', (e) => {
      const qty = parseInt(e.target.value, 10) || 1;
      const total = obtenerTotal(qty);
      summaryTotalAmount.textContent = formatoMoneda(total);
      if (offerPriceHighlight) {
        offerPriceHighlight.textContent = '$' + total.toLocaleString('es-CL');
      }
    });
  }

  // 5. Envío y Redirección a WhatsApp
  const orderForm = document.getElementById('orderForm');
  const submitBtn = document.getElementById('submitBtn');

  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.innerHTML = '<span>Redirigiendo a WhatsApp...</span>';
      }

      const qty = parseInt(document.getElementById('cantidad').value, 10) || 1;
      const totalPagar = obtenerTotal(qty);

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

      const shippingSelected = document.querySelector('input[name="shipping_type"]:checked');
      const metodoEnvio = shippingSelected ? shippingSelected.value : 'Envío estándar';

      const formData = {
        nombre: (document.getElementById('nombre').value || '').trim(),
        telefono: telefonoSheet,
        cantidad: qty,
        total: totalPagar,
        direccion: (document.getElementById('direccion').value || '').trim(),
        comuna: (document.getElementById('comuna').value || '').trim(),
        region: regionVal,
        envio: metodoEnvio,
        producto: 'Taladro inalámbrico 48v',
        fecha: new Date().toLocaleString('es-CL')
      };

      // Disparo de evento Lead en Meta Pixel
      if (typeof fbq !== 'undefined') {
        try {
          fbq('track', 'Lead', {
            content_name: formData.producto,
            value: formData.total,
            currency: 'CLP'
          });
        } catch (errPixel) {
          console.warn('Pixel err:', errPixel);
        }
      }

      // Envío asíncrono a Google Sheets
      if (APPS_SCRIPT_URL && !APPS_SCRIPT_URL.includes('PEGA_AQUI')) {
        try {
          fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          }).catch(errFetch => console.warn('Fetch error:', errFetch));
        } catch (errPost) {
          console.warn('Error sheets:', errPost);
        }
      }

      // Enlace pre-armado hacia WhatsApp
      const mensajeConfirmacion = encodeURIComponent(
        `¡Hola! Acabo de registrar mi pedido en la web de Avyro.\n\n` +
        `🛠️ *Producto:* ${formData.producto}\n` +
        `📦 *Cantidad:* ${formData.cantidad} kit(s)\n` +
        `🚚 *Método:* ${formData.envio}\n` +
        `💰 *Total a pagar:* ${formatoMoneda(formData.total)}\n` +
        `👤 *Nombre:* ${formData.nombre}\n` +
        `📞 *Teléfono:* ${telefonoWhatsApp}\n` +
        `📍 *Dirección:* ${formData.direccion}, ${formData.comuna} (${formData.region})\n\n` +
        `Confirmo que pagaré al repartidor al recibir (Efectivo, Tarjeta o Transferencia).`
      );

      const targetUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMERO}&text=${mensajeConfirmacion}`;

      setTimeout(() => {
        window.location.href = targetUrl;
      }, 250);
    });
  }
});