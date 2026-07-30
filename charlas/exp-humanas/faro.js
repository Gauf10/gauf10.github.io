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
  var CHARLA_NAME = 'Diseñar experiencias humanas';
  var TOTAL_SLIDES = 24;

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
  var slideMinutes = 0;
  var layoutRatio = 0.7;
  var authToken = null;
  var broadcast = null;

  var slideCSS =
    '*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}' +
    'html,body{width:100%;height:100%;overflow:hidden;font-family:\'Archivo\',sans-serif;background:#1a1a1a;color:#f5f2ec;-webkit-font-smoothing:antialiased}' +
    ':root{--bk:#1a1a1a;--accent:#27d3cc;--bone:#f5f2ec;--dim:rgba(245,242,236,.4);--dim2:rgba(245,242,236,.12);--pad:clamp(40px,7vw,100px)}' +
    '.slide{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:1;background:var(--bk);color:var(--bone)}' +
    '.si{position:relative;z-index:2;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;padding:var(--pad)}' +
    '.si-content{flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;position:relative}' +
    '.si-footer{position:absolute;bottom:clamp(16px,3vh,40px);left:0;right:0;display:flex;justify-content:center;align-items:center;padding:0 var(--pad);pointer-events:none}' +
    '.footer-logo{height:clamp(13px,1.76vw,26px);width:auto;opacity:1}' +
    '.footer-logo-circle{position:absolute;top:clamp(16px,3vh,40px);right:var(--pad);height:clamp(39px,4.8vw,68px);width:clamp(39px,4.8vw,68px);object-fit:contain;opacity:1;z-index:3}' +
    '.hero{text-align:center;max-width:88vw}' +
    '.hero-line{font-size:clamp(18px,3.2vw,44px);font-weight:300;line-height:1.5;letter-spacing:0.04em;color:var(--bone)}' +
    '.hero-line strong{font-weight:400}' +
    '.accent,.hero-line.accent{color:var(--accent)}' +
    '.hero-break{height:clamp(0px,4vh,0px)}' +
    '.hero-break-lg{height:clamp(40px,8vh,120px)}' +
    '.hero-question{font-size:clamp(14px,1.4vw,22px);font-weight:300;color:var(--dim);margin-top:clamp(36px,6vh,80px);letter-spacing:0.02em;max-width:520px;line-height:1.6}' +
    '.slide-cyan{--bk:#27d3cc;background:#27d3cc;color:#1a1a1a}' +
    '.slide-cyan .hero-line{color:#1a1a1a;font-weight:300}' +
    '.slide-cyan .accent,.slide-cyan .hero-line.accent{color:#1a1a1a;opacity:.6}' +
    '.slide-cyan .hero-question{color:rgba(26,26,26,.5);font-weight:300}' +
    '.slide-cyan .footer-logo{filter:brightness(0);opacity:1}' +
    '.slide-cyan .slide-num{color:rgba(26,26,26,.35)}' +
    '.s9-quote{max-width:85vw;text-align:center}' +
    '.s9-quote div{font-size:clamp(16px,2.5vw,36px);font-weight:300;line-height:1.5;letter-spacing:0.02em;margin-bottom:clamp(20px,3vh,48px);color:var(--bone)}' +
    '.s9-author{font-size:clamp(11px,1vw,15px);color:var(--dim);font-weight:400;letter-spacing:.15em;text-transform:uppercase}' +
    '.s9-quote a:hover{color:var(--dim)}' +
    '.img-wrap{display:flex;justify-content:center;align-items:center;width:100%;height:50vh}' +
    '.img-wrap img{max-width:90%;max-height:100%;object-fit:contain;opacity:.85;border-radius:2px}' +
    '.img-wrap video{max-width:90%;max-height:100%;object-fit:contain;opacity:1;border-radius:2px}' +
    '.obs-label{font-size:clamp(10px,.9vw,14px);color:var(--dim);letter-spacing:0.12em;text-transform:uppercase;font-weight:400}' +
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
        if (r.status === 401) { Auth.logout(); showLogin(); throw new Error('unauthorized'); }
        if (!r.ok) throw new Error('api error');
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

  var _blobUrls = [];

  function _revokeUrls() {
    _blobUrls.forEach(function(u) { URL.revokeObjectURL(u); });
    _blobUrls = [];
  }

  function slideHTML(index) {
    var s = slides[index];
    if (!s) return '';
    var base = location.href.substring(0, location.href.lastIndexOf('/') + 1);
    s = s.replace(/class="reveal-step"/g, 'class="reveal-step revealed"');
    return '<!DOCTYPE html><html><head><meta charset="UTF-8"><base href="' + base + '">'
      + '<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;700;900&display=swap" rel="stylesheet">'
      + '<style>' + slideCSS + '</style></head><body>' + s + '</body></html>';
  }

  function renderCurrent(index) {
    var el = document.getElementById('slide-current');
    var html = slideHTML(index);
    if (!html) { el.innerHTML = ''; return; }
    _revokeUrls();
    var blob = new Blob([html], { type: 'text/html' });
    var url = URL.createObjectURL(blob);
    _blobUrls.push(url);
    el.innerHTML = '<iframe src="' + url + '"></iframe>';
  }

  function renderNext(index) {
    var el = document.getElementById('next-preview');
    if (index < 0 || index >= TOTAL_SLIDES) {
      el.innerHTML = '<div id="next-label">SIGUIENTE</div>';
      return;
    }
    var html = slideHTML(index);
    var blob = new Blob([html], { type: 'text/html' });
    var url = URL.createObjectURL(blob);
    _blobUrls.push(url);
    el.innerHTML = '<div id="next-label">SIGUIENTE</div>'
      + '<iframe src="' + url + '" style="width:100%;height:100%;border:none;pointer-events:none"></iframe>';
  }

  /* ──────────────────────────────────────────────
   *  NOTES (parsing notes.md → per-slide cache)
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

  var _aprendizajesContent = '';

  function toggleAprendizajes() {
    var panel = document.getElementById('aprendizajes-panel');
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) {
      document.getElementById('aprendizajes-editor').focus();
    }
  }

  var _aprendizajesDebounce = null;
  function onAprendizajesInput() {
    _aprendizajesContent = document.getElementById('aprendizajes-editor').value;
    if (_aprendizajesDebounce) clearTimeout(_aprendizajesDebounce);
    _aprendizajesDebounce = setTimeout(function() {
      Api.saveAprendizajes(_aprendizajesContent).catch(function() {});
    }, 500);
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
      elSlide.textContent = '+' + String(sMins).padStart(2,'0') + ':' + String(sSecs).padStart(2,'0');
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
    var input = prompt('Duración total en minutos:', totalMinutes || '30');
    if (input === null) return;
    var n = parseFloat(input);
    if (!isNaN(n) && n > 0) {
      totalMinutes = n;
      localStorage.setItem('faro-total-minutes', totalMinutes);
    } else {
      totalMinutes = 0;
      localStorage.removeItem('faro-total-minutes');
      document.getElementById('st-elapsed').classList.remove('is-warn', 'is-danger');
    }
  }

  function setSlideMinutes() {
    var input = prompt('Tiempo sugerido por slide en minutos:', slideMinutes || '2');
    if (input === null) return;
    var n = parseFloat(input);
    if (!isNaN(n) && n > 0) {
      slideMinutes = n;
      localStorage.setItem('faro-slide-minutes', slideMinutes);
    } else {
      slideMinutes = 0;
      localStorage.removeItem('faro-slide-minutes');
      document.getElementById('st-slide-time').classList.remove('is-warn', 'is-danger');
    }
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
   *  NAVIGATION (expuestas globalmente)
   * ────────────────────────────────────────────── */

  function prevSlide() {
    if (!connected) return;
    if (broadcast) broadcast.post('goto', { index: cur - 1 });
  }

  function nextSlide() {
    if (!connected) return;
    if (broadcast) broadcast.post('goto', { index: cur + 1 });
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
      var dy = (e.clientY || e.touches[0].clientY) - startY;
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
    if (e.target.closest('#notes-editor')) return;
    if (e.target.closest('#aprendizajes-editor')) return;
    if (e.target.closest('#login-password')) return;

    switch (e.key) {
      case 'ArrowLeft': case 'ArrowUp': e.preventDefault(); prevSlide(); break;
      case 'ArrowRight': case 'ArrowDown': e.preventDefault(); nextSlide(); break;
      case 'Home': e.preventDefault(); if (broadcast) broadcast.post('goto', { index: 0 }); break;
      case 'End': e.preventDefault(); if (broadcast) broadcast.post('goto', { index: TOTAL_SLIDES - 1 }); break;
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
      case 'p': case 'P': setSlideMinutes(); break;
      case 'b': case 'B':
        blackoutActive = !blackoutActive;
        if (broadcast) broadcast.post('blackout', { active: blackoutActive });
        break;
      case 'Escape':
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
          if (broadcast) broadcast.post('blackout', { active: false });
        }
        break;
    }
  });

  /* ──────────────────────────────────────────────
   *  WHEEL + TOUCH
   * ────────────────────────────────────────────── */

  var _wheelAcc = 0, _wheelDeb = false;
  document.addEventListener('wheel', function(e) {
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
   *  BROADCAST (conexión con index.html)
   * ────────────────────────────────────────────── */

  function initBroadcast() {
    try { broadcast = new BroadcastChannel('gauf-presenter'); } catch(e) {}
    if (!broadcast) return;

    var lastPong = Date.now();

    broadcast.onmessage = function(e) {
      var d = e.data;
      if (d.type === 'init') {
        slides = d.slides || [];
        if (slides.length) {
          hideWaiting();
          cur = -1;
          switchToSlide(d.current || 0);
          lastPong = Date.now();
        }
      }
      if (d.type === 'slideChanged') {
        switchToSlide(d.current);
        lastPong = Date.now();
      }
      if (d.type === 'pong') {
        lastPong = Date.now();
        if (!connected && d.slides && d.slides.length) {
          slides = d.slides;
          hideWaiting();
          cur = -1;
          switchToSlide(d.current || 0);
        }
      }
    };

    setInterval(function() {
      if (connected) broadcast.post('ping', {});
      if (connected && Date.now() - lastPong > 5000) { showWaiting(); }
    }, 2500);
  }

  /* ──────────────────────────────────────────────
   *  INIT
   * ────────────────────────────────────────────── */

  function initApp() {
    loadRatio();
    totalMinutes = parseFloat(localStorage.getItem('faro-total-minutes')) || 0;
    slideMinutes = parseFloat(localStorage.getItem('faro-slide-minutes')) || 0;

    document.getElementById('notes-editor').addEventListener('input', onNotesInput);
    document.getElementById('aprendizajes-editor').addEventListener('input', onAprendizajesInput);

    initDrag();
    initBroadcast();

    /* Load notes + aprendizajes from API */
    Api.getNotes().then(function(data) {
      notesCache = parseNotes(data.content || '');
      if (cur >= 0) document.getElementById('notes-editor').value = getNotesForSlide(cur);
    }).catch(function() {});

    Api.getAprendizajes().then(function(data) {
      _aprendizajesContent = data.content || '';
      document.getElementById('aprendizajes-editor').value = _aprendizajesContent;
    }).catch(function() {});

    window.addEventListener('resize', applyRatio);

    /* Initial state: waiting for presentation */
    showWaiting();
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
   *  EXPOSE GLOBALS (para onclick HTML)
   * ────────────────────────────────────────────── */

  window.Faro = {
    prev: prevSlide,
    next: nextSlide,
    toggleHelp: toggleHelp,
    toggleAprendizajes: toggleAprendizajes,
  };
})();
