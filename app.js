document.addEventListener('DOMContentLoaded', () => {
  // Rastrear InitiateCheckout en Meta Pixel para todos los enlaces a Hotmart
  const ctaButtons = document.querySelectorAll('a[href*="hotmart.com"]');
  ctaButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (typeof fbq !== 'undefined') {
        fbq('track', 'InitiateCheckout');
      }
    });
  });

  // Acordeón FAQ
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isOpen = item.classList.contains('active');

      // Cerrar otros elementos abiertos para una navegación limpia en mobile
      document.querySelectorAll('.accordion-item').forEach(el => el.classList.remove('active'));

      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });
});