document.addEventListener('DOMContentLoaded', () => {
  // Tu URL de Google Apps Script (/exec)
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzlQoPITzLr6XQejLSXONmCvoC1madPgPT_JZUBLJp6_vvafxDjB-Lt0fkPZRfFZ6uW5Q/exec';
  
  // Tu número de WhatsApp receptor
  const WHATSAPP_NUMERO = '56922241846';

  // Valores base de la oferta
  const PRODUCTO_NOMBRE = '2x Bálsamo hidratante VITALIS';
  const CANTIDAD_FIJA = 2;
  const PRECIO_BASE = 19990;

  function formatoMoneda(valor) {
    return '$' + Number(valor).toLocaleString('es-CL') + ' CLP';
  }

  // ========================================================
  // 1. Cálculo Dinámico de Envío (Suma Garantizada)
  // ========================================================
  const summaryTotalAmount = document.getElementById('summaryTotalAmount');
  const summaryShippingText = document.getElementById('summaryShippingText');

  function recalcularTotal() {
    // Buscar la opción de envío actualmente marcada
    const radioSeleccionado = document.querySelector('input[name="shipping"]:checked');
    
    let costoEnvio = 0;
    if (radioSeleccionado) {
      // Leemos directamente el atributo data-cost o evaluamos por texto
      const costAttr = radioSeleccionado.getAttribute('data-cost');
      costoEnvio = costAttr !== null ? parseInt(costAttr, 10) : (radioSeleccionado.value.includes('990') ? 990 : 0);
    }

    const totalFinal = PRECIO_BASE + costoEnvio;

    // Actualizar el texto del total en pantalla
    if (summaryTotalAmount) {
      summaryTotalAmount.textContent = formatoMoneda(totalFinal);
    }

    // Actualizar el texto del costo de envío en pantalla
    if (summaryShippingText) {
      if (costoEnvio === 0) {
        summaryShippingText.textContent = 'GRATIS';
        summaryShippingText.className = 'text-green-700 font-bold';
      } else {
        summaryShippingText.textContent = '+$990 CLP';
        summaryShippingText.className = 'text-[#b84264] font-bold';
      }
    }

    return { costoEnvio, totalFinal };
  }

  // Escuchar cualquier cambio en los radios de envío a nivel global
  document.addEventListener('change', (e) => {
    if (e.target && e.target.name === 'shipping') {
      recalcularTotal();
    }
  });

  // Ejecución inmediata al cargar la página
  recalcularTotal();

  // ========================================================
  // 2. Autoformateador de Teléfono Chileno (9 1234 5678)
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
  // 3. Envío Asíncrono a Google Sheets y WhatsApp
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

      const { costoEnvio, totalFinal } = recalcularTotal();

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
        cantidad: CANTIDAD_FIJA,
        total: totalFinal,
        direccion: (document.getElementById('direccion').value || '').trim(),
        comuna: (document.getElementById('comuna').value || '').trim(),
        region: regionVal,
        envio: metodoEnvio,
        producto: PRODUCTO_NOMBRE,
        fecha: new Date().toLocaleString('es-CL')
      };

      // Disparo Lead Meta Pixel
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

      // Mensaje estructurado hacia WhatsApp
      const mensajeConfirmacion = encodeURIComponent(
        `¡Hola! Acabo de registrar mi pedido en la web de Coreanas (Avyro).\n\n` +
        `🌸 *Producto:* ${formData.producto}\n` +
        `📦 *Cantidad:* ${formData.cantidad} unidades (Pack Oferta)\n` +
        `🚚 *Método:* ${formData.envio} (${costoEnvio === 0 ? 'Gratis' : '$990'})\n` +
        `💰 *Total a pagar:* ${formatoMoneda(formData.total)}\n` +
        `👤 *Nombre:* ${formData.nombre}\n` +
        `📞 *Teléfono:* ${telefonoWhatsApp}\n` +
        `📍 *Dirección:* ${formData.direccion}, ${formData.comuna} (${formData.region})\n\n` +
        `Confirmo que pagaré al repartidor al recibir en mi domicilio (Efectivo, Tarjeta o Transferencia bancaria).`
      );

      const targetUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMERO}&text=${mensajeConfirmacion}`;

      setTimeout(() => {
        window.location.href = targetUrl;
      }, 250);
    });
  }
});