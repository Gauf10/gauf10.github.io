# Guía para crear una nueva charla

Proceso paso a paso para replicar el sistema en una nueva presentación.

---

## 1. Copiar la carpeta base

Duplicar `buen-rumbo/` con el nuevo nombre:

```
charlas/
  nueva-charla/
    assets/
      GAUF SVG Accent.svg    ← copiar de buen-rumbo/assets/
    faro.css                 ← copiar de buen-rumbo/
    faro.js                  ← copiar de buen-rumbo/
    broadcast.js             ← copiar de buen-rumbo/
    favicon.ico              ← copiar de buen-rumbo/
    index.html               ← editar
    faro.html                ← editar mínimo
```

Si hay logo institucional, copiarlo también en `assets/`.

---

## 2. Editar `index.html` — ajustes obligatorios

### Head
```html
<title>TÍTULO — Gabriel Aufgang</title>
```

### Variables de slide
Al final del JS, ajustar:
```js
var TOTAL = 11;  // cantidad de slides (0-indexed, contar los divs .slide)
var DUR = 1200;  // ms — velocidad de todas las animaciones
```

### Logo institucional (top-right)
```html
<!-- En cada slide, dentro de .si-footer: -->
<img src="assets/logo-evento.svg" class="footer-logo-circle" alt="Evento">
```

Para sacarlo: eliminar la línea. Para cambiar tamaño, en el CSS:
```css
.footer-logo-circle {
  height: clamp(23px, 2.9vw, 41px);
  max-width: clamp(60px, 7.2vw, 108px);
}
```

### Slide de cierre (último slide)
```html
<a href="https://gaufgang.com/" style="color:inherit;text-decoration:none">gaufgang.com</a>
```

---

## 3. Estructura de un slide

### Slide básico con texto central
```html
<div class="slide" id="s0">
  <div class="si">
    <div class="si-content">
      <div class="hero">
        <div class="hero-line">Texto principal</div>
        <div class="hero-line accent">Subtítulo en cyan</div>
      </div>
    </div>
    <div class="si-footer">
      <img src="assets/GAUF SVG Accent.svg" class="footer-logo" alt="GAUF">
      <img src="assets/logo-evento.svg" class="footer-logo-circle" alt="Evento">
    </div>
  </div>
  <div class="slide-num">1</div>
</div>
```

### Slide con reveal progresivo (items que aparecen uno a uno)
```html
<div class="slide" id="s1">
  <div class="si">
    <div class="si-content">
      <div class="sec-label">Etiqueta de sección</div>
      <div class="reveal-steps">
        <div class="reveal-step">Primer item</div>
        <div class="reveal-step">Segundo item</div>
        <div class="reveal-step">Tercer item</div>
      </div>
    </div>
    <div class="si-footer">...</div>
  </div>
  <div class="slide-num">2</div>
</div>
```

> Los `.reveal-step` arrancan con `opacity:0` y se revelan automáticamente al entrar al slide, uno por uno, con intervalo `DUR+100ms`.

### Slide con flechas entre items (lista tipo framework)
```html
<div class="reveal-steps">
  <div class="reveal-step">Problema</div>
  <div class="fw-arr">↓</div>
  <div class="reveal-step">Diagnóstico</div>
  <div class="fw-arr">↓</div>
  <div class="reveal-step">Solución</div>
</div>
```

### Slide cyan (contraste, énfasis)
```html
<div class="slide slide-cyan" id="s7">
  <div class="si">
    <div class="si-content">
      <div class="hero">
        <div class="hero-line">Frase de cierre de bloque</div>
      </div>
    </div>
    <div class="si-footer">
      <img src="assets/GAUF SVG Accent.svg" class="footer-logo" alt="GAUF">
    </div>
  </div>
  <div class="slide-num">8</div>
</div>
```

> En slides cyan el texto y los logos se vuelven negros automáticamente via CSS.

### Accent en palabras clave
```html
<div class="hero-line">Validar la <span class="accent">hipótesis</span></div>
```

### Slide de cierre estándar
```html
<div class="slide" id="s10">
  <div class="si">
    <div class="si-content">
      <div class="hero">
        <div class="hero-line" style="font-size:clamp(18px,2.4vw,34px);opacity:.5">
          Texto de despedida
        </div>
      </div>
    </div>
    <div class="si-footer">
      <div style="position:absolute;bottom:clamp(16px,3vh,40px);left:var(--pad)">
        <div style="font-size:clamp(10px,.9vw,14px);color:var(--dim);letter-spacing:.12em;text-transform:uppercase">
          GRACIAS
        </div>
      </div>
      <img src="assets/GAUF SVG Accent.svg" class="footer-logo" alt="GAUF">
      <div class="s-author">
        GABRIEL AUFGANG<br>
        <span style="color:var(--accent)">
          <a href="https://gaufgang.com/" style="color:inherit;text-decoration:none">gaufgang.com</a>
        </span>
      </div>
    </div>
  </div>
  <div class="slide-num">11</div>
</div>
```

---

## 4. Dots de navegación

Un `.dot` por slide, en orden, al comienzo del `<body>`:

```html
<div id="nd">
  <div class="dot on" onclick="goTo(0)"></div>
  <div class="dot" onclick="goTo(1)"></div>
  <!-- ... uno por slide ... -->
</div>
```

---

## 5. Editar `faro.html` — ajustes mínimos

Solo cambiar el título:
```html
<title>FARO — Nueva charla</title>
```

El logo de la pantalla de espera en `faro.html` usa `assets/faro.png` (exp-humanas). Si no existe en la nueva carpeta, simplemente eliminá las líneas:
```html
<img src="assets/faro.png" ...>
```
o copiá el archivo desde `exp-humanas/assets/`.

---

## 6. Editar `faro.js` — ajustes obligatorios

Al inicio del archivo, dos constantes:

```js
var CHARLA_NAME = 'Nombre de la charla';  // debe coincidir con la config del servidor (si hay)
var TOTAL_SLIDES = 11;                     // misma cantidad que TOTAL en index.html
```

---

## 7. Notas y aprendizajes

Todo se guarda automáticamente en el servidor (`faro-api.gauf10.workers.dev`) como archivos `.md`, sin botones ni pasos manuales.

**Notas (`notas.md`):**
- Se escriben en el textarea de FARO, slide por slide.
- Se guardan al servidor con debounce de 500ms tras cada keystroke.
- Se cargan desde el servidor al abrir FARO.
- Formato en el servidor:
```markdown
# s0
Disparador para el slide 0.

# s2
Disparador para el slide 2.
Los slides sin notas no aparecen.
```

**Aprendizajes (`aprendizajes.md`):**
- Se escriben en el panel lateral (tecla `A`).
- Se guardan al servidor con debounce de 800ms.
- Se cargan desde el servidor al abrir FARO.
- Formato en el servidor:
```markdown
# Aprendizajes — Nombre de la charla

## Qué funcionó

...

## Qué cambiaría

...
```

> El API requiere autenticación con la misma contraseña que el login de FARO. Si FARO no tiene login configurado en el servidor, las llamadas fallan silenciosamente pero la sesión sigue funcionando.

---

## 8. Tipografía responsive — referencia rápida

| Uso | `clamp()` aprox. |
|-----|-----------------|
| Título hero grande | `clamp(28px, 5vw, 72px)` |
| Cuerpo / reveal items | `clamp(18px, 3.2vw, 44px)` |
| Reveal items pequeños | `clamp(15px, 2.6vw, 36px)` |
| Subtítulo / sec-label | `clamp(10px, 0.9vw, 14px)` |
| Slide number | `clamp(8px, 0.7vw, 11px)` |

---

## 9. Checklist antes de presentar

- [ ] `TOTAL` en `index.html` coincide con cantidad de slides
- [ ] `TOTAL_SLIDES` en `faro.js` ídem
- [ ] Dots en `index.html` coinciden con cantidad de slides
- [ ] Slide numbers (`.slide-num`) correlativos
- [ ] IDs de slides: `s0`, `s1`, ... `sN`
- [ ] Favicon en carpeta
- [ ] Logo institucional en `assets/` y ruta correcta
- [ ] URL de cierre apunta a `gaufgang.com`
- [ ] Probar apertura de `index.html` + `faro.html` en Chrome (misma ventana, pestañas distintas)
- [ ] Verificar que los logos se ven en FARO (Shadow DOM activo)
- [ ] Probar flechas del teclado con cursor en notas (no deben cambiar de slide)
