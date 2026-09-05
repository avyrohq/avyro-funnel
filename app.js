document.addEventListener('DOMContentLoaded', () => {
  // URL de tu Google Apps Script (/exec)
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzlQoPITzLr6XQejLSXONmCvoC1madPgPT_JZUBLJp6_vvafxDjB-Lt0fkPZRfFZ6uW5Q/exec';[cite: 2]
  
  // Tu número de WhatsApp receptor
  const WHATSAPP_NUMERO = '56922241846';[cite: 2]

  // Escala de precios por volumen con descuentos personalizados
  const PRECIOS_MAP = {
    1: 34990,
    2: 64990,
    3: 89990,
    4: 109990
  };[cite: 2]

  // 1. Acordeón FAQ
  const accordionHeaders = document.querySelectorAll('.accordion-header');[cite: 2]
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;[cite: 2]
      const isOpen = item.classList.contains('active');[cite: 2]

      document.querySelectorAll('.accordion-item').forEach(el => el.classList.remove('active'));[cite: 2]

      if (!isOpen) {
        item.classList.add('active');[cite: 2]
      }
    });
  });

  // 2. Slider Dinámico de Reseñas (Atrás / Adelante / Dots)
  const slides = document.querySelectorAll('.review-slide');[cite: 2]
  const dots = document.querySelectorAll('.slider-dots .dot');[cite: 2]
  const prevBtn = document.getElementById('prevReviewBtn');[cite: 2]
  const nextBtn = document.getElementById('nextReviewBtn');[cite: 2]
  let currentSlide = 0;[cite: 2]

  function showSlide(index) {
    if (slides.length === 0) return;[cite: 2]

    if (index >= slides.length) {
      currentSlide = 0;[cite: 2]
    } else if (index < 0) {
      currentSlide = slides.length - 1;[cite: 2]
    } else {
      currentSlide = index;[cite: 2]
    }

    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentSlide);[cite: 2]
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);[cite: 2]
    });
  }

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));[cite: 2]
    nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));[cite: 2]

    dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        const targetIndex = parseInt(e.target.getAttribute('data-index'), 10);[cite: 2]
        showSlide(targetIndex);[cite: 2]
      });
    });

    setInterval(() => {
      showSlide(currentSlide + 1);[cite: 2]
    }, 7000);
  }

  // 3. Autoformateador de Teléfono (el usuario solo anota los 9 dígitos comenzando con 9)
  const telefonoInput = document.getElementById('telefono');
  if (telefonoInput) {
    telefonoInput.addEventListener('input', (e) => {
      let raw = e.target.value.replace(/\D/g, ''); // Deja solo dígitos

      // Remueve el prefijo 56 si el usuario lo pega directamente
      if (raw.startsWith('56')) {
        raw = raw.substring(2);
      }

      // Limita a los 9 dígitos del número móvil chileno
      raw = raw.substring(0, 9);

      // Formato visual en el input: 9 1234 5678
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

  // 4. Actualización dinámica del total según la oferta seleccionada
  const cantidadSelect = document.getElementById('cantidad');[cite: 2]
  const summaryTotalAmount = document.getElementById('summaryTotalAmount');[cite: 2]

  function obtenerTotal(qty) {
    return PRECIOS_MAP[qty] || (qty * 34990);[cite: 2]
  }

  function formatoMoneda(valor) {
    return '$' + valor.toLocaleString('es-CL') + ' CLP';[cite: 2]
  }

  if (cantidadSelect && summaryTotalAmount) {
    cantidadSelect.addEventListener('change', (e) => {
      const qty = parseInt(e.target.value, 10) || 1;[cite: 2]
      summaryTotalAmount.textContent = formatoMoneda(obtenerTotal(qty));[cite: 2]
    });
  }

  // 5. Manejo del Formulario COD
  const orderForm = document.getElementById('orderForm');[cite: 2]
  const submitBtn = document.getElementById('submitBtn');[cite: 2]

  if (orderForm) {
    orderForm.addEventListener('submit', async (e) => {
      e.preventDefault();[cite: 2]

      submitBtn.classList.add('loading');[cite: 2]
      submitBtn.innerHTML = '<span>Agendando despacho...</span>';[cite: 2]

      const qty = parseInt(document.getElementById('cantidad').value, 10) || 1;[cite: 2]
      const totalPagar = obtenerTotal(qty);[cite: 2]

      // Limpiar y asegurar los 9 dígitos
      let digitos = document.getElementById('telefono').value.replace(/\D/g, '');
      if (digitos.startsWith('56')) {
        digitos = digitos.substring(2);
      }
      digitos = digitos.substring(0, 9);

      // Si el usuario olvidó digitar el 9 inicial y solo puso 8 dígitos
      if (digitos.length === 8) {
        digitos = '9' + digitos;
      }

      // Formatos de teléfono limpios:
      // Con comilla simple al inicio para que Google Sheets lo guarde como TEXTO y no genere #ERROR!
      const telefonoSheet = "'+56" + digitos;
      const telefonoWhatsApp = "+56" + digitos;

      const formData = {
        nombre: document.getElementById('nombre').value.trim(),[cite: 2]
        telefono: telefonoSheet,
        cantidad: qty,[cite: 2]
        total: totalPagar,[cite: 2]
        direccion: document.getElementById('direccion').value.trim(),[cite: 2]
        comuna: document.getElementById('comuna').value.trim(),[cite: 2]
        region: document.getElementById('region').value,
        producto: 'Taladro inalámbrico 48v',
        fecha: new Date().toLocaleString('es-CL')[cite: 2]
      };

      // Disparar evento Lead en Meta Pixel
      if (typeof fbq !== 'undefined') {[cite: 2]
        fbq('track', 'Lead', {[cite: 2]
          content_name: formData.producto,[cite: 2]
          value: formData.total,[cite: 2]
          currency: 'CLP'[cite: 2]
        });
      }

      // Envío asíncrono a Google Sheets
      try {
        if (APPS_SCRIPT_URL && !APPS_SCRIPT_URL.includes('PEGA_AQUI')) {[cite: 2]
          await fetch(APPS_SCRIPT_URL, {[cite: 2]
            method: 'POST',[cite: 2]
            mode: 'no-cors',[cite: 2]
            headers: { 'Content-Type': 'application/json' },[cite: 2]
            body: JSON.stringify(formData)[cite: 2]
          });
        }
      } catch (err) {
        console.warn('Registro completado:', err);[cite: 2]
      }

      // Redirección a WhatsApp con confirmación
      const mensajeConfirmacion = encodeURIComponent([cite: 2]
        `¡Hola! Acabo de registrar mi pedido en la web de Avyro.\n\n` +[cite: 2]
        `🛠️ *Producto:* ${formData.producto}\n` +
        `📦 *Cantidad:* ${formData.cantidad} kit(s)\n` +[cite: 2]
        `💰 *Total a pagar:* ${formatoMoneda(formData.total)}\n` +[cite: 2]
        `👤 *Nombre:* ${formData.nombre}\n` +[cite: 2]
        `📞 *Teléfono:* ${telefonoWhatsApp}\n` +
        `📍 *Dirección:* ${formData.direccion}, ${formData.comuna} (${formData.region})\n\n` +[cite: 2]
        `Confirmo que pagaré al repartidor al recibir (Efectivo, Tarjeta o Transferencia).`[cite: 2]
      );

      window.location.href = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMERO}&text=${mensajeConfirmacion}`;[cite: 2]
    });
  }
});