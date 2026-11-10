-- ============================================================
--  GAUF · Idempotencia de registros
--
--  Problema que resuelve:
--  si el servidor guarda la fila pero el navegador pierde la
--  respuesta (corte de red, timeout, pestaña cerrada), la persona
--  reintenta y hoy entra una segunda fila idéntica.
--
--  Solución: el navegador manda un event_id (UUID) que se
--  conserva durante los reintentos del mismo envío. El índice
--  único hace que el segundo INSERT no pueda duplicar.
--
--  Notas:
--  · La columna es nullable: las filas históricas quedan con NULL.
--  · El índice es PARCIAL (where event_id is not null), así que
--    admite cualquier cantidad de NULL sin chocar entre sí.
--  · No se modifica ni se borra ninguna fila existente.
-- ============================================================

alter table public.guide_downloads
  add column if not exists event_id uuid;

create unique index if not exists guide_downloads_event_id_uidx
  on public.guide_downloads (event_id)
  where event_id is not null;

comment on column public.guide_downloads.event_id is
  'UUID generado por el navegador. Garantiza que un reintento no duplique la fila.';

-- ── Verificación ───────────────────────────────────────────
-- No debe haber event_id repetidos (el índice lo impide):
--
--   select event_id, count(*)
--   from public.guide_downloads
--   where event_id is not null
--   group by 1 having count(*) > 1;
--
-- Cuántas filas van quedando sin event_id (todas las históricas):
--
--   select count(*) filter (where event_id is null) as historicas,
--          count(*) filter (where event_id is not null) as nuevas
--   from public.guide_downloads;
