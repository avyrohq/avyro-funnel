document.addEventListener('DOMContentLoaded', () => {
  // URL de tu Google Apps Script (/exec)
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzlQoPITzLr6XQejLSXONmCvoC1madPgPT_JZUBLJp6_vvafxDjB-Lt0fkPZRfFZ6uW5Q/exec';
  
  // Tu número de WhatsApp receptor
  const WHATSAPP_NUMERO = '56922241846';

  // Precios del Taladro por cantidad
  const PRECIOS_MAP = {
    1: 34990,
    2: 64990,
    3: 89990,
    4: 109990
  };

  // Precio de la Galletera en Order Bump
  const PRECIO_GALLETERA = 24990;

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

  // 2. Slider Dinámico de Reseñas
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

  // 3. Autoformateador de Teléfono (9 1234 5678)
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

  // 4. Actualización dinámica del total según cantidad y Order Bump
  const cantidadSelect = document.getElementById('cantidad');
  const addGalleteraCheckbox = document.getElementById('addGalletera');
  const summaryProductName = document.getElementById('summaryProductName');
  const bumpSummaryRow = document.getElementById('bumpSummaryRow');
  const summaryTotalAmount = document.getElementById('summaryTotalAmount');
  const submitBtnText = document.getElementById('submitBtnText');
  const orderBumpContainer = document.getElementById('orderBumpContainer');

  function formatoMoneda(valor) {
    return '$' + Number(valor).toLocaleString('es-CL') + ' CLP';
  }

  function calcularTotales() {
    const qty = parseInt(cantidadSelect.value, 10) || 1;
    const precioBaseTaladro = PRECIOS_MAP[qty] || (qty * 34990);
    const incluyeGalletera = addGalleteraCheckbox ? addGalleteraCheckbox.checked : false;

    let totalPagar = precioBaseTaladro;
    if (incluyeGalletera) {
      totalPagar += PRECIO_GALLETERA;
    }

    // Actualizar Resumen en Formulario
    if (summaryProductName) {
      summaryProductName.textContent = `${qty}x Kit Taladro 48V`;
    }

    if (bumpSummaryRow) {
      bumpSummaryRow.style.display = incluyeGalletera ? 'flex' : 'none';
    }

    if (summaryTotalAmount) {
      summaryTotalAmount.textContent = formatoMoneda(totalPagar);
    }

    if (orderBumpContainer) {
      orderBumpContainer.classList.toggle('active', incluyeGalletera);
    }

    if (submitBtnText) {
      if (incluyeGalletera) {
        submitBtnText.textContent = `CONFIRMAR TALADRO + GALLETERA (${formatoMoneda(totalPagar)})`;
      } else {
        submitBtnText.textContent = 'CONFIRMAR PEDIDO Y PAGAR AL RECIBIR';
      }
    }

    return { qty, incluyeGalletera, totalPagar };
  }

  if (cantidadSelect) {
    cantidadSelect.addEventListener('change', calcularTotales);
  }

  if (addGalleteraCheckbox) {
    addGalleteraCheckbox.addEventListener('change', calcularTotales);
  }

  // Ejecución inicial
  calcularTotales();

  // 5. Manejo del Formulario COD y Redirección a WhatsApp
  const orderForm = document.getElementById('orderForm');
  const submitBtn = document.getElementById('submitBtn');

  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.innerHTML = '<span>Redirigiendo a WhatsApp...</span>';
      }

      const { qty, incluyeGalletera, totalPagar } = calcularTotales();

      // Limpiar dígitos de teléfono
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

      // Descripción limpia para Google Sheets
      const productoFinal = incluyeGalletera 
        ? `${qty}x Taladro 48V + 1x Mini Galletera 12V (Combo)` 
        : `${qty}x Taladro inalámbrico 48v`;

      const formData = {
        nombre: (document.getElementById('nombre').value || '').trim(),
        telefono: telefonoSheet,
        cantidad: qty,
        galletera: incluyeGalletera ? 'SÍ (+1 Galletera 12V)' : 'NO',
        total: totalPagar,
        direccion: (document.getElementById('direccion').value || '').trim(),
        comuna: (document.getElementById('comuna').value || '').trim(),
        region: regionVal,
        producto: productoFinal,
        fecha: new Date().toLocaleString('es-CL')
      };

      // Disparar evento Lead en Meta Pixel
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
          console.warn('Error post sheets:', errPost);
        }
      }

      // Preparación del mensaje de WhatsApp
      let detalleProductos = `🛠️ *Producto Principal:* ${qty}x Kit Taladro Inalámbrico 48V\n`;
      if (incluyeGalletera) {
        detalleProductos += `⚡ *Complemento Agregado:* 1x Mini Galletera Inalámbrica 12V Brushless (+$24.990)\n`;
      }

      const mensajeConfirmacion = encodeURIComponent(
        `¡Hola! Acabo de registrar mi pedido en la web de Avyro.\n\n` +
        detalleProductos +
        `💰 *Total a pagar al recibir:* ${formatoMoneda(formData.total)}\n` +
        `👤 *Nombre:* ${formData.nombre}\n` +
        `📞 *Teléfono:* ${telefonoWhatsApp}\n` +
        `📍 *Dirección:* ${formData.direccion}, ${formData.comuna} (${formData.region})\n\n` +
        `Confirmo que pagaré al repartidor al recibir el paquete (Efectivo, Tarjeta o Transferencia).`
      );

      const targetUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMERO}&text=${mensajeConfirmacion}`;

      setTimeout(() => {
        window.location.href = targetUrl;
      }, 250);
    });
  }
});