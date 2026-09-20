document.addEventListener('DOMContentLoaded', () => {
  // URL de tu Google Apps Script (/exec)
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyt6-iTEGKp5AIRK4uV-K5OopdZtp3NpxtbZjKEAl8izmQDgu41H-Wz-WNS3Ls7L3R7/exec';

  // Precios del Taladro por cantidad
  const PRECIOS_MAP = {
    1: 34990,
    2: 64990,
    3: 89990,
    4: 109990
  };

  // Precio de la Galletera en Order Bump
  const PRECIO_GALLETERA = 24990;

  // Listado oficial de comunas de Chile por región
  const COMUNAS_POR_REGION = {
    "Arica y Parinacota": ["Arica", "Camarones", "Putre", "General Lagos"],
    "Tarapacá": ["Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"],
    "Antofagasta": ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal", "Calama", "Ollagüe", "San Pedro de Atacama", "Tocopilla", "María Elena"],
    "Atacama": ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Alto del Carmen", "Freirina", "Huasco"],
    "Coquimbo": ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paiguano", "Vicuña", "Illapel", "Canela", "Los Vilos", "Salamanca", "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"],
    "Valparaíso": ["Valparaíso", "Casablanca", "Concón", "Juan Fernández", "Puchuncaví", "Quintero", "Viña del Mar", "Isla de Pascua", "Los Andes", "Calle Larga", "Rinconada", "San Esteban", "La Ligua", "Cabildo", "Papudo", "Petorca", "Zapallar", "Quillota", "Calera", "Hijuelas", "La Cruz", "Nogales", "San Antonio", "Algarrobo", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo", "San Felipe", "Catemu", "Llaillay", "Panquehue", "Putaendo", "Santa María", "Quilpué", "Limache", "Olmué", "Villa Alemana"],
    "Metropolitana": ["Santiago", "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechurba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Vitacura", "Puente Alto", "Pirque", "San José de Maipo", "Colina", "Lampa", "Tiltil", "San Bernardo", "Buin", "Calera de Tango", "Paine", "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro", "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"],
    "O'Higgins": ["Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras", "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco", "Rengo", "Requínoa", "San Vicente", "Pichilemu", "La Estrella", "Litueche", "Marchihue", "Navidad", "Paredones", "San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo", "Placilla", "Pumanque", "Santa Cruz"],
    "Maule": ["Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael", "Cauquenes", "Chanco", "Pelluhue", "Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén", "Linares", "Colbún", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas"],
    "Ñuble": ["Chillán", "Bulnes", "Cobquecura", "Coelemu", "Coihueco", "Chillán Viejo", "El Carmen", "Ninhue", "Ñiquén", "Pemuco", "Pinto", "Portezuelo", "Quillón", "Quirihue", "Ránquil", "San Carlos", "San Fabián", "San Ignacio", "San Nicolás", "Treguaco", "Yungay"],
    "Biobío": ["Concepción", "Coronel", "Chiguayante", "Florida", "Hualqui", "Lota", "Penco", "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Hualpén", "Lebu", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Los Álamos", "Tirúa", "Los Ángeles", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel", "Alto Biobío"],
    "La Araucanía": ["Temuco", "Carahue", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre Las Casas", "Perquenco", "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Cholchol", "Angol", "Collipulli", "Curacautín", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"],
    "Los Ríos": ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "La Unión", "Futrono", "Lago Ranco", "Río Bueno"],
    "Los Lagos": ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Los Muermos", "Llanquihue", "Maullín", "Puerto Varas", "Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao", "Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo", "Chaitén", "Futaleufú", "Hualaihué", "Palena"],
    "Aysén": ["Coyhaique", "Lago Verde", "Aysén", "Cisnes", "Guaitecas", "Cochrane", "O'Higgins", "Tortel", "Chile Chico", "Río Ibáñez"],
    "Magallanes": ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio", "Cabo de Hornos", "Antártica", "Porvenir", "Primavera", "Timaukel", "Natales", "Torres del Paine"]
  };

  // 1. Selector Dinámico de Comunas según Región
  const regionSelect = document.getElementById('region');
  const comunaSelect = document.getElementById('comuna');

  if (regionSelect && comunaSelect) {
    regionSelect.addEventListener('change', () => {
      const regionElegida = regionSelect.value;
      const comunas = COMUNAS_POR_REGION[regionElegida] || [];

      comunaSelect.innerHTML = '<option value="" disabled selected>Selecciona tu comuna</option>';
      comunas.forEach(comuna => {
        const opt = document.createElement('option');
        opt.value = comuna;
        opt.textContent = comuna;
        comunaSelect.appendChild(opt);
      });

      comunaSelect.disabled = false;
    });
  }

  // 2. Acordeón FAQ[cite: 18]
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

  // 3. Slider Dinámico de Reseñas[cite: 18]
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

  // 4. Autoformateador de Teléfono (9 1234 5678)[cite: 18]
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

  // 5. Actualización dinámica del total según cantidad y Order Bump[cite: 18]
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

    if (summaryProductName) {
      summaryProductName.textContent = `${qty}x Kit Taladro 48V`;
    }

    if (bumpSummaryRow) {
      bumpSummaryRow.style.display = incluyeGalletera ? '' : 'none';
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

  calcularTotales();

  // 6. Envío seguro a Google Sheets y Redirección a Gracias (Cero WhatsApp)
  const orderForm = document.getElementById('orderForm');
  const submitBtn = document.getElementById('submitBtn');

  if (orderForm) {
    orderForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.innerHTML = '<span>Procesando pedido...</span>';
      }

      const { qty, incluyeGalletera, totalPagar } = calcularTotales();

      // Formatear teléfono a 9 dígitos estrictos
      let digitos = (document.getElementById('telefono').value || '').replace(/\D/g, '');
      if (digitos.startsWith('56')) {
        digitos = digitos.substring(2);
      }
      digitos = digitos.substring(0, 9);
      if (digitos.length === 8) {
        digitos = '9' + digitos;
      }

      const telefonoLimpio = '+56' + digitos;
      const calleNumeroVal = (document.getElementById('calle_numero').value || '').trim();
      const referenciaVal = (document.getElementById('referencia').value || '').trim();
      const regionVal = regionSelect ? regionSelect.value : '';
      const comunaVal = comunaSelect ? comunaSelect.value : '';

      // Unificar calle y referencia para que la columna "Dirección" lo contenga todo
      const direccionCompleta = referenciaVal ? `${calleNumeroVal} (${referenciaVal})` : calleNumeroVal;

      const productoFinal = incluyeGalletera 
        ? `${qty}x Taladro 48V + 1x Mini Galletera 12V (Combo)` 
        : `${qty}x Taladro inalámbrico 48v`;

      const formData = {
        fecha: new Date().toLocaleString('es-CL'),
        producto: productoFinal,
        nombre: (document.getElementById('nombre').value || '').trim(),
        telefono: telefonoLimpio,
        cantidad: qty,
        total: totalPagar,
        direccion: direccionCompleta,
        comuna: comunaVal,
        region: regionVal
      };

      // Guardar datos en sessionStorage para que gracias.html muestre el resumen
      sessionStorage.setItem('avyro_last_order', JSON.stringify(formData));

      // Envío robusto: esperamos la confirmación del transporte antes de navegar
      if (APPS_SCRIPT_URL && !APPS_SCRIPT_URL.includes('PEGA_AQUI')) {
        try {
          await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            keepalive: true,
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(formData)
          });
        } catch (errFetch) {
          console.warn('Fetch error:', errFetch);
        }
      }

      // Redirigir una vez completada la emisión de datos
      window.location.href = 'gracias.html';
    });
  }
});