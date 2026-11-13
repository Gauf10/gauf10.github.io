/* ════════════════════════════════════════════════════════════
   GAUF · modo claro / oscuro común a todo gaufgang.com
   ─ Cargar en el <head>, antes de los estilos:
       <script src="/theme.js"></script>
   ─ Pone data-theme="light" | "dark" en <html>.
     La elección se guarda (clave "gauf-theme") y vale para todas las páginas.
     Si nunca se eligió, sigue la preferencia del sistema.
   ─ Botón: si la página tiene un elemento con  data-theme-slot,
     el botón se agrega ahí; si no, queda flotando abajo a la izquierda.
   ─ Cada página define sus colores oscuros en  :root[data-theme="dark"]{…}
   ════════════════════════════════════════════════════════════ */
(function () {
  var KEY = 'gauf-theme';
  var root = document.documentElement;

  function saved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function system() { return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
  function current() { return root.getAttribute('data-theme') || 'light'; }

  function apply(t) {
    root.setAttribute('data-theme', t);
    var btns = document.querySelectorAll('.gauf-theme-btn');
    for (var i = 0; i < btns.length; i++) {
      btns[i].textContent = t === 'dark' ? '☀' : '◑';
      btns[i].setAttribute('aria-label', t === 'dark' ? 'Pasar a modo claro' : 'Pasar a modo oscuro');
      btns[i].title = btns[i].getAttribute('aria-label');
    }
    try { document.dispatchEvent(new CustomEvent('gauf-theme', { detail: t })); } catch (e) {}
  }

  function toggle() {
    var t = current() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(KEY, t); } catch (e) {}
    apply(t);
  }

  apply(saved() || system());

  /* si no hay elección guardada, acompaña los cambios del sistema */
  if (window.matchMedia) {
    var mq = matchMedia('(prefers-color-scheme: dark)');
    var onChange = function () { if (!saved()) apply(system()); };
    if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);
  }

  function mountButton() {
    if (document.querySelector('[data-theme-manual]')) return;   /* la página dibuja su propio botón */
    var slots = document.querySelectorAll('[data-theme-slot]');
    function make(floating) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'gauf-theme-btn' + (floating ? ' gauf-theme-float' : '');
      b.onclick = toggle;
      return b;
    }
    if (slots.length) for (var i = 0; i < slots.length; i++) slots[i].appendChild(make(false));
    else document.body.appendChild(make(true));
    var st = document.createElement('style');
    st.textContent =
      '.gauf-theme-btn{background:none;border:1px solid currentColor;color:inherit;border-radius:50%;width:30px;height:30px;' +
      'display:inline-flex;align-items:center;justify-content:center;font-size:14px;line-height:1;cursor:pointer;opacity:.75;padding:0;flex:none}' +
      '.gauf-theme-btn:hover{opacity:1}' +
      '.gauf-theme-float{position:fixed;left:16px;bottom:16px;z-index:9000;width:40px;height:40px;' +
      'background:var(--bg,#F5F2EC);color:var(--ink,#1A1A1A);border-color:rgba(127,127,127,.35)}';
    document.head.appendChild(st);
    apply(current());
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountButton);
  else mountButton();

  window.GaufTheme = { toggle: toggle, get: current, set: function (t) { try { localStorage.setItem(KEY, t); } catch (e) {} apply(t); } };
})();
