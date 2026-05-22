// ============================================================
//  analytics.js — Google Analytics 4 · Eventos personalizados
//  Sitio web: GAUF Mentor & Speaker
//
//  SETUP (2 pasos):
//  1. Ir a analytics.google.com → crear propiedad → copiar
//     tu Measurement ID (formato G-XXXXXXXXXX)
//  2. Reemplazar 'G-XXXXXXXXXX' en este archivo Y en el
//     snippet del <head> dentro de index.html
//
//  VERIFICACIÓN:
//  · Abrí tu sitio en Chrome
//  · Abrí DevTools → pestaña "Network"
//  · Filtrá por "collect" — vas a ver los hits de GA
//  · O instalá la extensión "GA Debugger" de Chrome
// ============================================================

// ------------------------------------------------------------
//  CONFIGURACIÓN — solo editar el Measurement ID
// ------------------------------------------------------------
const GA_ID = 'G-NF0X4QWTN6'; // ← reemplazar con tu ID real

// Helper seguro: envía un evento solo si gtag está disponible
// Si GA no cargó (bloqueador de ads, etc.) simplemente no hace nada
function gta(eventName, params) {
  if (typeof gtag === 'function') {
    gtag('event', eventName, Object.assign({ lang: window.currentLang || 'es' }, params));
  }
}

// Espera a que el DOM esté listo antes de adjuntar listeners
(function ready(fn) {
  if (document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn);
})(function () {

  // ==========================================================
  //  1. CTA CLICKS — "Agenda conmigo" / "Book a call"
  //     Evento: cta_click
  //     Parámetros: label (hero_book_call | contacto_book_call)
  // ==========================================================
  document.querySelectorAll('a[href*="calendar.google.com"]').forEach(function (el) {
    el.addEventListener('click', function () {
      const isHero = this.closest('#hero') !== null;
      gta('cta_click', {
        label: isHero ? 'hero_book_call' : 'contacto_book_call'
      });
    });
  });

  // ==========================================================
  //  2. NAV CTA — "Hablemos" / "Let's talk"
  //     Evento: cta_click · label: nav_hablemos
  // ==========================================================
  document.querySelectorAll('.nav-cta').forEach(function (el) {
    el.addEventListener('click', function () {
      gta('cta_click', { label: 'nav_hablemos' });
    });
  });

  // ==========================================================
  //  3. PROYECTOS — hover/click en cada pill
  //     Evento: project_open
  //     Parámetros: project_name
  // ==========================================================
  document.querySelectorAll('.proyecto-pill').forEach(function (el) {
    el.addEventListener('click', function () {
      // El nombre del proyecto es el primer nodo de texto
      const name = this.childNodes[0].textContent.trim();
      gta('project_open', { project_name: name });
    });
  });

  // ==========================================================
  //  4. REDES SOCIALES — links en el footer
  //     Evento: social_click
  //     Parámetros: platform (LinkedIn | Instagram | X)
  // ==========================================================
  document.querySelectorAll('.footer-links a').forEach(function (el) {
    el.addEventListener('click', function () {
      gta('social_click', { platform: this.textContent.trim() });
    });
  });

  // ==========================================================
  //  5. LINKS EXTERNOS — cualquier <a target="_blank">
  //     (excluye calendar y redes que ya están trackeados)
  //     Evento: external_link_click
  //     Parámetros: url, label
  // ==========================================================
  var EXCLUDE_DOMAINS = ['calendar.google', 'linkedin.com', 'instagram.com', 'x.com'];
  document.querySelectorAll('a[target="_blank"]').forEach(function (el) {
    el.addEventListener('click', function () {
      var url = this.href || '';
      var excluded = EXCLUDE_DOMAINS.some(function (d) { return url.includes(d); });
      if (excluded) return;
      gta('external_link_click', {
        url:   url,
        label: this.textContent.trim().substring(0, 80)
      });
    });
  });

  // ==========================================================
  //  6. CAMBIO DE IDIOMA — cuando el usuario toca ESP / ENG
  //     Evento: language_change
  //     Parámetros: selected_lang, previous_lang
  //     Se inyecta antes de llamar al setLang original de i18n.js
  // ==========================================================
  (function () {
    var originalSetLang = window.setLang;
    window.setLang = function (lang) {
      gta('language_change', {
        selected_lang: lang,
        previous_lang: window.currentLang || 'es'
      });
      if (typeof originalSetLang === 'function') originalSetLang(lang);
    };
  })();

  // ==========================================================
  //  7. SCROLL DEPTH — dispara una sola vez por milestone
  //     Eventos: scroll_25, scroll_50, scroll_75, scroll_90
  // ==========================================================
  (function () {
    var milestones = [25, 50, 75, 90];
    var fired = {};

    window.addEventListener('scroll', function () {
      var scrolled = window.scrollY + window.innerHeight;
      var total    = document.documentElement.scrollHeight;
      var pct      = Math.round((scrolled / total) * 100);

      milestones.forEach(function (m) {
        if (pct >= m && !fired[m]) {
          fired[m] = true;
          gta('scroll_' + m, { percent: m });
        }
      });
    }, { passive: true });
  })();

  // ==========================================================
  //  8. SECTION VIEW — qué secciones ve el usuario
  //     Evento: section_view
  //     Parámetros: section (id del <section>)
  //     Usa IntersectionObserver → no bloquea el scroll
  // ==========================================================
  (function () {
    var sections = ['dolores', 'quien', 'servicios', 'proyectos',
                    'testimonios', 'valores', 'contacto'];

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          gta('section_view', { section: entry.target.id });
          obs.unobserve(entry.target); // dispara solo una vez por sección
        }
      });
    }, { threshold: 0.3 });

    sections.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) obs.observe(el);
    });
  })();

  // ==========================================================
  //  9. TIME ON PAGE — tiempo de permanencia al salir
  //     Evento: time_on_page
  //     Parámetros: seconds (tiempo en segundos)
  // ==========================================================
  (function () {
    var startTime = Date.now();
    window.addEventListener('beforeunload', function () {
      var seconds = Math.round((Date.now() - startTime) / 1000);
      // Usar sendBeacon garantiza que el evento llega aunque la página ya cerró
      if (typeof gtag === 'function') {
        gtag('event', 'time_on_page', {
          seconds:      seconds,
          lang:         window.currentLang || 'es',
          transport_type: 'beacon'
        });
      }
    });
  })();

}); // fin DOMContentLoaded

// ============================================================
//  RESUMEN DE EVENTOS — referencia rápida
//  ──────────────────────────────────────────────────────────
//  cta_click          → click en "Agenda conmigo", "Book a call", "Hablemos"
//  project_open       → click en pill de proyecto
//  social_click       → click en LinkedIn, Instagram, X
//  external_link_click→ click en cualquier link externo
//  language_change    → usuario cambia ESP ↔ ENG
//  scroll_25/50/75/90 → el usuario llegó al X% de la página
//  section_view       → una sección entró en el viewport (30%)
//  time_on_page       → segundos en el sitio al cerrar la pestaña
//
//  PARA VER LOS EVENTOS EN TIEMPO REAL:
//  analytics.google.com → tu propiedad → Informes → Tiempo real
// ============================================================
