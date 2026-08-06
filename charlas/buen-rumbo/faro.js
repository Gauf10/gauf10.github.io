/* ===================================================================
 *  FARO — consola personal del speaker
 *
 *  FARO no existe para controlar una presentación.
 *  Existe para acompañar una conversación.
 * =================================================================== */

(function() {
  'use strict';

  /* ──────────────────────────────────────────────
   *  CONFIG
   * ────────────────────────────────────────────── */

  var API_BASE = 'https://faro-api.gauf10.workers.dev';
  var CHARLA_NAME = '¿Vamos bien?';
  var TOTAL_SLIDES = 11;

  /* ──────────────────────────────────────────────
   *  STATE
   * ────────────────────────────────────────────── */

  var cur = -1;
  var slides = [];
  var notesCache = {};
  var timerStart = null;
  var timerInterval = null;
  var slideStartTime = null;
  var blackoutActive = false;
  var connected = false;
  var totalMinutes = 0;
  var slideTargetSeconds = 0;
  var layoutRatio = 0.7;
  var authToken = null;
  var broadcast = null;

  var slideCSS =
    '*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}' +
    ':host{display:block;width:100%;height:100%;overflow:hidden;font-family:\'Archivo\',sans-serif;background:#1a1a1a;color:#f5f2ec;-webkit-font-smoothing:antialiased;--bk:#1a1a1a;--accent:#27d3cc;--bone:#f5f2ec;--dim:rgba(245,242,236,.4);--dim2:rgba(245,242,236,.12);--pad:clamp(40px,7vw,100px)}' +
    '.slide{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:1;background:var(--bk);color:var(--bone)}' +
    '.si{position:relative;z-index:2;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;padding:var(--pad)}' +
    '.si-content{flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;position:relative}' +
    '.si-footer{position:absolute;bottom:clamp(16px,3vh,40px);left:0;right:0;display:flex;justify-content:center;align-items:center;padding:0 var(--pad);pointer-events:none}' +
    '.footer-logo{height:clamp(13px,1.76vw,26px);width:auto;opacity:1}' +
    '.footer-logo-circle{position:absolute;top:clamp(16px,3vh,40px);right:var(--pad);height:clamp(39px,4.8vw,68px);width:auto;max-width:clamp(100px,12vw,180px);object-fit:contain;opacity:1;z-index:3}' +
    '.hero{text-align:center;max-width:88vw}' +
    '.hero-line{font-size:clamp(18px,3.2vw,44px);font-weight:300;line-height:1.5;letter-spacing:0.04em;color:var(--bone)}' +
    '.accent,.hero-line.accent{color:var(--accent)}' +
    '.slide-cyan{--bk:#27d3cc;background:#27d3cc;color:#1a1a1a}' +
    '.slide-cyan .hero-line{color:#1a1a1a;font-weight:300}' +
    '.slide-cyan .footer-logo{filter:brightness(0);opacity:1}' +
    '.slide-cyan .footer-logo-circle{filter:brightness(0);opacity:.7}' +
    '.s-close-quote{max-width:80vw;text-align:center}' +
    '.s-close-quote div{font-size:clamp(22px,3.8vw,56px);font-weight:300;line-height:1.4;letter-spacing:0.03em;color:var(--bone)}' +
    '.s-author{font-size:clamp(11px,1vw,15px);color:var(--dim);font-weight:400;letter-spacing:.15em;text-transform:uppercase}' +
    '.sec-label{font-size:clamp(10px,.9vw,14px);color:var(--dim);letter-spacing:0.12em;text-transform:uppercase;font-weight:400;margin-bottom:clamp(24px,3vh,52px)}' +
    '.reveal-steps{text-align:center}' +
    '.reveal-step{font-size:clamp(18px,3.2vw,44px);font-weight:300;line-height:1.5;letter-spacing:0.04em;color:var(--bone);opacity:0;transition:opacity .8s ease,transform .8s ease;transform:translateY(8px)}' +
    '.reveal-step.revealed{opacity:1;transform:translateY(0)}' +
    '.fw-arr{color:var(--dim);font-size:clamp(12px,1.2vw,20px);margin:clamp(4px,.6vh,12px) 0;font-weight:300}' +
    '.slide{-webkit-user-select:text;user-select:text}' +
    '.slide-num{position:absolute;bottom:clamp(16px,3vh,40px);left:var(--pad);font-size:clamp(8px,.7vw,11px);color:rgba(245,242,236,.25);font-weight:300;letter-spacing:.04em;pointer-events:none;z-index:3}';

  /* ──────────────────────────────────────────────
   *  AUTH MANAGER
   * ────────────────────────────────────────────── */

  var Auth = {
    getToken: function() { return authToken || sessionStorage.getItem('faro-token'); },

    login: function(password) {
      return fetch(API_BASE + '/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ charla: CHARLA_NAME, password: password }),
      }).then(function(r) {
        if (!r.ok) throw new Error('invalid');
        return r.json();
      }).then(function(data) {
        authToken = data.token;
        sessionStorage.setItem('faro-token', data.token);
        return true;
      });
    },

    logout: function() {
      authToken = null;
      sessionStorage.removeItem('faro-token');
    },

    check: function() {
      return !!Auth.getToken();
    },
  };

  /* ──────────────────────────────────────────────
   *  API CLIENT
   * ────────────────────────────────────────────── */

  var Api = {
    _request: function(method, path, body) {
      var opts = {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + Auth.getToken(),
        },
      };
      if (body) opts.body = JSON.stringify(body);
      return fetch(API_BASE + path, opts).then(function(r) {
        if (r.status === 401) { Auth.logout(); return Promise.reject('unauthorized'); }
        if (!r.ok) return Promise.reject('api error');
        return r.json();
      });
    },

    getNotes: function() {
      return Api._request('GET', '/api/notes');
    },

    saveNotes: function(content) {
      return Api._request('PUT', '/api/notes', { content: content });
    },

    getAprendizajes: function() {
      return Api._request('GET', '/api/aprendizajes');
    },

    saveAprendizajes: function(content) {
      return Api._request('PUT', '/api/aprendizajes', { content: content });
    },
  };

  /* ──────────────────────────────────────────────
   *  UI — LOGIN
   * ────────────────────────────────────────────── */

  function showLogin() {
    document.getElementById('login').classList.remove('hidden');
    document.getElementById('app').style.display = 'none';
    document.getElementById('waiting').classList.remove('show');
    document.getElementById('login-password').value = '';
    document.getElementById('login-error').classList.remove('show');
    document.getElementById('login-password').focus();
  }

  function hideLogin() {
    document.getElementById('login').classList.add('hidden');
  }

  document.getElementById('login-password').addEventListener('keydown', function(e) {
    if (e.key !== 'Enter') return;
    var pw = this.value;
    var errEl = document.getElementById('login-error');
    Auth.login(pw).then(function() {
      errEl.classList.remove('show');
      hideLogin();
      initApp();
    }).catch(function() {
      errEl.textContent = 'Contraseña incorrecta';
      errEl.classList.add('show');
    });
  });

  /* ──────────────────────────────────────────────
   *  UI — WAITING
   * ────────────────────────────────────────────── */

  function showWaiting() {
    document.getElementById('waiting').classList.add('show');
    document.getElementById('app').style.display = 'none';
  }

  function hideWaiting() {
    document.getElementById('waiting').classList.remove('show');
    document.getElementById('app').style.display = 'flex';
    connected = true;
    setTimeout(applyRatio, 50);
  }

  /* ──────────────────────────────────────────────
   *  RENDER
   * ────────────────────────────────────────────── */

  function slideInnerHTML(index) {
    var s = slides[index];
    if (!s) return '';
    s = s.replace(/class="reveal-step"/g, 'class="reveal-step revealed"');
    return s;
  }

  function mountShadow(host, innerHTML, extraStyle) {
    var root = host.shadowRoot || host.attachShadow({ mode: 'open' });
    var base = location.href.substring(0, location.href.lastIndexOf('/') + 1);
    root.innerHTML =
      '<style>@import url("https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;700;900&display=swap");'
      + slideCSS
      + (extraStyle || '')
      + '</style>'
      + '<base href="' + base + '">'
      + innerHTML;
  }

  function renderCurrent(index) {
    var el = document.getElementById('slide-current');
    var html = slideInnerHTML(index);
    if (!html) { el.innerHTML = ''; return; }
    // Use a dedicated host div inside slide-current
    var host = el.querySelector('.shadow-host');
    if (!host) {
      el.innerHTML = '';
      host = document.createElement('div');
      host.className = 'shadow-host';
      host.style.cssText = 'width:100%;height:100%;display:block;';
      el.appendChild(host);
    }
    mountShadow(host, html, '');
  }

  function renderNext(index) {
    var el = document.getElementById('next-preview');
    // Keep label
    var label = el.querySelector('#next-label');
    if (!label) {
      label = document.createElement('div');
      label.id = 'next-label';
      el.insertBefore(label, el.firstChild);
    }
    label.textContent = 'SIGUIENTE';
    if (index < 0 || index >= TOTAL_SLIDES) {
      var host = el.querySelector('.shadow-host');
      if (host) host.remove();
      return;
    }
    var html = slideInnerHTML(index);
    var host = el.querySelector('.shadow-host');
    if (!host) {
      host = document.createElement('div');
      host.className = 'shadow-host';
      host.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
      el.appendChild(host);
    }
    mountShadow(host, html, '');
  }

  /* ──────────────────────────────────────────────
   *  NOTES
   * ────────────────────────────────────────────── */

  function parseNotes(md) {
    var result = {};
    if (!md) return result;
    var lines = md.split('\n');
    var currentSlide = null;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var m = line.match(/^#\s*(s\d+)/);
      if (m) { currentSlide = m[1]; result[currentSlide] = []; continue; }
      if (currentSlide && line.trim()) result[currentSlide].push(line);
    }
    var plain = {};
    for (var key in result) plain[key] = result[key].join('\n');
    return plain;
  }

  function getNotesForSlide(index) {
    return notesCache['s' + index] || '';
  }

  var _notesDebounce = null;
  function onNotesInput() {
    var ta = document.getElementById('notes-editor');
    notesCache['s' + cur] = ta.value;
    if (_notesDebounce) clearTimeout(_notesDebounce);
    _notesDebounce = setTimeout(function() {
      var md = buildNotesMD();
      Api.saveNotes(md).catch(function() {});
    }, 500);
  }

  function buildNotesMD() {
    var md = '';
    for (var i = 0; i < TOTAL_SLIDES; i++) {
      var text = notesCache['s' + i];
      if (text && text.trim()) {
        md += '# s' + i + '\n' + text + '\n\n';
      }
    }
    return md.trim();
  }

  /* ──────────────────────────────────────────────
   *  APRENDIZAJES
   * ────────────────────────────────────────────── */

  var _aprendizajesLocal = {};

  function toggleAprendizajes() {
    var panel = document.getElementById('aprendizajes-panel');
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) {
      var first = document.querySelector('.aprendizajes-input');
      if (first) first.focus();
    }
  }

  function loadAprendizajes() {
    try { _aprendizajesLocal = JSON.parse(localStorage.getItem('faro-aprendizajes')) || {}; } catch (e) { _aprendizajesLocal = {}; }
    document.querySelectorAll('.aprendizajes-input').forEach(function(ta) {
      ta.value = _aprendizajesLocal[ta.getAttribute('data-field')] || '';
    });
    /* también intentar cargar desde API */
    Api.getAprendizajes().then(function(data) {
      if (!data || !data.content) return;
      /* el API devuelve markdown; parsearlo a campos */
      var fields = ['funciono', 'cambiaria', 'preguntas', 'ideas'];
      var labels = ['Qué funcionó', 'Qué cambiaría', 'Preguntas que aparecieron', 'Ideas nuevas'];
      fields.forEach(function(key, i) {
        var re = new RegExp('##\\s*' + labels[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\n([\\s\\S]*?)(?=##|$)', 'i');
        var m = data.content.match(re);
        if (m && m[1] && m[1].replace(/—/g,'').trim()) {
          _aprendizajesLocal[key] = m[1].trim();
          var ta = document.querySelector('.aprendizajes-input[data-field="' + key + '"]');
          if (ta) ta.value = _aprendizajesLocal[key];
        }
      });
    }).catch(function() {});
  }

  var _aprendizajesDebounce = null;
  function onAprendizajesInput() {
    _aprendizajesLocal[this.getAttribute('data-field')] = this.value;
    localStorage.setItem('faro-aprendizajes', JSON.stringify(_aprendizajesLocal));
    if (_aprendizajesDebounce) clearTimeout(_aprendizajesDebounce);
    _aprendizajesDebounce = setTimeout(function() {
      var fields = [
        { key: 'funciono',  label: 'Qué funcionó' },
        { key: 'cambiaria', label: 'Qué cambiaría' },
        { key: 'preguntas', label: 'Preguntas que aparecieron' },
        { key: 'ideas',     label: 'Ideas nuevas' },
      ];
      var md = '# Aprendizajes — ' + CHARLA_NAME + '\n\n';
      fields.forEach(function(f) {
        md += '## ' + f.label + '\n\n' + ((_aprendizajesLocal[f.key] || '').trim() || '—') + '\n\n';
      });
      Api.saveAprendizajes(md.trim()).catch(function() {});
    }, 800);
  }

  /* ──────────────────────────────────────────────
   *  TIMER
   * ────────────────────────────────────────────── */

  function updateTimer() {
    var now = new Date();
    document.getElementById('st-time').textContent =
      String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');

    if (!timerStart) return;

    var elapsed = Date.now() - timerStart;
    var mins = Math.floor(elapsed / 60000);
    var secs = Math.floor((elapsed % 60000) / 1000);
    var el = document.getElementById('st-elapsed');
    el.textContent = String(mins).padStart(2,'0') + ':' + String(secs).padStart(2,'0');

    var elSlide = document.getElementById('st-slide-time');
    if (slideStartTime) {
      var sElapsed = Date.now() - slideStartTime;
      var sMins = Math.floor(sElapsed / 60000);
      var sSecs = Math.floor((sElapsed % 60000) / 1000);
      elSlide.innerHTML = '<span>+' + String(sMins).padStart(2,'0') + ':' + String(sSecs).padStart(2,'0') + '</span>'
        + (slideTargetSeconds > 0 ? '<span class="obj">/' + slideTargetSeconds + 's</span>' : '');
      elSlide.classList.remove('warn', 'over');
      if (slideTargetSeconds > 0) {
        if (sElapsed > slideTargetSeconds * 1500) elSlide.classList.add('over');
        else if (sElapsed > slideTargetSeconds * 1000) elSlide.classList.add('warn');
      }
    } else {
      elSlide.innerHTML = '';
    }
  }

  function startTimer() {
    if (!timerStart) {
      timerStart = Date.now();
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(updateTimer, 1000);
    }
    slideStartTime = Date.now();
    updateTimer();
  }

  function resetTimer() {
    timerStart = Date.now();
    updateTimer();
  }

  function setTotalMinutes() {
    var input = prompt('Duración total en minutos:', totalMinutes || '25');
    if (input === null) return;
    var n = parseFloat(input);
    if (!isNaN(n) && n > 0) {
      totalMinutes = n;
      localStorage.setItem('faro-total-minutes', totalMinutes);
    } else {
      totalMinutes = 0;
      localStorage.removeItem('faro-total-minutes');
    }
  }

  function setSlideTarget() {
    var input = prompt('Objetivo por slide en segundos:', slideTargetSeconds || '120');
    if (input === null) return;
    var n = parseInt(input, 10);
    if (!isNaN(n) && n > 0) {
      slideTargetSeconds = n;
      localStorage.setItem('faro-slide-target-seconds', n);
    } else {
      slideTargetSeconds = 0;
      localStorage.removeItem('faro-slide-target-seconds');
    }
    updateTimer();
  }

  /* ──────────────────────────────────────────────
   *  SLIDE SWITCH
   * ────────────────────────────────────────────── */

  function switchToSlide(index) {
    if (index < 0 || index >= TOTAL_SLIDES || index === cur) return;

    if (cur >= 0) {
      var ta = document.getElementById('notes-editor');
      notesCache['s' + cur] = ta.value;
      var md = buildNotesMD();
      Api.saveNotes(md).catch(function() {});
    }

    cur = index;
    renderCurrent(cur);
    renderNext(cur + 1 < TOTAL_SLIDES ? cur + 1 : -1);
    document.getElementById('notes-editor').value = getNotesForSlide(cur);
    document.getElementById('st-slide').innerHTML =
      '<span>' + String(cur + 1).padStart(2,'0') + '</span> / ' + String(TOTAL_SLIDES).padStart(2,'0');

    startTimer();
    setTimeout(applyRatio, 100);
  }

  /* ──────────────────────────────────────────────
   *  NAVIGATION
   * ────────────────────────────────────────────── */

  function prevSlide() {
    if (!connected) return;
    if (broadcast) broadcast.postMessage({ type: 'goto', index: cur - 1 });
  }

  function nextSlide() {
    if (!connected) return;
    if (broadcast) broadcast.postMessage({ type: 'goto', index: cur + 1 });
  }

  /* ──────────────────────────────────────────────
   *  LAYOUT
   * ────────────────────────────────────────────── */

  function loadRatio() {
    var r = parseFloat(localStorage.getItem('faro-layout-ratio'));
    if (r > 0 && r < 1) layoutRatio = r;
  }

  function saveRatio(r) {
    layoutRatio = Math.max(.2, Math.min(.9, r));
    localStorage.setItem('faro-layout-ratio', layoutRatio);
    applyRatio();
  }

  function applyRatio() {
    var top = document.getElementById('slide-current');
    var notes = document.getElementById('notes-section');
    var bottom = document.getElementById('bottom-section');
    if (!top || !notes || !bottom) return;
    var avail = document.getElementById('app').clientHeight
      - document.getElementById('top-bar').offsetHeight
      - bottom.offsetHeight
      - 16;
    top.style.height = Math.round(avail * layoutRatio) + 'px';
  }

  function initDrag() {
    var handle = document.getElementById('drag-handle');
    if (!handle) return;
    var dragging = false, startY, startRatio;

    function onMove(e) {
      if (!dragging) return;
      var bottom = document.getElementById('bottom-section');
      var topBar = document.getElementById('top-bar');
      var app = document.getElementById('app');
      var avail = app.clientHeight - topBar.offsetHeight - bottom.offsetHeight - 16;
      var dy = (e.touches ? e.touches[0].clientY : e.clientY) - startY;
      saveRatio(startRatio + (dy / avail));
    }

    function onUp() {
      if (!dragging) return;
      dragging = false;
      handle.classList.remove('is-active');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    }

    handle.addEventListener('mousedown', function(e) {
      dragging = true; startY = e.clientY; startRatio = layoutRatio;
      handle.classList.add('is-active');
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      e.preventDefault();
    });

    handle.addEventListener('touchstart', function(e) {
      dragging = true; startY = e.touches[0].clientY; startRatio = layoutRatio;
      handle.classList.add('is-active');
      document.addEventListener('touchmove', onMove, { passive: true });
      document.addEventListener('touchend', onUp);
      e.preventDefault();
    });
  }

  /* ──────────────────────────────────────────────
   *  HELP
   * ────────────────────────────────────────────── */

  function toggleHelp() {
    document.getElementById('help-overlay').classList.toggle('open');
  }

  /* ──────────────────────────────────────────────
   *  KEYBOARD
   * ────────────────────────────────────────────── */

  document.addEventListener('keydown', function(e) {
    var t = e.target;

    if (t.closest && t.closest('#notes-editor')) return;
    if (t.closest && t.closest('.aprendizajes-input')) return;
    if (t.closest && t.closest('#login-password')) return;

    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); prevSlide(); return; }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') { e.preventDefault(); nextSlide(); return; }

    e.preventDefault();

    switch (e.key) {
      case 'Home': if (broadcast) broadcast.postMessage({ type: 'goto', index: 0 }); break;
      case 'End': if (broadcast) broadcast.postMessage({ type: 'goto', index: TOTAL_SLIDES - 1 }); break;
      case 'n': case 'N':
        var sec = document.getElementById('notes-section');
        sec.style.display = sec.style.display === 'none' ? '' : 'none';
        setTimeout(applyRatio, 50);
        break;
      case '+': case '=':
        var ed = document.getElementById('notes-editor');
        var sz = parseFloat(getComputedStyle(ed).fontSize) || 14;
        ed.style.fontSize = (sz + 2) + 'px';
        break;
      case '-':
        var ed = document.getElementById('notes-editor');
        var sz = parseFloat(getComputedStyle(ed).fontSize) || 14;
        if (sz > 8) ed.style.fontSize = (sz - 2) + 'px';
        break;
      case 'f': case 'F':
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen();
        break;
      case 't': case 'T': resetTimer(); break;
      case 's': case 'S': setTotalMinutes(); break;
      case 'p': case 'P': setSlideTarget(); break;
      case 'a': case 'A': toggleAprendizajes(); break;
      case 'b': case 'B':
        blackoutActive = !blackoutActive;
        if (broadcast) broadcast.postMessage({ type: 'blackout', active: blackoutActive });
        break;
      case 'Escape':
        if (shareMenuOpen) { closeShareMenu(); return; }
        if (document.getElementById('help-overlay').classList.contains('open')) {
          document.getElementById('help-overlay').classList.remove('open');
          return;
        }
        if (document.getElementById('aprendizajes-panel').classList.contains('open')) {
          document.getElementById('aprendizajes-panel').classList.remove('open');
          return;
        }
        if (blackoutActive) {
          blackoutActive = false;
          if (broadcast) broadcast.postMessage({ type: 'blackout', active: false });
        }
        break;
    }
  });

  document.addEventListener('click', function() {
    var a = document.activeElement;
    if (a && a !== document.body && a.tagName !== 'TEXTAREA' && a.tagName !== 'INPUT') a.blur();
  });

  /* ──────────────────────────────────────────────
   *  WHEEL + TOUCH
   * ────────────────────────────────────────────── */

  var _wheelAcc = 0, _wheelDeb = false;
  document.addEventListener('wheel', function(e) {
    if (e.target.closest && (e.target.closest('textarea') || e.target.closest('input'))) return;
    if (_wheelDeb) return;
    _wheelAcc += Math.abs(e.deltaY);
    if (_wheelAcc >= 60) {
      _wheelAcc = 0; _wheelDeb = true;
      if (e.deltaY > 0) nextSlide(); else prevSlide();
      setTimeout(function() { _wheelDeb = false; }, 400);
    }
  }, { passive: true });

  var _touchY = 0;
  document.addEventListener('touchstart', function(e) { _touchY = e.touches[0].clientY; }, { passive: true });
  document.addEventListener('touchend', function(e) {
    var dy = e.changedTouches[0].clientY - _touchY;
    if (Math.abs(dy) > 45) { if (dy > 0) prevSlide(); else nextSlide(); }
  }, { passive: true });

  /* ──────────────────────────────────────────────
   *  CLOCK
   * ────────────────────────────────────────────── */

  setInterval(updateTimer, 10000);

  /* ──────────────────────────────────────────────
   *  BROADCAST
   * ────────────────────────────────────────────── */

  function initBroadcast() {
    var KEY = 'gauf-presenter';
    var lastUpdate = Date.now();

    /* Escribe en localStorage — el storage event solo dispara en OTROS documentos,
       así que index.html recibe los comandos de faro y viceversa sin loops */
    function lsSend(data) {
      var msg = { ts: Date.now() };
      for (var k in data) {
        if (Object.prototype.hasOwnProperty.call(data, k)) msg[k] = data[k];
      }
      try { localStorage.setItem(KEY, JSON.stringify(msg)); } catch(e) {}
    }

    /* Objeto broadcast compatible con el código existente */
    broadcast = { postMessage: lsSend };

    window.addEventListener('storage', function(e) {
      if (e.key !== KEY || !e.newValue) return;
      try {
        var d = JSON.parse(e.newValue);
        if (!d) return;
        lastUpdate = Date.now();

        if (d.type === 'slideChanged') {
          try { switchToSlide(d.current); } catch(err) {}
        }

        if (d.type === 'pong' || d.type === 'init') {
          if (d.slides && d.slides.length) {
            slides = d.slides;
            if (!connected) {
              hideWaiting();
              cur = -1;
              try { switchToSlide(d.current || 0); } catch(err) {}
            }
          }
          if (d.notes && typeof d.notes === 'object') {
            for (var k in d.notes) {
              if (Object.prototype.hasOwnProperty.call(d.notes, k)) {
                notesCache['s' + k] = d.notes[k];
              }
            }
            if (cur >= 0) document.getElementById('notes-editor').value = getNotesForSlide(cur);
          }
        }
      } catch(err) {}
    });

    lsSend({ type: 'ping' });

    setInterval(function() {
      if (Date.now() - lastUpdate > 12000 && connected) {
        showWaiting();
        connected = false;
      }
      lsSend({ type: 'ping' });
    }, 4000);
  }

  /* ──────────────────────────────────────────────
   *  INIT
   * ────────────────────────────────────────────── */

  function initApp() {
    loadRatio();
    totalMinutes = parseFloat(localStorage.getItem('faro-total-minutes')) || 0;
    slideTargetSeconds = parseInt(localStorage.getItem('faro-slide-target-seconds'), 10) || 0;

    document.getElementById('notes-editor').addEventListener('input', onNotesInput);
    loadAprendizajes();
    document.querySelectorAll('.aprendizajes-input').forEach(function(ta) {
      ta.addEventListener('input', onAprendizajesInput);
    });

    showWaiting();
    initDrag();
    initBroadcast();
    initShare();

    Api.getNotes().then(function(data) {
      notesCache = parseNotes(data.content || '');
      if (cur >= 0) document.getElementById('notes-editor').value = getNotesForSlide(cur);
    }).catch(function() {});

    window.addEventListener('resize', applyRatio);

    setInterval(function() {
      fetch(API_BASE + '/api/notes', {
        headers: { 'Authorization': 'Bearer ' + Auth.getToken() },
      }).catch(function() {});
    }, 60000);
  }

  /* ──────────────────────────────────────────────
   *  SHARE
   * ────────────────────────────────────────────── */

  var shareBtnEl = document.getElementById('share-btn');
  var shareMenuEl = document.getElementById('share-menu');
  var shareMenuOpen = false;
  var toastTimer = null;

  var SHARE_ITEMS = [
    {
      id: 'pdf',
      label: 'Exportar PDF',
      icon: '<path d="M12 3v12m0-12L8 7m4-4l4 4"/><path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/>',
      run: exportPDF
    },
    {
      id: 'link',
      label: 'Copiar enlace',
      icon: '<path d="M9 12h6"/><path d="M8.5 15.5L6.6 17.4a3 3 0 01-4.2-4.2l3-3a3 3 0 014.2 0"/><path d="M15.5 8.5l1.9-1.9a3 3 0 114.2 4.2l-3 3a3 3 0 01-4.2 0"/>',
      run: copyLink
    },
    {
      id: 'open',
      label: 'Abrir presentación pública',
      icon: '<path d="M13 5h6v6"/><path d="M19 5l-8 8"/><path d="M10 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-3"/>',
      run: openPresentation
    }
  ];

  function buildShareMenu() {
    shareMenuEl.innerHTML = '<div class="share-menu-title">Compartir</div>';
    for (var i = 0; i < SHARE_ITEMS.length; i++) {
      var it = SHARE_ITEMS[i];
      var btn = document.createElement('button');
      btn.className = 'share-menu-item';
      btn.setAttribute('data-share', it.id);
      btn.innerHTML =
        '<svg class="share-menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' +
        it.icon + '</svg>' +
        '<span class="share-menu-label">' + it.label + '</span>';
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var id = this.getAttribute('data-share');
        for (var j = 0; j < SHARE_ITEMS.length; j++) {
          if (SHARE_ITEMS[j].id === id) { SHARE_ITEMS[j].run(); break; }
        }
        closeShareMenu();
      });
      shareMenuEl.appendChild(btn);
    }
  }

  function exportPDF() {
    window.open('index.html?print', '_blank');
  }

  function copyLink() {
    var url = location.origin + location.pathname.replace(/[^/]*$/, '') + 'index.html';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(showToast).catch(function() { fallbackCopy(url); });
    } else {
      fallbackCopy(url);
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showToast(); } catch (err) {}
    document.body.removeChild(ta);
  }

  function openPresentation() {
    window.open('index.html', '_blank');
  }

  function showToast() {
    var el = document.getElementById('toast');
    el.textContent = 'Enlace copiado.';
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function() { el.classList.remove('show'); }, 1600);
  }

  function openShareMenu() {
    var r = shareBtnEl.getBoundingClientRect();
    var w = shareMenuEl.offsetWidth;
    var left = Math.max(8, r.right - w);
    var top = r.bottom + 8;
    if (top + shareMenuEl.offsetHeight > window.innerHeight) {
      top = r.top - shareMenuEl.offsetHeight - 8;
    }
    shareMenuEl.style.left = left + 'px';
    shareMenuEl.style.top = top + 'px';
    shareMenuEl.classList.add('open');
    shareMenuOpen = true;
  }

  function closeShareMenu() {
    shareMenuEl.classList.remove('open');
    shareMenuOpen = false;
  }

  function toggleShareMenu(e) {
    if (e) e.stopPropagation();
    if (shareMenuOpen) closeShareMenu();
    else openShareMenu();
  }

  function initShare() {
    buildShareMenu();
    shareBtnEl.addEventListener('click', toggleShareMenu);
    document.addEventListener('click', function(e) {
      if (shareMenuOpen && !shareMenuEl.contains(e.target) && !shareBtnEl.contains(e.target)) closeShareMenu();
    });
  }

  /* ──────────────────────────────────────────────
   *  BOOT
   * ────────────────────────────────────────────── */

  if (Auth.check()) {
    hideLogin();
    initApp();
  } else {
    showLogin();
  }

  /* ──────────────────────────────────────────────
   *  EXPOSE GLOBALS
   * ────────────────────────────────────────────── */

  window.Faro = {
    prev: prevSlide,
    next: nextSlide,
    toggleHelp: toggleHelp,
    toggleAprendizajes: toggleAprendizajes,
    setSlideTarget: setSlideTarget,
  };
})();
