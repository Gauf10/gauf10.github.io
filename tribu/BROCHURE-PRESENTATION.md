# Brochure Presentation — Code Reference

Presentación vertical de pantalla completa con transiciones suaves, ideal para conferencias, keynotes o pitches. Sin dependencias externas (solo Google Fonts).

---

## Índice

1. [Estructura HTML](#1-estructura-html)
2. [CSS — Variables y sistema visual](#2-css--variables-y-sistema-visual)
3. [Transiciones](#3-transiciones)
4. [JavaScript — Navegación](#4-javascript--navegación)
5. [Revelación progresiva](#5-revelación-progresiva)
6. [Auto-reveal por tiempo](#6-auto-reveal-por-tiempo)
7. [Numeración de páginas](#7-numeración-de-páginas)
8. [Slides cyan (fondo distinto)](#8-slides-cyan-fondo-distinto)
9. [Logos](#9-logos)
10. [Videos](#10-videos)

---

## 1. Estructura HTML

Cada slide es un `<div class="slide">` dentro de un contenedor `#deck`. El orden en el DOM es el orden de presentación.

```html
<div id="deck">

  <div class="slide is-active" id="s0">
    <div class="si">
      <div class="si-content">
        <div class="hero">
          <div class="hero-line">Texto principal</div>
          <div class="hero-line accent">Texto destacado</div>
        </div>
      </div>
      <!-- logo opcional -->
      <div class="si-footer">
        <img src="logo.svg" alt="" class="footer-logo">
      </div>
    </div>
  </div>

  <!-- más slides... -->

</div>
```

### Componentes de un slide

| Elemento | Rol |
|---|---|
| `.slide` | Contenedor absoluto de 100×100 viewport. Solo uno visible a la vez. |
| `.si` | Capa interna con padding, flex column. |
| `.si-content` | Área de contenido principal (texto, imágenes, video). Se centra verticalmente. |
| `.hero` | Bloque de texto centrado. |
| `.hero-line` | Línea de texto con tipografía base. |
| `.hero-line.accent` | Línea en color de acento. |
| `.hero-break` | Espaciador vertical. |
| `.img-wrap` | Contenedor para imagen o video (50vh de alto). |
| `.obs-label` | Etiqueta pequeña para "Observación N". |
| `.footer-logo-circle` | Logo secundario, esquina superior derecha. |
| `.si-footer` | Pie de slide, centrado. |

---

## 2. CSS — Variables y sistema visual

```css
:root {
  --bk: #1a1a1a;           /* fondo general */
  --accent: #27d3cc;        /* color de acento (cyan en este caso) */
  --bone: #f5f2ec;          /* color de texto */
  --dim: rgba(245,242,236,.4);   /* texto secundario */
  --dim2: rgba(245,242,236,.12); /* bordes/separadores */
  --pad: clamp(40px,7vw,100px);  /* padding lateral */
}
```

### Tipografía

```css
body {
  font-family: 'Archivo', sans-serif;
  font-weight: 300;          /* base light */
  letter-spacing: 0.04em;
  line-height: 1.5;
}
.hero-line {
  font-size: clamp(18px, 3.2vw, 44px);
}
```

### Clases de texto

- `.hero` — contenedor centrado, `max-width: 88vw`
- `.hero-line` — línea de texto base
- `.hero-line.accent` — texto en color de acento
- `.accent` — cualquier elemento en color de acento
- `.hero-break` — espaciador: `clamp(0px, 4vh, 60px)`
- `.hero-break-lg` — espaciador grande: `clamp(40px, 8vh, 120px)`
- `.reveal-step` — elemento que aparece progresivamente
- `.obs-label` — etiqueta de observación: `clamp(10px, .9vw, 14px)`

### Slides con fondo distinto (cyan)

```css
.slide-cyan {
  --bk: #27d3cc;
  background: #27d3cc;
  color: #1a1a1a;
}
.slide-cyan .hero-line { color: #1a1a1a; }
.slide-cyan .accent { color: #1a1a1a; opacity: .6; }
.slide-cyan .footer-logo { filter: brightness(0); opacity: 1; }
.slide-cyan .slide-num { color: rgba(26,26,26,.35); }
```

---

## 3. Transiciones

### Transición normal (mismo fondo)

El contenido hace fade out / fade in. Los logos y número de página **cortan** (aparecen/desaparecen al medio de la transición).

```
 0ms ── contenido actual fade out ──→ 900ms ── contenido nuevo fade in ──→ 1800ms
                                        ↑
                              logos cortan (cambio de slide activo)
```

### Transición a/desde slide cyan (fondo distinto)

El slide completo (incluyendo logos y número) hace fade out / fade in, para que el cambio de color de fondo sea suave.

```
 0ms ── slide actual fade out ──→ 900ms ── slide nuevo fade in ──→ 1800ms
         (todo: fondo, logos, texto)         (todo: fondo, logos, texto)
```

### Código de navegación (resumido)

```js
// Transición normal (mismo fondo):
tsC.style.opacity = '0';           // contenido nuevo oculto
csC.style.transition = 'opacity .9s ease';
csC.style.opacity = '0';           // contenido actual se desvanece

// A los 900ms:
cs.classList.remove('is-active');  // logos actuales se ocultan
cs.classList.add('is-gone');
ts.classList.remove('is-gone');    // logos nuevos aparecen
ts.classList.add('is-active');
tsC.style.transition = 'opacity .9s ease';
tsC.style.opacity = '1';           // contenido nuevo aparece

// Transición cyan (fondo distinto):
ts.style.opacity = '0';            // slide nuevo oculto
cs.style.transition = 'opacity .9s ease';
cs.style.opacity = '0';            // slide actual se desvanece (todo)

// A los 900ms:
ts.style.transition = 'opacity .9s ease';
ts.style.opacity = '1';            // slide nuevo aparece (todo)
```

---

## 4. JavaScript — Navegación

### Variables globales

```js
var cur = 0;           // slide actual (0-indexed)
var TOTAL = 24;        // cantidad total de slides
var animating = false; // bloquea durante transición
var autoTimer = null;  // timer para auto-reveal
```

### Navegación

```js
function getSlide(i) { return document.querySelectorAll('.slide')[i]; }

function goTo(n) { /* ver sección de transiciones */ }
function next() { goTo(cur + 1); }
function prev() { goTo(cur - 1); }
```

### Inputs de usuario

- **Teclado**: flechas, PageUp/PageDown, Home/End
- **Scroll**: rueda del mouse (threshold 60px)
- **Touch**: swipe vertical (threshold 45px)
- **Click**: en slides con `.reveal-steps` avanza un paso de revelación

### Dots de navegación

```html
<div id="nd">
  <div class="dot" onclick="goTo(0)"></div>
  <div class="dot" onclick="goTo(1)"></div>
  <!-- ... uno por slide -->
</div>
```

```js
function updateDots() {
  dots.forEach(function(d, i) { d.classList.toggle('on', i === cur); });
}
```

---

## 5. Revelación progresiva

Para slides donde las palabras aparecen una a una al hacer clic/avanzar:

```html
<div class="hero reveal-steps">
  <div class="hero-line">Palabra siempre visible</div>
  <div class="reveal-step">Segunda palabra</div>
  <div class="reveal-step">Tercera palabra</div>
</div>
```

```css
.reveal-step {
  opacity: 0;
  transition: opacity .8s ease, transform .8s ease;
  transform: translateY(8px);
}
.reveal-step.revealed { opacity: 1; transform: translateY(0); }
```

**Comportamiento**:
- Al hacer clic en el slide o presionar ↓, se revela el primer `.reveal-step` oculto
- Si todos están revelados, avanza al siguiente slide
- Al navegar a otro slide, se resetean todos los pasos

---

## 6. Auto-reveal por tiempo

Los slides con `.reveal-steps` pueden auto-revelarse al llegar:

```js
// Al llegar a un slide con reveal-steps (después de la transición):
var steps = rs.querySelectorAll('.reveal-step');
var delay = 2400 / steps.length;  // 2.4s total para completar

(function loop(i) {
  if (i >= steps.length) return;
  autoTimer = setTimeout(function() {
    steps[i].classList.add('revealed');
    loop(i + 1);
  }, delay);
})(0);
```

Al navegar a otro slide se cancela el timer y se resetean los pasos.

---

## 7. Numeración de páginas

Se inyecta automáticamente al cargar:

```js
document.querySelectorAll('.slide').forEach(function(s, i) {
  var e = document.createElement('span');
  e.className = 'slide-num';
  e.textContent = String(i + 1).padStart(2, '0');
  s.querySelector('.si').appendChild(e);
});
```

```css
.slide-num {
  position: absolute;
  bottom: clamp(16px, 3vh, 40px);
  left: var(--pad);
  font-size: clamp(8px, .7vw, 11px);
  color: rgba(245,242,236,.25);
  font-weight: 300;
  letter-spacing: .04em;
  pointer-events: none;
  z-index: 3;
}
```

---

## 8. Slides cyan (fondo distinto)

Se usa cuando el slide necesita un fondo de color diferente al general.

```html
<div class="slide slide-cyan" id="s...">
  ...
</div>
```

**Efectos**:
- La transición hacia/desde este slide usa fade completo (todo el slide, no solo contenido)
- El logo principal (`.footer-logo`) se vuelve negro con `filter: brightness(0)`
- El número de página cambia a gris oscuro
- Los acentos (` .accent`) se vuelven negro semi-transparente

---

## 9. Logos

### Logo secundario (esquina superior derecha)

```html
<img src="logo.svg" alt="" class="footer-logo-circle">
```

```css
.footer-logo-circle {
  position: absolute;
  top: clamp(16px, 3vh, 40px);
  right: var(--pad);
  height: clamp(39px, 4.8vw, 68px);
  width: clamp(39px, 4.8vw, 68px);
  object-fit: contain;
  opacity: 1;
  z-index: 3;
}
```

### Logo principal (pie de slide, centrado)

```html
<div class="si-footer">
  <img src="logo.svg" alt="" class="footer-logo">
</div>
```

```css
.footer-logo {
  height: clamp(13px, 1.76vw, 26px);
  width: auto;
  opacity: 1;
}
```

---

## 10. Videos

```html
<div class="img-wrap">
  <video src="video.mp4" controls playsinline></video>
</div>
```

- Volumen por defecto al 50%: `document.querySelectorAll('.img-wrap video').forEach(function(v) { v.volume = 0.5; });`
- Sin autoplay ni loop — el usuario controla la reproducción.
- Opacidad del video: 1 (los controles deben verse bien).

---

## Personalización

| Variable/Lugar | Qué cambiar |
|---|---|
| `--bk` | Color de fondo general |
| `--accent` | Color de acento |
| `--bone` | Color de texto |
| `--dim` | Texto secundario |
| Google Fonts URL | Tipografía (reemplazar `Archivo`) |
| `TOTAL` | Cantidad de slides |
| `transition: opacity .9s ease` | Duración/curva de transición |
| `2400` en auto-reveal | Tiempo total de revelación (ms) |
| `clamp(...)` en `.footer-logo-circle` | Tamaño del logo |
| `clamp(...)` en `.footer-logo` | Tamaño del logo de pie |

---

## Archivos del proyecto

- `index.html` — presentación completa (24 slides)
- `index2.html` — copia con transición por fundido encadenado (usada como referencia de transiciones)
- `BROCHURE-PRESENTATION.md` — esta guía
