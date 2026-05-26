// ============================================================
//  testimonios.js — Renderiza los testimonios
//
//  Los datos están inlineados para evitar problemas de fetch
//  (ad blockers, CORS, JSON syntax errors en archivos externos).
//
//  Para editar los testimonios, modificá los arrays
//  TESTIMONIOS_ES y TESTIMONIOS_EN debajo.
// ============================================================

(function () {

  // ✏️ EDITABLE — Testimonios en español
  var TESTIMONIOS_ES = [
    {
      "quote": "Su acompañamiento nos permitió mejorar la propuesta visual y entender mejor cómo transmitir el concepto de la marca. Destaco su escucha activa y paciencia durante todo el proceso.",
      "quoteMobile": "Su acompañamiento nos permitió mejorar la propuesta visual y entender cómo transmitir el concepto de la marca. Destaco su escucha activa y paciencia.",
      "name": "Damián Akerman",
      "role": "Co-founder",
      "brand": "Easy Lunch"
    },
    {
      "quote": "En cada reunión surgieron ideas muy interesantes. Su mirada y sus preguntas nos ayudaron a llegar a un excelente resultado. Gran predisposición para cada detalle.",
      "quoteMobile": "Su mirada y sus preguntas nos ayudaron a llegar a un excelente resultado. Gran predisposición para cada detalle.",
      "name": "Pablo Bronstein",
      "role": "Co-founder",
      "brand": "Easy Lunch"
    },
    {
      "quote": "Logró traducir la esencia de la marca en una experiencia coherente, moderna y cercana. Su enfoque estratégico y empático ayudó a alinear la marca con nuestra cultura y visión.",
      "quoteMobile": "Logró traducir la esencia de la marca en una experiencia coherente, moderna y cercana. Su enfoque ayudó a alinear la marca con nuestra cultura.",
      "name": "Dario Rayitas",
      "role": "Co-founder",
      "brand": "Maldo"
    },
    {
      "quote": "Tiene una forma muy prolija y ordenada de encarar los proyectos. Nos ayudó a entender mejor las necesidades de los usuarios y a bajar todo en soluciones concretas.",
      "quoteMobile": "Tiene una forma muy prolija de encarar los proyectos. Nos ayudó a entender las necesidades de los usuarios y bajar todo en soluciones concretas.",
      "name": "Andres Novoa",
      "role": "Co-founder",
      "brand": "Maldo"
    },
    {
      "quote": "Destaco profundamente la voluntad de Gabi de ayudar para que mi proyecto crezca, tome forma y llegue a las personas. Siempre con muy buena energía y creatividad.",
      "quoteMobile": "Destaco la voluntad de Gabi de ayudar para que mi proyecto crezca y llegue a las personas. Siempre con muy buena energía y creatividad.",
      "name": "Jesi Romero",
      "role": "Tantra · Yoga y bienestar",
      "brand": ""
    },
    {
      "quote": "Con tus preguntas me ayudaste a ordenar y aclarar varias ideas. Algo clave fue lo del rebranding, que ya inicié. Me dejó muy motivado y con más claridad sobre el camino.",
      "quoteMobile": "Con tus preguntas me ayudaste a ordenar ideas. Algo clave fue lo del rebranding, que ya inicié. Me dejó muy motivado.",
      "name": "Santi Soriano",
      "role": "Escultor · Toys maker",
      "brand": ""
    },
    {
      "quote": "La mentoría de Gauf ha sido fundamental para mi crecimiento. Es un comunicador excepcional que combina empatía con una visión sumamente aguda.",
      "quoteMobile": "La mentoría de Gauf fue fundamental para mi crecimiento. Es un comunicador excepcional que combina empatía con una visión sumamente aguda.",
      "name": "Tomás Mika",
      "role": "Músico · Web3",
      "brand": ""
    },
    {
      "quote": "Se destaca por su mirada constructiva y su compromiso con el crecimiento de la escuela, impulsando iniciativas que fortalecen tanto las actividades como el trabajo del equipo docente. Su aporte está atravesado por una actitud positiva y una clara intención de hacer crecer el espacio desde lo creativo y lo humano.",
      "quoteMobile": "Se destaca por su mirada constructiva y su compromiso con el crecimiento de la escuela. Su aporte está atravesado por una actitud positiva y una intención clara de hacer crecer el espacio desde lo creativo y lo humano.",
      "name": "Lucho Barreda",
      "role": "La Chispa · Escuela de Impro",
      "brand": "",
      "background": "#fdfce8"
    },
    {
      "quote": "Gabi fue un gran impulsor de mi trabajo, siendo que fue quien me motivó para darle un marco más profesional. Fue muy gratificante y de gran ayuda para mi carrera el poder contar con su apoyo.",
      "quoteMobile": "Gabi fue un gran impulsor de mi trabajo, motivándome a darle un marco más profesional. Fue muy gratificante contar con su apoyo para mi carrera.",
      "name": "Juan Altamirano",
      "role": "Fotógrafo",
      "brand": "",
      "background": "#e8f8ff"
    },
    {
      "quote": "Gauf nos acompañó en los comienzos de Solow con una entrega genuina y cercana. Aportaba tiempo todas las semanas, sus mentorías y consejos ayudaron a muchísimas personas en la comunidad.",
      "quoteMobile": "Gauf nos acompañó en los comienzos de Solow con una entrega genuina y cercana. Sus mentorías y consejos ayudaron a muchísimas personas en la comunidad.",
      "name": "Tomás Cantatore",
      "role": "Director",
      "brand": "Solow"
    },
    {
      "quote": "Gabriel tiene una forma de transmitir la importancia de cultura y liderazgo de una manera natural. Sencilla y mágica.",
      "quoteMobile": "Gabriel tiene una forma de transmitir la importancia de cultura y liderazgo de una manera natural. Sencilla y mágica.",
      "name": "Laura M. González",
      "role": "Arquitecta",
      "brand": "Founder School"
    },
    {
      "quote": "Un placer trabajar con Gauf. Buenas ideas, excelente conexión y siempre con una sonrisa. Nos dio una gran mano en Ethereum Uruguay!",
      "quoteMobile": "Un placer trabajar con Gauf. Buenas ideas, excelente conexión y siempre con una sonrisa. Nos dio una gran mano en Ethereum Uruguay!",
      "name": "Lucia Cardellino",
      "role": "Co Founder & Community Lead",
      "brand": "Ethereum Uruguay"
    }
  ];

  // ✏️ EDITABLE — Testimonials in English
  var TESTIMONIOS_EN = [
    {
      "quote": "His guidance helped us improve our visual proposal and better understand how to convey the brand concept. I highlight his active listening and patience throughout the entire process.",
      "quoteMobile": "His guidance helped us improve our visual proposal and better understand how to convey the brand concept. I highlight his active listening and patience.",
      "name": "Damián Akerman",
      "role": "Co-founder",
      "brand": "Easy Lunch"
    },
    {
      "quote": "In every meeting, very interesting ideas emerged. His perspective and questions helped us reach an excellent result. Great dedication to every detail.",
      "quoteMobile": "His perspective and questions helped us reach an excellent result. Great dedication to every detail.",
      "name": "Pablo Bronstein",
      "role": "Co-founder",
      "brand": "Easy Lunch"
    },
    {
      "quote": "He managed to translate the essence of the brand into a coherent, modern and approachable experience. His strategic and empathetic approach helped align the brand with our culture and vision.",
      "quoteMobile": "He managed to translate the essence of the brand into a coherent, modern and approachable experience. His approach helped align the brand with our culture.",
      "name": "Dario Rayitas",
      "role": "Co-founder",
      "brand": "Maldo"
    },
    {
      "quote": "He has a very tidy and organized way of approaching projects. He helped us better understand user needs and turn everything into concrete solutions.",
      "quoteMobile": "He has a very organized way of approaching projects. He helped us understand user needs and turn everything into concrete solutions.",
      "name": "Andres Novoa",
      "role": "Co-founder",
      "brand": "Maldo"
    },
    {
      "quote": "I deeply appreciate Gabi's willingness to help my project grow, take shape and reach people. Always with great energy and creativity.",
      "quoteMobile": "I appreciate Gabi's willingness to help my project grow and reach people. Always with great energy and creativity.",
      "name": "Jesi Romero",
      "role": "Tantra · Yoga & Wellness",
      "brand": ""
    },
    {
      "quote": "With your questions you helped me organize and clarify several ideas. Something key was the rebranding suggestion, which I've already started. It left me very motivated and with more clarity about the path ahead.",
      "quoteMobile": "With your questions you helped me organize ideas. Something key was the rebranding suggestion, which I've already started. It left me very motivated.",
      "name": "Santi Soriano",
      "role": "Sculptor · Toys maker",
      "brand": ""
    },
    {
      "quote": "Gauf's mentoring has been fundamental to my growth. He is an exceptional communicator who combines empathy with a remarkably sharp vision.",
      "quoteMobile": "Gauf's mentoring was fundamental to my growth. He is an exceptional communicator who combines empathy with a remarkably sharp vision.",
      "name": "Tomás Mika",
      "role": "Musician · Web3",
      "brand": ""
    },
    {
      "quote": "He stands out for his constructive perspective and commitment to the school's growth, driving initiatives that strengthen both our activities and the teaching team's work. His contribution is infused with a positive attitude and a clear intention to grow the space creatively and humanly.",
      "quoteMobile": "He stands out for his constructive perspective and commitment to the school's growth. His contribution is infused with a positive attitude and a clear intention to grow the space creatively and humanly.",
      "name": "Lucho Barreda",
      "role": "La Chispa · Improv School",
      "brand": "",
      "background": "#fdfce8"
    },
    {
      "quote": "Gabi was a great driver of my work — he was the one who motivated me to give it a more professional framework. Having his support was very rewarding and of great help for my career.",
      "quoteMobile": "Gabi was a great driver of my work, motivating me to give it a more professional framework. Having his support was very rewarding for my career.",
      "name": "Juan Altamirano",
      "role": "Photographer",
      "brand": "",
      "background": "#e8f8ff"
    },
    {
      "quote": "Gauf accompanied us in the early days of Solow with genuine and close dedication. He contributed time every week — his mentoring and advice helped so many people in the community.",
      "quoteMobile": "Gauf accompanied us in the early days of Solow with genuine and close dedication. His mentoring and advice helped so many people in the community.",
      "name": "Tomás Cantatore",
      "role": "Director",
      "brand": "Solow"
    },
    {
      "quote": "Gabriel has a way of conveying the importance of culture and leadership that feels completely natural. Simple and magical.",
      "quoteMobile": "Gabriel has a way of conveying the importance of culture and leadership that feels completely natural. Simple and magical.",
      "name": "Laura M. González",
      "role": "Architect",
      "brand": "Founder School"
    },
    {
      "quote": "A pleasure working with Gauf. Great ideas, excellent connection and always with a smile. He gave us a big hand at Ethereum Uruguay!",
      "quoteMobile": "A pleasure working with Gauf. Great ideas, excellent connection and always with a smile. He gave us a big hand at Ethereum Uruguay!",
      "name": "Lucia Cardellino",
      "role": "Co Founder & Community Lead",
      "brand": "Ethereum Uruguay"
    }
  ];

  // ============================================================
  //  No es necesario editar nada debajo de esta línea
  // ============================================================

  /** Determina el idioma activo de forma independiente */
  function getActiveLang() {
    // 1. Parámetro en la URL — fuente más confiable en el load inicial
    var urlParam = new URLSearchParams(window.location.search).get('lang');
    if (urlParam === 'en' || urlParam === 'es') return urlParam;
    // 2. Lo que i18n.js haya seteado
    if (window.currentLang) return window.currentLang;
    // 3. Idioma del navegador
    var nav = (navigator.language || '').toLowerCase();
    if (nav.startsWith('en')) return 'en';
    // 4. Fallback
    return 'es';
  }

  var positions = [
    { left: 76, top: 10, rotate: 8  },
    { left: 1,  top: 8,  rotate: -6 },
    { left: 52, top: 3,  rotate: 5  },
    { left: 25, top: 2,  rotate: -2 },
    { left: 71, top: 38, rotate: 7  },
    { left: 5,  top: 50, rotate: -8 },
    { left: 36, top: 46, rotate: 3  },
    { left: 48, top: 30, rotate: -4 },
    { left: 14, top: 45, rotate: 6  },
    { left: 62, top: 25, rotate: -5 }
  ];

  var cardColors = [
    '#ffffff', '#f0ffd4', '#fff8ee',
    '#f5f0ff', '#eef8ff', '#fff3f0', '#f0fff8'
  ];

  function renderTestimonios(lang) {
    var allTestimonios = (lang === 'en') ? TESTIMONIOS_EN : TESTIMONIOS_ES;
    var tag            = (lang === 'en') ? 'review' : 'opinión';

    var cardStage       = document.getElementById('card-stage');
    var mobileContainer = document.querySelector('.testimonios-mobile');

    // Limpiar contenido anterior (al cambiar idioma)
    if (cardStage)       cardStage.innerHTML       = '';
    if (mobileContainer) mobileContainer.innerHTML = '';

    // Mezcla aleatoria y toma los primeros 10
    var selected = allTestimonios.slice().sort(function() { return Math.random() - 0.5; }).slice(0, 10);

    // ── Desktop: cards arrastrables ──────────────────────────
    if (cardStage) {
      selected.forEach(function(t, i) {
        var pos  = positions[i];
        var card = document.createElement('div');
        card.className  = 't-card';
        card.style.left = pos.left + '%';
        card.style.top  = pos.top  + '%';
        card.style.transform  = 'rotate(' + pos.rotate + 'deg)';
        card.style.background = t.background || cardColors[i % cardColors.length];

        var roleText = t.brand ? t.role + ' · ' + t.brand : t.role;
        card.innerHTML =
          '<div class="t-tag">' + tag + '</div>' +
          '<p class="t-quote">\u201c' + t.quote + '\u201d</p>' +
          '<div><p class="t-name">' + t.name + '</p><p class="t-role">' + roleText + '</p></div>';
        cardStage.appendChild(card);
      });

      // Drag en desktop
      if (window.innerWidth > 600) {
        var zTop = 10;
        cardStage.querySelectorAll('.t-card').forEach(function(card) {
          var match = card.style.transform.match(/rotate\(([^)]+)deg\)/);
          var rot   = match ? parseFloat(match[1]) : 0;
          var dragging = false, startX, startY, origX, origY;
          card.style.zIndex = ++zTop;

          function startDrag(cx, cy) {
            dragging = true;
            card.classList.add('lifted');
            card.style.zIndex = ++zTop;
            var rect = card.getBoundingClientRect();
            var sr   = cardStage.getBoundingClientRect();
            origX = rect.left - sr.left;
            origY = rect.top  - sr.top;
            startX = cx; startY = cy;
            card.style.left       = origX + 'px';
            card.style.top        = origY + 'px';
            card.style.transform  = 'rotate(' + rot + 'deg)';
            card.style.transition = 'none';
          }
          function moveDrag(cx, cy) {
            if (!dragging) return;
            card.style.left = (origX + cx - startX) + 'px';
            card.style.top  = (origY + cy - startY) + 'px';
          }
          function endDrag() { dragging = false; card.classList.remove('lifted'); }

          card.addEventListener('mousedown',  function(e) { e.preventDefault(); startDrag(e.clientX, e.clientY); });
          card.addEventListener('touchstart', function(e) { startDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
          window.addEventListener('mousemove', function(e) { moveDrag(e.clientX, e.clientY); });
          window.addEventListener('touchmove', function(e) { if (dragging) moveDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
          window.addEventListener('mouseup',  endDrag);
          window.addEventListener('touchend', endDrag);
        });
      }
    }

    // ── Mobile: scroll horizontal ────────────────────────────
    if (mobileContainer) {
      selected.forEach(function(t, i) {
        var card = document.createElement('div');
        card.className  = 't-card';
        card.style.background = t.background || cardColors[i % cardColors.length];

        var roleText  = t.brand ? t.role + ' · ' + t.brand : t.role;
        var quoteText = t.quoteMobile || t.quote;
        card.innerHTML =
          '<div class="t-tag">' + tag + '</div>' +
          '<p class="t-quote">\u201c' + quoteText + '\u201d</p>' +
          '<div><p class="t-name">' + t.name + '</p><p class="t-role">' + roleText + '</p></div>';
        mobileContainer.appendChild(card);
      });
    }
  }

  // Expone la función globalmente para que i18n.js la llame al cambiar idioma
  window.renderTestimonios = renderTestimonios;

  // Inicialización segura: espera al DOM si hace falta
  function init() {
    renderTestimonios(getActiveLang());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
