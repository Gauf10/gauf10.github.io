# GAUF · Crear posibilidades

Guía de 7 páginas A4. Una sola fuente: `index.html` es a la vez la página web y el original del PDF.

## Estructura de `/guia/`

```
guia/
├── index.html                          ← landing de captación (pública)
├── gauf_guia_para_crear_posibilidades.pdf
├── og_guia.png                         ← imagen Open Graph 1200×630
├── assets/                             ← fuentes y logo compartidos
└── gauf_guia_para_crear_posibilidades/ ← este documento
    ├── index.html                      ← la guía completa (web + PDF)
    ├── build.ps1
    └── ...
```

La guía vive en un subdirectorio; la landing ocupa la raíz de `/guia/` porque es la URL que se difunde. El favicon y el logo se reutilizan de `/images/`, no están duplicados.

## Cómo funciona el formulario

Al enviarlo:

1. El formulario hace un `POST` a la Edge Function **`registrar-descarga`** de Supabase.
2. La función valida, guarda el registro en la tabla privada `public.guide_downloads` y, **solo si `newsletter_consent === true`**, da de alta en MailerLite (grupo TRAMA INVISIBLE).
3. Si la respuesta es exitosa, se muestra la confirmación y **se descarga el PDF** en una pestaña nueva.

```
Landing  →  Edge Function registrar-descarga  →  Supabase (guide_downloads)
                                              └→  MailerLite (solo si tildó)
```

La descarga **no depende del newsletter**: alguien sin tildar la casilla recibe la guía igual y queda registrado como `newsletter_consent = false`.

La función vive en Supabase, no en este repositorio. Acá solo está la URL pública.

### Lo único configurable en el frontend

```js
var CONFIG = {
  endpoint: 'https://qjahvfyixsuljtxqipbs.supabase.co/functions/v1/registrar-descarga',
  guideUrl: 'https://gaufgang.com/guia/gauf_guia_para_crear_posibilidades.pdf',
  fallbackEmail: 'hablemos@gaufgang.com'
};
```

No hay credenciales: ni anon key, ni service_role, ni API key de MailerLite. Todo eso vive del lado del servidor.

Si la función falla, el formulario muestra un mensaje amigable, deja reintentar y ofrece el PDF por enlace directo. No finge un alta que no ocurrió.

## Eventos de GA4

La landing usa el mismo `../analytics.js` que el resto del sitio y emite:

| Evento | Cuándo |
|---|---|
| `generate_lead` | Registro exitoso. Incluye `consentimiento`, `utm_source`, `utm_medium`, `utm_campaign`. |
| `guide_download` | Se descarga el PDF. `ubicacion` indica desde dónde. |
| `form_error` | Falló el alta (`motivo`: `rechazado` o `conexion`). |
| `scroll_25/50/75/90`, `time_on_page`, `social_click`, `external_link_click` | Vienen de `analytics.js`. |

El Measurement ID es el mismo del sitio: `G-NF0X4QWTN6`.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | Documento completo. Web responsive + 7 páginas A4 para impresión. |
| `../gauf_guia_para_crear_posibilidades.pdf` | PDF final. A4, fuentes embebidas, metadatos. |
| `build.ps1` | Regenera el PDF (lo escribe en la carpeta padre). |
| `../assets/gauf-logo.svg` | Logo oficial, recoloreable vía `currentColor`. |
| `../assets/fonts/` | Inter 400 y 700 (woff2, self-hosted). |
| `../images/favicon.ico` | Favicon del sitio (compartido con la home). |
| `revision-ortografica.md` | Detalle de la revisión de idioma. |
| `crear_posibilidades_gauf_v1.pdf` | Original. No se toca. |
| `GAUF · CREAR POSIBILIDADES.md` | Especificaciones. No se toca. |

## Regenerar el PDF

```powershell
powershell -ExecutionPolicy Bypass -File .\build.ps1
```

Necesita Google Chrome. Si además hay Python con `pymupdf`, el script normaliza el PDF a A4 exacto y le pone los metadatos.

También se puede imprimir a mano: `Ctrl+P` → A4 → sin márgenes → gráficos de fondo activados.

## Sistema de diseño

Medido del PDF original para no reinterpretarlo.

| Token | Valor |
|---|---|
| Página | A4 · 210 × 297 mm |
| Fondo hueso | `#F5F2EC` |
| Recuadros | `#E8E4DC` + barra `#27D3CC` de 3 pt |
| Acento | `#27D3CC` |
| Tinta | `#1A1A1A` |
| Gris | `#66645F` |
| Columna | 68,4 pt izq. / 63,8 pt der. |
| Cabecera y pie | 51 pt de margen |
| Cuerpo | 10,5 pt / 15,5 pt |
| Titulares | 25 pt / 29 pt |
| Portada | 42 pt / 16 pt / 11,5 pt / 8,5 pt |
| Folio | 7,5 pt · número centrado 8 pt |

Tipografía: **Inter**. El original usaba Helvetica; la especificación pide Inter.

## Cómo está armado

- Cada página es un `<section class="page">` de 210 × 297 mm con `break-after: page`. Chrome lo imprime una página por hoja.
- El logo es el SVG original inlineado como `<symbol>`, con `currentColor` en el wordmark y `var(--gauf-accent)` en el contra de la A. De ahí salen las dos variantes:
  - Páginas cyan (1 y 7): todo negro `#1A1A1A`.
  - Páginas hueso: negro con el contra en cyan.
- En pantalla las páginas se apilan con sombra. Bajo 880 px se vuelven un bloque fluido: se quitan las alturas fijas y el pie pasa a cerrar cada sección.
- `@media print` no hereda nada del layout de pantalla.

## Contenido

| Pág. | Qué tiene |
|---|---|
| 1 | Portada cyan. Logo, título, bajada, invitación y firma. **Sin pie.** |
| 2 | Introducción + principio 01 |
| 3 | Principio 02 |
| 4 | Principio 03 |
| 5 | Principios 04 y 05 |
| 6 | Cierre y «Sobre GAUF» |
| 7 | Contraportada cyan. «Gracias» al centro, y en el pie `gaufgang.com` + logo. **Sin bajada.** |

Los cinco principios comparten el mismo encabezado: número en cyan, un espacio, título en negro, sin barra y en caja baja.

La bajada «Una guía para conectar con otros y lograr nuevos caminos» aparece solo en los pies de las páginas interiores (2 a 6).
