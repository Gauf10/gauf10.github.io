// ============================================================
//  app.js — Preguntas que me hago a diario
//
//  Las preguntas viven en preguntas.json (servidor). Cualquier
//  visitante las lee con fetch(). El panel Admin permite
//  editarlas: se entra con la contraseña de FARO y el guardado
//  lo hace el worker faro-api (el token de GitHub vive en
//  Cloudflare, nunca en este código ni en el navegador).
// ============================================================
const API_BASE = 'https://faro-api.gauf10.workers.dev';
let adminToken = null;

let preguntas = [];
let preguntaActualIndex = -1;

// ------------------------------------------------------------
//  Carga inicial de preguntas desde el servidor
// ------------------------------------------------------------
async function cargarPreguntas() {
  try {
    const res = await fetch('preguntas.json?_=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    preguntas = await res.json();
  } catch (err) {
    console.warn('app.js: no se pudo cargar preguntas.json', err);
    preguntas = ['¿Qué recibí hoy?']; // fallback mínimo si falla la carga
  }
  mostrarPreguntaAleatoria();
}

// ------------------------------------------------------------
//  Muestra una pregunta al azar (evita repetir la actual)
// ------------------------------------------------------------
function mostrarPreguntaAleatoria() {
  const el = document.getElementById('pregunta');
  el.style.opacity = 0;

  setTimeout(() => {
    let idx;
    do {
      idx = Math.floor(Math.random() * preguntas.length);
    } while (preguntas.length > 1 && idx === preguntaActualIndex);

    preguntaActualIndex = idx;
    el.textContent = preguntas[idx];
    el.style.opacity = 1;
  }, 250);
}

// ------------------------------------------------------------
//  Escribir — autoguardado en LocalStorage, sin backend
// ------------------------------------------------------------
function claveHoy() {
  return 'diario-' + new Date().toISOString().slice(0, 10);
}

function toggleEscribir() {
  const box = document.getElementById('escribir-box');
  const visible = box.style.display === 'block';
  box.style.display = visible ? 'none' : 'block';

  if (!visible) {
    const guardado = localStorage.getItem(claveHoy());
    document.getElementById('textarea-diario').value = guardado || '';
  }
}

// ------------------------------------------------------------
//  Admin — edición de preguntas vía GitHub Contents API
// ------------------------------------------------------------
async function abrirAdmin() {
  if (!adminToken) {
    const pass = prompt('Contraseña (la misma de FARO):');
    if (pass === null) return;
    try {
      const res = await fetch(API_BASE + '/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ charla: 'preguntas', password: pass })
      });
      if (!res.ok) throw new Error('bad');
      adminToken = (await res.json()).token;
    } catch (e) {
      alert('Contraseña incorrecta.');
      return;
    }
  }
  document.getElementById('admin-panel').style.display = 'flex';
  document.getElementById('admin-textarea').value = preguntas.join('\n');
  document.getElementById('admin-status').textContent = '';
}

function cerrarAdmin() {
  document.getElementById('admin-panel').style.display = 'none';
}

async function guardarPreguntas() {
  const texto = document.getElementById('admin-textarea').value;
  const nuevas = texto
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (nuevas.length === 0) {
    alert('Debe haber al menos una pregunta.');
    return;
  }

  const status = document.getElementById('admin-status');
  status.textContent = 'Guardando...';

  try {
    const putRes = await fetch(API_BASE + '/api/preguntas', {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + adminToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ preguntas: nuevas })
    });

    if (putRes.status === 401) {
      adminToken = null;
      throw new Error('La sesión venció. Cerrá y volvé a entrar.');
    }
    if (!putRes.ok) {
      const err = await putRes.json().catch(() => ({}));
      throw new Error(err.message || ('HTTP ' + putRes.status));
    }

    preguntas = nuevas;
    status.textContent = '✓ Guardado. Puede tardar ~1 minuto en verse reflejado (GitHub Pages).';
    mostrarPreguntaAleatoria();
  } catch (err) {
    status.textContent = '✗ Error: ' + err.message;
  }
}

// ------------------------------------------------------------
//  Nav mobile (igual a la home)
// ------------------------------------------------------------
function closeMobile() {
  document.getElementById('nav-mobile').classList.remove('open');
  document.getElementById('burger').classList.remove('open');
}

// ------------------------------------------------------------
//  Inicialización
// ------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  cargarPreguntas();

  document.getElementById('textarea-diario').addEventListener('input', (e) => {
    localStorage.setItem(claveHoy(), e.target.value);
  });

  document.getElementById('footer-year').textContent = new Date().getFullYear();

  document.getElementById('burger').addEventListener('click', function () {
    this.classList.toggle('open');
    document.getElementById('nav-mobile').classList.toggle('open');
  });

  // Cursor custom (igual a la home)
  const cursor = document.getElementById('cursor');
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });
  document.querySelectorAll('a, button, summary').forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
});
