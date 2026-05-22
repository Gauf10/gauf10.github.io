// ============================================================
//  testimonios.js — Carga y renderiza los testimonios
//
//  El idioma lo lee de window.currentLang (seteado por i18n.js).
//  Para editar los textos de los testimonios:
//    · Español: testimonios.json
//    · Inglés:  testimonios.en.json
// ============================================================

(function () {

  const positions = [
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

  const cardColors = [
    '#ffffff', '#f0ffd4', '#fff8ee',
    '#f5f0ff', '#eef8ff', '#fff3f0', '#f0fff8'
  ];

  async function renderTestimonios(lang) {
    // Elige el archivo según el idioma
    const file = (lang === 'en') ? 'testimonios.en.json' : 'testimonios.json';

    // Obtiene la etiqueta "opinión" / "review" del sistema de i18n
    const tag = (window.TRANSLATIONS && window.TRANSLATIONS[lang])
      ? (window.TRANSLATIONS[lang]['testimonios.tag'] || 'opinión')
      : (lang === 'en' ? 'review' : 'opinión');

    try {
      const response = await fetch(file);
      const allTestimonios = await response.json();

      // Mezcla aleatoria y toma los primeros 10
      const selected = allTestimonios.sort(() => Math.random() - 0.5).slice(0, 10);

      // ── Desktop: cards arrastrables ──────────────────────────
      const cardStage = document.getElementById('card-stage');
      if (cardStage) {
        cardStage.innerHTML = '';
        selected.forEach((t, i) => {
          const pos  = positions[i];
          const card = document.createElement('div');
          card.className  = 't-card';
          card.style.left = `${pos.left}%`;
          card.style.top  = `${pos.top}%`;
          card.style.transform = `rotate(${pos.rotate}deg)`;
          card.style.background = t.background || cardColors[i % cardColors.length];

          const roleText = t.brand ? `${t.role} · ${t.brand}` : t.role;
          card.innerHTML = `
            <div class="t-tag">${tag}</div>
            <p class="t-quote">"${t.quote}"</p>
            <div><p class="t-name">${t.name}</p><p class="t-role">${roleText}</p></div>
          `;
          cardStage.appendChild(card);
        });

        // Reinicia el drag en los nuevos cards (desktop)
        if (window.innerWidth > 600) {
          let zTop = 10;
          cardStage.querySelectorAll('.t-card').forEach(card => {
            const match = card.style.transform.match(/rotate\(([^)]+)deg\)/);
            const rot = match ? parseFloat(match[1]) : 0;
            let dragging = false, startX, startY, origX, origY;
            card.style.zIndex = ++zTop;

            function startDrag(cx, cy) {
              dragging = true; card.classList.add('lifted'); card.style.zIndex = ++zTop;
              const rect = card.getBoundingClientRect(), sr = cardStage.getBoundingClientRect();
              origX = rect.left - sr.left; origY = rect.top - sr.top;
              startX = cx; startY = cy;
              card.style.left = origX + 'px'; card.style.top = origY + 'px';
              card.style.transform = `rotate(${rot}deg)`; card.style.transition = 'none';
            }
            function moveDrag(cx, cy) {
              if (!dragging) return;
              card.style.left = (origX + cx - startX) + 'px';
              card.style.top  = (origY + cy - startY) + 'px';
            }
            function endDrag() { dragging = false; card.classList.remove('lifted'); }

            card.addEventListener('mousedown',  e => { e.preventDefault(); startDrag(e.clientX, e.clientY); });
            card.addEventListener('touchstart', e => startDrag(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
            window.addEventListener('mousemove', e => moveDrag(e.clientX, e.clientY));
            window.addEventListener('touchmove', e => { if (dragging) moveDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
            window.addEventListener('mouseup',   endDrag);
            window.addEventListener('touchend',  endDrag);
          });
        }
      }

      // ── Mobile: scroll horizontal ────────────────────────────
      const mobileContainer = document.querySelector('.testimonios-mobile');
      if (mobileContainer) {
        mobileContainer.innerHTML = '';
        selected.forEach((t, i) => {
          const card = document.createElement('div');
          card.className  = 't-card';
          card.style.background = t.background || cardColors[i % cardColors.length];

          const roleText  = t.brand ? `${t.role} · ${t.brand}` : t.role;
          const quoteText = t.quoteMobile || t.quote;
          card.innerHTML = `
            <div class="t-tag">${tag}</div>
            <p class="t-quote">"${quoteText}"</p>
            <div><p class="t-name">${t.name}</p><p class="t-role">${roleText}</p></div>
          `;
          mobileContainer.appendChild(card);
        });
      }

    } catch (error) {
      console.error('Error loading testimonios:', error);
    }
  }

  // Expone la función globalmente para que i18n.js la llame al cambiar idioma
  window.renderTestimonios = renderTestimonios;

  // Render inicial (DOM ya disponible porque este script está al final del body)
  renderTestimonios(window.currentLang || 'es');

})();
