-- ============================================================
--  GAUF · Registro de descargas de la guía
--  Tabla privada: la escribe solo la Edge Function con la
--  service role key. Ningún visitante puede leer ni escribir.
-- ============================================================

create table if not exists public.guide_downloads (
  id                 uuid primary key default gen_random_uuid(),

  name               text        not null,
  email              text        not null,
  resource           text        not null default 'guia_crear_posibilidades',

  created_at         timestamptz not null default now(),

  newsletter_consent boolean     not null default false,
  consent_at         timestamptz,

  utm_source         text,
  utm_medium         text,
  utm_campaign       text,

  -- De dónde llegó, cuando no hay UTM.
  source             text,
  referrer           text,

  -- Operativo: refleja el resultado del alta en MailerLite.
  --   skipped       → no tildó el newsletter, no se toca MailerLite
  --   synced        → quedó dado de alta
  --   unsubscribed  → ya estaba dado de baja; no se reactiva
  --   error         → falló la llamada a MailerLite
  newsletter_sync    text        not null default 'skipped'
                     check (newsletter_sync in ('skipped','synced','unsubscribed','error')),
  newsletter_error   text,

  constraint guide_downloads_email_formato
    check (email ~* '^[^@\s]+@[^@\s]+\.[a-z]{2,}$'),
  constraint guide_downloads_name_no_vacio
    check (length(btrim(name)) >= 2),
  constraint guide_downloads_consent_fecha
    check (newsletter_consent = false or consent_at is not null)
);

comment on table  public.guide_downloads is
  'Registro de cada descarga de la guía Crear Posibilidades, con evidencia de consentimiento.';
comment on column public.guide_downloads.newsletter_sync is
  'Resultado del alta en MailerLite. MailerLite manda sobre el estado actual de la suscripción.';

-- ── Seguridad ───────────────────────────────────────────────
alter table public.guide_downloads enable row level security;

-- Sin políticas: RLS bloquea todo para anon y authenticated.
-- La Edge Function usa service_role, que saltea RLS.
revoke all on public.guide_downloads from anon, authenticated;

-- ── Índices ─────────────────────────────────────────────────
create index if not exists guide_downloads_created_at_idx
  on public.guide_downloads (created_at desc);

create index if not exists guide_downloads_email_idx
  on public.guide_downloads (lower(email));

create index if not exists guide_downloads_consent_idx
  on public.guide_downloads (created_at desc)
  where newsletter_consent;

-- ── Consultas útiles desde el panel de Supabase ─────────────
-- Todos los registros:
--   select * from public.guide_downloads order by created_at desc;
--
-- Solo quienes aceptaron el newsletter:
--   select * from public.guide_downloads
--   where newsletter_consent order by created_at desc;
--
-- Bajas de MailerLite que siguen en la base:
--   select email, created_at, newsletter_sync
--   from public.guide_downloads
--   where newsletter_sync in ('error','unsubscribed')
--   order by created_at desc;
--
-- Altas por campaña:
--   select coalesce(utm_source,'(sin utm)') as origen, count(*)
--   from public.guide_downloads
--   group by 1 order by 2 desc;
