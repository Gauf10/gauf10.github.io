# Charlas GAUF — Sistema de presentaciones

Presentaciones en HTML puro para sesiones en vivo. Sin build tools, sin dependencias instalables. Se abre directo desde el navegador.

## Estructura

```
charlas/
  exp-humanas/      ← charla: Experiencias Humanas
  buen-rumbo/       ← charla: ¿Vamos bien?
  faro.css          ← estilos compartidos del presenter console
```

Cada carpeta de charla contiene:

```
mi-charla/
  index.html        ← presentación (pantalla del público)
  faro.html         ← presenter console (pantalla del presentador)
  faro.js           ← lógica del presenter console
  faro.css          ← estilos del presenter console (symlink o copia)
  broadcast.js      ← comunicación entre pestañas (localStorage)
  favicon.ico
  assets/
    GAUF SVG Accent.svg
    logo-institucional.svg   ← logo del evento/organización (opcional)
```

---

## Cómo usar

1. Abrir `index.html` en Chrome — esta es la pantalla que ve el público (proyector / pantalla compartida).
2. Abrir `faro.html` en otra pestaña del mismo navegador — esta es la consola del presentador.
3. FARO detecta la presentación automáticamente vía `localStorage`.
4. Navegar con flechas ← → o desde FARO.

> Funciona desde `file://` sin servidor local. No requiere internet (salvo la fuente Archivo de Google Fonts).

---

## Controles de presentación

| Tecla | Acción |
|-------|--------|
| ← → / ↑ ↓ | Slide anterior / siguiente |
| PageUp / PageDown | Ídem |
| N | Mostrar / ocultar notas |
| + / - | Tamaño de texto de notas |
| F | Pantalla completa |
| T | Reiniciar cronómetro |
| S | Configurar duración total |
| P | Objetivo de tiempo por slide |
| A | Abrir / cerrar aprendizajes |
| B | Pantalla negra para la audiencia |
| Esc | Salir de ayuda / blackout |

> Las flechas no cambian de slide mientras se editan las notas en FARO.

---

## Lenguaje visual

- **Tipografía:** Archivo (Google Fonts) — pesos 300, 400, 700, 900
- **Fondo:** `#1a1a1a`
- **Texto:** `#f5f2ec`
- **Accent:** `#27d3cc`
- **Padding responsive:** `clamp(40px, 7vw, 100px)`
- **Logo GAUF:** footer centro, blanco con dot accent cyan en la A
- **Logo institucional:** top-right, reducido ~40%, filtro brightness(0) en slides cyan

---

## Animaciones

Todas las transiciones usan una única variable `DUR` en `index.html`:

```js
var DUR = 1200; // ms
```

- Slides no-cyan: fade out → fade in encadenado
- Slides cyan: ambos fades simultáneos
- Reveal steps: primera entrada a DUR*1.2ms, siguientes cada DUR+100ms
- CSS: `transition: opacity 1.2s ease` en `.reveal-step`

Para cambiar toda la velocidad: modificar `DUR` y el valor en el CSS (deben coincidir).

---

## Charlas existentes

| Carpeta | Título | Evento |
|---------|--------|--------|
| `exp-humanas` | Diseñar desde la experiencia humana | — |
| `buen-rumbo` | ¿Vamos bien? Cómo saber si tu proyecto tiene buen rumbo | ETH Lima Hackathon 2026 |
