document.getElementById('order-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Evita que la página se recargue
  
    // Capturamos los datos que escribió el cliente
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const city = document.getElementById('city').value;
  
    // Tu número de WhatsApp de ventas (cámbialo por el tuyo en formato internacional, sin el signo +)
    // Ejemplo para Chile: 56912345678
    const whatsappNumber = "569XXXXXXXX"; 
  
    // Construimos el mensaje de pedido que llegará a tu WhatsApp
    const message = `✨ *NUEVO PEDIDO AVYRO* ✨\n\n` +
                    `👤 *Nombre:* ${name}\n` +
                    `📞 *Teléfono:* ${phone}\n` +
                    `📍 *Ciudad/Región:* ${city}\n\n` +
                    `💵 *Método:* Pago al Recibir (COD)`;
  
    // Codificamos el mensaje para que sea válido en un link
    const encodedMessage = encodeURIComponent(message);
  
    // Redireccionamos a WhatsApp Web o App
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  });