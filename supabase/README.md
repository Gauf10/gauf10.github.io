# Supabase — guía Crear Posibilidades

Backend del formulario de `/guia/`.

```
Landing  →  Edge Function registrar-descarga  →  guide_downloads (Supabase)
                                              └→  MailerLite (solo si tildó)
```

La descarga del PDF **no pasa por acá**: se dispara en el navegador y no depende de nada de esto.

---

## Archivos

```
supabase/
├── config.toml
├── functions/registrar-descarga/index.ts
└── migrations/
    ├── 20261110120000_consent_version.sql
    └── 20261110120100_event_id.sql
```

---

## Consentimiento

| Concepto | Dónde se resuelve |
|---|---|
| `consent_at` | **Siempre servidor**. `new Date()` dentro de la función. El navegador no lo envía. Sólo se llena si `newsletter_consent === true`. |
| `consent_text_version` | Constante `CONSENT_VERSION` en la función: `trama-invisible-2026-11-10` |

Si cambia el texto visible del checkbox, **hay que cambiar `CONSENT_VERSION`** en el mismo commit. Los registros viejos quedan con `trama-invisible-v1` y no se tocan.

Hash del texto actual, por si hace falta respaldo probatorio:

```
sha256(139 caracteres) = 4b2cc5b29c42af57fc15464dbf334529e7fd0fb5fcb7128644e12cd661a819e5
```

---

## Protección de bajas en MailerLite

Antes de escribir, la función consulta `GET /api/subscribers/{email}`.

| Estado actual | Qué hace |
|---|---|
| 404 (no existe) | Crea. Sin `status` salvo que `MAILERLITE_STATUS` lo indique. |
| `active` | Actualiza campos y grupo. **Sin** `status`. |
| `unconfirmed` | **No hace nada.** Confirmarlo por API fabricaría un consentimiento que no dio. |
| `unsubscribed`, `bounced`, `junk` | **No hace nada.** |
| La consulta falla | **No escribe nada.** Mejor no sincronizar que arriesgar el estado. |

Nunca se envía `resubscribe`. Nunca se fuerza `status: "active"` sobre un contacto existente.

> Comportamiento documentado por MailerLite: `POST /api/subscribers` sólo reactiva a un dado de baja si se manda `resubscribe: true`. `PUT` directamente no puede reactivar contactos `unsubscribed`, `bounced` o `junk` por protección antiabuso.

### Doble opt-in

Si la cuenta usa doble opt-in y querés que el alta dispare el mail de confirmación:

```
MAILERLITE_STATUS = unconfirmed
```

Si lo dejás vacío, no se envía `status` y MailerLite aplica el default de la cuenta.

---

## Resultado de la sincronización

La respuesta trae un objeto `newsletter` con el estado:

| `estado` | Significado |
|---|---|
| `sin_consentimiento` | No tildó. No se tocó MailerLite. |
| `sincronizado` | Alta o actualización correcta. |
| `omitido_baja` | Estaba `unsubscribed`, `bounced` o `junk`. No se tocó. |
| `omitido_no_confirmado` | Doble opt-in pendiente. No se forzó. |
| `error_configuracion` | Falta `MAILERLITE_API_KEY`. |
| `error_api` | Falló la API. El detalle queda en el log. |

```json
{
  "ok": true,
  "download_id": "…",
  "duplicate": false,
  "newsletter_synced": true,
  "newsletter": { "estado": "sincronizado", "detalle": "creado" }
}
```

**Un fallo de MailerLite nunca invalida la descarga.** La fila ya está guardada cuando se intenta la sincronización, y el `catch` lo garantiza.

No se agregaron columnas para esto: el estado viaja en la respuesta y queda en los logs de la función. Si más adelante querés consultarlo desde SQL, la columna mínima sería `newsletter_sync text`, con su migración aparte.

---

## Idempotencia

El navegador genera un `event_id` (UUID v4) al primer envío y **lo conserva en los reintentos**. La tabla tiene un índice único parcial sobre esa columna.

**Qué pasa si se pierde la respuesta:**

1. El servidor inserta la fila con `event_id = A`.
2. La respuesta no llega (corte, timeout, pestaña cerrada).
3. La persona reintenta: mismo `A`.
4. El `INSERT` choca con el índice único → la función busca la fila original y devuelve **ese** `download_id`, con `duplicate: true`.
5. No se duplica nada y **no se vuelve a sincronizar** MailerLite.

El índice es parcial (`where event_id is not null`) para que las filas históricas, que no tienen el campo, no choquen entre sí.

---

## Puesta en marcha

1. **SQL Editor** → ejecutar en orden:
   - `migrations/20261110120000_consent_version.sql`
   - `migrations/20261110120100_event_id.sql`
2. **Edge Functions → Secrets**: `MAILERLITE_API_KEY`, `MAILERLITE_GROUP_ID`, y opcional `MAILERLITE_STATUS`.
3. **Desplegar** `registrar-descarga` con `index.ts`.
4. Probar con un email propio.

---

## Consultas útiles

```sql
-- Reparto por versión de consentimiento
select consent_text_version, newsletter_consent, count(*)
from public.guide_downloads
group by 1,2 order by 3 desc;

-- Esto tiene que dar 0 siempre
select count(*) from public.guide_downloads
where newsletter_consent = false and consent_at is not null;

-- Duplicados (no debería haber ninguno con event_id)
select email, count(*) from public.guide_downloads
group by 1 having count(*) > 1 order by 2 desc;

-- Altas por origen
select coalesce(utm_source,'(sin utm)') as origen, count(*)
from public.guide_downloads
group by 1 order by 2 desc;
```
