-- ============================================================
--  GAUF · Versión del texto de consentimiento
--
--  Objetivo: que las altas nuevas queden con la versión del texto
--  que realmente ve la persona.
--
--  NO se toca ninguna fila existente. Los registros históricos
--  conservan el valor con el que se guardaron (trama-invisible-v1).
--
--  La función escribe el valor en cada INSERT. Este default es
--  sólo una red de seguridad por si algún día falta.
-- ============================================================

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'guide_downloads'
      and column_name  = 'consent_text_version'
  ) then
    alter table public.guide_downloads
      alter column consent_text_version
      set default 'trama-invisible-2026-11-10';
  else
    raise notice 'guide_downloads.consent_text_version no existe: revisar el esquema antes de aplicar.';
  end if;
end $$;

-- ── Verificación (ejecutar a mano después de aplicar) ───────
-- Reparto por versión y consentimiento. No debe haber cambios en
-- las filas anteriores a esta migración.
--
--   select consent_text_version,
--          newsletter_consent,
--          consent_at is null as sin_fecha,
--          count(*)
--   from public.guide_downloads
--   group by 1,2,3
--   order by 4 desc;
--
-- Y esto debe devolver 0 filas siempre:
--
--   select count(*) from public.guide_downloads
--   where newsletter_consent = false and consent_at is not null;
