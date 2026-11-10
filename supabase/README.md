# Supabase — guía Crear Posibilidades

Backend del formulario de `/guia/`.

```
Landing  →  Edge Function "guide-download"  →  Supabase (guide_downloads)
                                           └→  MailerLite (solo si tildó)
```

La descarga del PDF **no pasa por acá**: se dispara en el navegador y no depende de nadie.

---

## Qué guarda

Tabla `guide_downloads`: una fila por cada envío del formulario, tilde o no el newsletter.

| Campo | Para qué |
|---|---|
| `id` | Identificador único |
| `name` | Nombre |
| `email` | Email |
| `resource` | Recurso descargado |
| `created_at` | Fecha y hora |
| `newsletter_consent` | Aceptó: sí/no |
| `consent_at` | Fecha y hora de aceptación |
| `utm_source` | Origen |
| `utm_medium` | Medio |
| `utm_campaign` | Campaña |
| `newsletter_sync` | Resultado del alta en MailerLite |
| `newsletter_error` | Detalle si falló |

`newsletter_sync` y `newsletter_error` los agregué para poder ver desde la base si un alta a MailerLite falló. Sin eso, un error de MailerLite quedaba invisible.

Valores de `newsletter_sync`:

- `skipped` — no tildó, no se tocó MailerLite
- `synced` — alta correcta
- `unsubscribed` — ya estaba de baja; **no se reactiva**
- `error` — falló la llamada

---

## Puesta en marcha

### 1. Crear la tabla

Supabase → **SQL Editor** → pegá y ejecutá el contenido de
`migrations/20261109120000_guide_downloads.sql`.

Queda con RLS activo y sin políticas: nadie con la anon key puede leer ni escribir. Solo la service role, que usa la función.

### 2. Cargar los secretos

Supabase → **Edge Functions → Secrets** (o `supabase secrets set`):

| Secreto | Valor |
|---|---|
| `MAILERLITE_API_KEY` | MailerLite → Integrations → API → generar token |
| `MAILERLITE_GROUP_ID` | ID del grupo "Trama invisible" |
| `MAILERLITE_STATUS` | `active`, o `unconfirmed` si usás doble opt-in |
| `ALLOWED_ORIGINS` | `https://gaufgang.com,https://www.gaufgang.com` |

`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` las inyecta Supabase sola. No hay que cargarlas.

Para sacar el ID del grupo: MailerLite → **Subscribers → Groups** → abrí "Trama invisible" y copiá el número de la URL.

### 3. Desplegar la función

Con la CLI de Supabase instalada y logueada:

```bash
supabase link --project-ref qjahvfyixsuljtxqipbs
supabase db push          # aplica la migración
supabase functions deploy guide-download
```

O sin CLI: **Edge Functions → Deploy a new function**, pegando el contenido de `functions/guide-download/index.ts` y agregando los secretos a mano.

### 4. Probar

Llená el formulario en `/guia/`. Tiene que:

1. Abrir el PDF al instante.
2. Mostrar "¡Gracias! Ya tenés tu guía."
3. Aparecer una fila nueva en `guide_downloads`.

Si tildaste el newsletter, además tiene que aparecer el contacto en MailerLite con `newsletter_sync = 'synced'`.

---

## Cómo se comporta

| Acción | Supabase | MailerLite | Descarga |
|---|---|---|---|
| Completa sin tildar | Sí | No | Sí |
| Completa y tilda | Sí | Alta voluntaria | Sí |
| Se da de baja después | Conserva el registro | Actualiza su estado | Ya descargó |

MailerLite manda sobre el estado actual de la suscripción. Supabase conserva la evidencia del consentimiento original.

**Si MailerLite ya la tiene como `unsubscribed`, la función no la reactiva.** Devuelve `newsletter_sync = 'unsubscribed'` y no toca nada.

---

## Antispam

Tres capas, sin captcha:

1. **Campo trampa** (`website`): invisible para personas, los bots lo completan. Si viene con algo, se responde `ok` y no se guarda nada.
2. **Tiempo mínimo**: menos de 1,2 s entre cargar la página y enviar es un bot.
3. **Validación de formato** en el cliente y en el servidor.

Si en algún momento entra basura, el siguiente paso es Cloudflare Turnstile: se agrega en el formulario y se verifica en la misma función, sin cambiar nada más.

---

## Consultas útiles

```sql
-- Todo
select * from public.guide_downloads order by created_at desc;

-- Solo quienes aceptaron el newsletter
select email, name, created_at
from public.guide_downloads
where newsletter_consent
order by created_at desc;

-- Altas que fallaron: para reintentar a mano
select email, name, newsletter_error
from public.guide_downloads
where newsletter_sync = 'error'
order by created_at desc;

-- De qué campaña vino cada uno
select coalesce(utm_source, '(sin utm)') as origen, count(*)
from public.guide_downloads
group by 1 order by 2 desc;
```

Exportar: **Table Editor → guide_downloads → Export → CSV**.
