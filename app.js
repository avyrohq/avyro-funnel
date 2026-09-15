document.addEventListener('DOMContentLoaded', () => {
  // Tu URL de Google Apps Script (/exec)
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzlQoPITzLr6XQejLSXONmCvoC1madPgPT_JZUBLJp6_vvafxDjB-Lt0fkPZRfFZ6uW5Q/exec';
  
  // Tu número de WhatsApp receptor
  const WHATSAPP_NUMERO = '56922241846';

  // Escala de precios para el Bálsamo
  const PRECIOS_MAP = {
    1: 12990,
    2: 19990,
    3: 26990
  };

  // 1. Autoformateador de Teléfono Chileno (9 1234 5678)
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

  // 2. Actualización dinámica del total según la oferta seleccionada
  const cantidadSelect = document.getElementById('cantidad');
  const summaryTotalAmount = document.getElementById('summaryTotalAmount');

  function formatoMoneda(valor) {
    return '$' + valor.toLocaleString('es-CL') + ' CLP';
  }

  if (cantidadSelect && summaryTotalAmount) {
    cantidadSelect.addEventListener('change', (e) => {
      const qty = parseInt(e.target.value, 10) || 2;
      const total = PRECIOS_MAP[qty] || 19990;
      summaryTotalAmount.textContent = formatoMoneda(total);
    });
  }

  // 3. Manejo del Formulario COD con envío a Sheet y redirección a WhatsApp
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
        producto: 'Bálsamo hidratante VITALIS',
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
          console.warn('Pixel error:', errPixel);
        }
      }

      // Envío asíncrono a Google Sheets en segundo plano
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
        `📦 *Cantidad:* ${formData.cantidad} unidad(es)\n` +
        `🚚 *Método:* ${formData.envio}\n` +
        `💰 *Total a pagar:* ${formatoMoneda(formData.total)}\n` +
        `👤 *Nombre:* ${formData.nombre}\n` +
        `📞 *Teléfono:* ${telefonoWhatsApp}\n` +
        `📍 *Dirección:* ${formData.direccion}, ${formData.comuna} (${formData.region})\n\n` +
        `Confirmo que pagaré al repartidor al recibir en mi domicilio (Efectivo, Tarjeta o Transferencia).`
      );

      const targetUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMERO}&text=${mensajeConfirmacion}`;

      setTimeout(() => {
        window.location.href = targetUrl;
      }, 250);
    });
  }
});