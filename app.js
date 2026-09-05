document.addEventListener('DOMContentLoaded', () => {
  // URL de tu Google Apps Script (/exec)
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzlQoPITzLr6XQejLSXONmCvoC1madPgPT_JZUBLJp6_vvafxDjB-Lt0fkPZRfFZ6uW5Q/exec'; 
  
  // Tu número de WhatsApp receptor
  const WHATSAPP_NUMERO = '56922241846'; 

  // Escala de precios por volumen con descuentos personalizados
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

    setInterval(() => {
      showSlide(currentSlide + 1);
    }, 7000);
  }

  // 3. Autoformateador de Teléfono en el formulario visual (+56 9 1234 5678)
  const telefonoInput = document.getElementById('telefono');
  if (telefonoInput) {
    telefonoInput.addEventListener('input', (e) => {
      let raw = e.target.value.replace(/\D/g, ''); // Deja solo dígitos

      if (raw.startsWith('569')) {
        raw = raw.substring(3);
      } else if (raw.startsWith('56')) {
        raw = raw.substring(2);
      } else if (raw.startsWith('9')) {
        raw = raw.substring(1);
      }

      raw = raw.substring(0, 8);

      if (raw.length === 0) {
        e.target.value = '';
      } else if (raw.length <= 4) {
        e.target.value = `+56 9 ${raw}`;
      } else {
        e.target.value = `+56 9 ${raw.substring(0, 4)} ${raw.substring(4)}`;
      }
    });
  }

  // 4. Actualización dinámica del total según la oferta seleccionada
  const cantidadSelect = document.getElementById('cantidad');
  const summaryTotalAmount = document.getElementById('summaryTotalAmount');

  function obtenerTotal(qty) {
    return PRECIOS_MAP[qty] || (qty * 34990);
  }

  function formatoMoneda(valor) {
    return '$' + valor.toLocaleString('es-CL') + ' CLP';
  }

  if (cantidadSelect && summaryTotalAmount) {
    cantidadSelect.addEventListener('change', (e) => {
      const qty = parseInt(e.target.value, 10) || 1;
      summaryTotalAmount.textContent = formatoMoneda(obtenerTotal(qty));
    });
  }

  // 5. Manejo del Formulario COD
  const orderForm = document.getElementById('orderForm');
  const submitBtn = document.getElementById('submitBtn');

  if (orderForm) {
    orderForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      submitBtn.classList.add('loading');
      submitBtn.innerHTML = '<span>Agendando despacho...</span>';

      const qty = parseInt(document.getElementById('cantidad').value, 10) || 1;
      const totalPagar = obtenerTotal(qty);

      // Extraer solo los 8 dígitos móviles finales
      let digitosMovil = document.getElementById('telefono').value.replace(/\D/g, '');
      if (digitosMovil.startsWith('569')) {
        digitosMovil = digitosMovil.substring(3);
      } else if (digitosMovil.startsWith('56')) {
        digitosMovil = digitosMovil.substring(2);
      } else if (digitosMovil.startsWith('9')) {
        digitosMovil = digitosMovil.substring(1);
      }
      digitosMovil = digitosMovil.substring(0, 8);

      // Formato compacto para evitar error de fórmula en Google Sheets: '+569XXXXXXXX
      const telefonoSheet = "'+569" + digitosMovil;
      const telefonoWhatsApp = "+569" + digitosMovil;

      const formData = {
        nombre: document.getElementById('nombre').value.trim(),
        telefono: telefonoSheet,
        cantidad: qty,
        total: totalPagar,
        direccion: document.getElementById('direccion').value.trim(),
        comuna: document.getElementById('comuna').value.trim(),
        region: document.getElementById('region').value,
        producto: 'Taladro inalámbrico 48v',
        fecha: new Date().toLocaleString('es-CL')
      };

      // Disparar evento Lead en Meta Pixel
      if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
          content_name: formData.producto,
          value: formData.total,
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
        `¡Hola! Acabo de registrar mi pedido en la web de Avyro.\n\n` +
        `🛠️ *Producto:* ${formData.producto}\n` +
        `📦 *Cantidad:* ${formData.cantidad} kit(s)\n` +
        `💰 *Total a pagar:* ${formatoMoneda(formData.total)}\n` +
        `👤 *Nombre:* ${formData.nombre}\n` +
        `📞 *Teléfono:* ${telefonoWhatsApp}\n` +
        `📍 *Dirección:* ${formData.direccion}, ${formData.comuna} (${formData.region})\n\n` +
        `Confirmo que pagaré al repartidor al recibir (Efectivo, Tarjeta o Transferencia).`
      );

      window.location.href = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMERO}&text=${mensajeConfirmacion}`;
    });
  }
});