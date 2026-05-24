// ============================================================
//  testimonios.js — Carga y renderiza los testimonios
//
//  Lee el idioma directamente de la URL (?lang=en) como fuente
//  principal, con fallback a window.currentLang (i18n.js) y
//  finalmente a 'es'. Esto evita problemas de orden de carga.
//
//  Para editar los textos de los testimonios:
//    · Español: testimonios.json
//    · Inglés:  testimonios.en.json
// ============================================================

(function () {

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

  async function renderTestimonios(lang) {
    var file = (lang === 'en') ? 'testimonios.en.json' : 'testimonios.json';
    var tag  = (lang === 'en') ? 'review' : 'opinión';

    var cardStage       = document.getElementById('card-stage');
    var mobileContainer = document.querySelector('.testimonios-mobile');

    // Limpiar contenido anterior (al cambiar idioma)
    if (cardStage)       cardStage.innerHTML       = '';
    if (mobileContainer) mobileContainer.innerHTML = '';

    var allTestimonios;
    try {
      var response = await fetch(file);
      if (!response.ok) throw new Error('HTTP ' + response.status);
      allTestimonios = await response.json();
    } catch (err) {
      console.warn('testimonios.js: no se pudo cargar ' + file, err);
      // Fallback: intentar con el archivo en español
      if (lang !== 'es') {
        try {
          var fallback = await fetch('testimonios.json');
          allTestimonios = await fallback.json();
        } catch (e) {
          console.error('testimonios.js: fallo el fallback también', e);
          return;
        }
      } else {
        return;
      }
    }

    // Mezcla aleatoria y toma los primeros 10
    var selected = allTestimonios.sort(function() { return Math.random() - 0.5; }).slice(0, 10);

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
          '<p class="t-quote">"' + t.quote + '"</p>' +
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
          '<p class="t-quote">"' + quoteText + '"</p>' +
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
