# ─────────────────────────────────────────────────────────────
#  GAUF · CREAR POSIBILIDADES — build del PDF
#
#  Genera crear_posibilidades_gauf_v2.pdf a partir de index.html
#  usando Chrome headless. Luego fija los metadatos del PDF.
#
#  Uso:  powershell -ExecutionPolicy Bypass -File .\build.ps1
#  Requisitos: Google Chrome. (Opcional: Python + pymupdf,
#  solo para los metadatos; si falta, el PDF igual se genera.)
# ─────────────────────────────────────────────────────────────

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$html = Join-Path $here 'index.html'
# El PDF vive en la carpeta padre: /guia/gauf_guia_para_crear_posibilidades.pdf
$pdf  = Join-Path (Split-Path -Parent $here) 'gauf_guia_para_crear_posibilidades.pdf'

# 1. Buscar Chrome
$chrome = @(
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1

if (-not $chrome) { throw 'No se encontró Google Chrome.' }

# 2. Imprimir a PDF
$url = 'file:///' + ($here -replace '\\', '/') + '/index.html'
Write-Host "Renderizando $url"

$prev = $ErrorActionPreference
$ErrorActionPreference = 'Continue'   # Chrome escribe su log por stderr

& $chrome `
  --headless=new `
  --disable-gpu `
  --no-sandbox `
  --no-pdf-header-footer `
  --run-all-compositor-stages-before-draw `
  --virtual-time-budget=12000 `
  --print-to-pdf="$pdf" `
  $url 2>&1 | Out-Null

$ErrorActionPreference = $prev

if (-not (Test-Path -LiteralPath $pdf)) { throw 'Chrome no generó el PDF.' }
Write-Host "PDF generado: $pdf"

# 3. Normalizar a A4 exacto + metadatos (opcional, requiere pymupdf)
$py = Get-Command python -ErrorAction SilentlyContinue
if ($py) {
  $script = @'
import sys
try:
    import pymupdf
except ImportError:
    print("pymupdf no disponible: se omite la normalizacion a A4.")
    sys.exit(0)

path = sys.argv[1]
A4 = (595.2755737304688, 841.8897705078125)   # 210 x 297 mm

src = pymupdf.open(path)
meta = src.metadata
out = pymupdf.open()
for page in src:
    p = out.new_page(width=A4[0], height=A4[1])
    p.show_pdf_page(p.rect, src, page.number)
out.set_metadata({
    "title": "GAUF \u00b7 CREAR POSIBILIDADES",
    "author": "Gabriel Aufgang",
    "subject": "Una gu\u00eda para conectar con otros y lograr nuevos caminos",
    "keywords": "GAUF, crear posibilidades, liderazgo, comunicaci\u00f3n, creatividad, gu\u00eda",
    "creator": "GAUF",
})
out.set_language("es-AR")
tmp = path + ".tmp"
out.save(tmp, garbage=4, deflate=True)
out.close(); src.close()

import os
os.replace(tmp, path)
print("PDF normalizado a A4 y metadatos actualizados.")
'@
  $tmp = Join-Path $env:TEMP 'gauf_meta.py'
  [System.IO.File]::WriteAllText($tmp, $script, (New-Object System.Text.UTF8Encoding($false)))
  & python $tmp $pdf
}

Write-Host 'Listo.'
