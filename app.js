document.addEventListener('DOMContentLoaded', () => {
  // CONFIGURACIÓN:
  // Reemplaza por la URL de tu Google Apps Script (/exec) cuando lo tengas listo
  const APPS_SCRIPT_URL = 'PEGA_AQUI_TU_APPS_SCRIPT_URL'; 
  
  // Tu número de WhatsApp con código de país para la confirmación inmediata
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

  // 2. Manejo y envío del formulario COD
  const orderForm = document.getElementById('orderForm');
  const submitBtn = document.getElementById('submitBtn');

  if (orderForm) {
    orderForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Feedback visual
      submitBtn.classList.add('loading');
      submitBtn.innerHTML = '<span>Agendando despacho...</span>';

      const formData = {
        nombre: document.getElementById('nombre').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        cantidad: document.getElementById('cantidad').value,
        direccion: document.getElementById('direccion').value.trim(),
        comuna: document.getElementById('comuna').value.trim(),
        region: document.getElementById('region').value.trim(),
        producto: 'Taladro 48V (2 Baterías + Maletín)',
        fecha: new Date().toLocaleString('es-CL')
      };

      // Disparar evento de Meta Pixel (Lead / Purchase)
      if (typeof fbq !== 'undefined') {
        fbq('track', 'Lead', {
          content_name: formData.producto,
          value: formData.cantidad === '1' ? 34990 : 64990,
          currency: 'CLP'
        });
      }

      // Envío asíncrono a Google Sheets (Apps Script)
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
        console.warn('Registro local completado:', err);
      }

      // Redirección inmediata a WhatsApp para confirmación directa del cliente
      const mensajeConfirmacion = encodeURIComponent(
        `¡Hola! Acabo de registrar mi pedido en la web.\n\n` +
        `🛠️ *Producto:* ${formData.producto}\n` +
        `📦 *Cantidad:* ${formData.cantidad} unidad(es)\n` +
        `👤 *Nombre:* ${formData.nombre}\n` +
        `📍 *Dirección:* ${formData.direccion}, ${formData.comuna} (${formData.region})\n\n` +
        `Confirmo que pagaré en efectivo/transferencia al repartidor al recibir.`
      );

      window.location.href = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMERO}&text=${mensajeConfirmacion}`;
    });
  }
});