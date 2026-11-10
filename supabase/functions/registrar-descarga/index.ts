// ============================================================
//  GAUF · registrar-descarga
//  Supabase Edge Function
//
//  Recibe el formulario de /guia/, guarda la descarga en
//  public.guide_downloads y —solo con consentimiento explícito—
//  sincroniza el contacto con MailerLite sin reactivar a nadie
//  que se haya dado de baja.
//
//  Variables de entorno (secrets):
//    SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY  (las inyecta Supabase)
//    MAILERLITE_API_KEY          obligatoria para sincronizar
//    MAILERLITE_GROUP_ID         grupo TRAMA INVISIBLE
//    MAILERLITE_STATUS           opcional: active | unconfirmed
//                                (si se omite, no se envía status y
//                                 MailerLite aplica el default de la cuenta)
//    ALLOWED_ORIGINS             opcional
//
//  Nunca se envía resubscribe. Nunca se fuerza status "active"
//  sobre un contacto existente.
// ============================================================

import { createClient } from "npm:@supabase/supabase-js@2";

/* ────────────────────────────────────────────────────────────
   Versión del texto de consentimiento que muestra el formulario.
   Si cambia el texto visible, cambia esta constante.
   Los registros viejos conservan la versión con la que se
   guardaron: acá no se toca ninguna fila existente.
   ──────────────────────────────────────────────────────────── */
const CONSENT_VERSION = "trama-invisible-2026-11-10";

const ALLOWED_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") ??
  "https://gaufgang.com,https://www.gaufgang.com")
  .split(",").map((s) => s.trim()).filter(Boolean);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const NAME_MAX = 120;
const EMAIL_MAX = 160;
const UTM_MAX = 120;

/* Estados posibles de la sincronización con MailerLite. */
type SyncEstado =
  | "sin_consentimiento"
  | "sincronizado"
  | "omitido_baja"
  | "omitido_no_confirmado"
  | "error_configuracion"
  | "error_api";

type SyncResultado = { estado: SyncEstado; detalle?: string };

/* ── CORS ──────────────────────────────────────────────────── */
function corsHeaders(origin: string | null): Record<string, string> {
  const permitido = ALLOWED_ORIGINS.includes("*")
    ? "*"
    : (origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]);

  return {
    "Access-Control-Allow-Origin": permitido,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(cuerpo: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(cuerpo), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function texto(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/* ── MailerLite ────────────────────────────────────────────────
   Reglas:
   · Consultar el estado ANTES de escribir.
   · Si la consulta falla, no se escribe nada.
   · unsubscribed / bounced / junk → no se toca.
   · unconfirmed → no se fuerza la confirmación.
   · active → se actualizan campos y grupo, sin status.
   · inexistente → se crea sin forzar status.
   ────────────────────────────────────────────────────────────── */
async function sincronizarMailerLite(email: string, name: string): Promise<SyncResultado> {
  const key = Deno.env.get("MAILERLITE_API_KEY");
  const grupo = Deno.env.get("MAILERLITE_GROUP_ID");
  const statusNuevo = Deno.env.get("MAILERLITE_STATUS"); // opcional

  if (!key) return { estado: "error_configuracion", detalle: "falta MAILERLITE_API_KEY" };

  const BASE = "https://connect.mailerlite.com/api";
  const auth = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": `Bearer ${key}`,
  };

  /* 1. Estado actual -------------------------------------------------- */
  let existente: { status?: string } | null = null;

  try {
    const res = await fetch(`${BASE}/subscribers/${encodeURIComponent(email)}`, { headers: auth });

    if (res.status === 200) {
      const cuerpo = await res.json();
      existente = cuerpo?.data ?? null;
    } else if (res.status !== 404) {
      // Ni 200 ni 404: no sabemos el estado. No tocamos nada.
      return { estado: "error_api", detalle: `consulta_${res.status}` };
    }
  } catch (_) {
    return { estado: "error_api", detalle: "consulta_sin_respuesta" };
  }

  /* 2. Contacto existente --------------------------------------------- */
  if (existente) {
    const estado = (existente.status ?? "").toLowerCase();

    if (estado === "unsubscribed" || estado === "bounced" || estado === "junk") {
      return { estado: "omitido_baja", detalle: `estado_${estado}` };
    }

    if (estado === "unconfirmed") {
      // Tiene el doble opt-in pendiente: confirmarlo por API sería
      // fabricar un consentimiento que no dio.
      return { estado: "omitido_no_confirmado", detalle: "doble_optin_pendiente" };
    }

    // active: actualizamos datos y grupo. Sin status, sin resubscribe.
    const cuerpo: Record<string, unknown> = { email, fields: { name } };
    if (grupo) cuerpo.groups = [grupo];

    const res = await fetch(`${BASE}/subscribers`, {
      method: "POST",
      headers: auth,
      body: JSON.stringify(cuerpo),
    });

    if (!res.ok) return { estado: "error_api", detalle: `actualizar_${res.status}` };
    return { estado: "sincronizado", detalle: "actualizado" };
  }

  /* 3. Contacto nuevo -------------------------------------------------- */
  // Sin status salvo que se configure explícitamente: así manda la
  // configuración de la cuenta y no inventamos una confirmación.
  const cuerpo: Record<string, unknown> = { email, fields: { name } };
  if (grupo) cuerpo.groups = [grupo];
  if (statusNuevo === "active" || statusNuevo === "unconfirmed") cuerpo.status = statusNuevo;

  const res = await fetch(`${BASE}/subscribers`, {
    method: "POST",
    headers: auth,
    body: JSON.stringify(cuerpo),
  });

  if (!res.ok) return { estado: "error_api", detalle: `alta_${res.status}` };
  return { estado: "sincronizado", detalle: "creado" };
}

/* ── Handler ───────────────────────────────────────────────── */
Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(origin) });
  }
  if (req.method !== "POST") {
    return json({ ok: false, error: "metodo_no_permitido" }, 405, origin);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch (_) {
    return json({ ok: false, error: "json_invalido" }, 400, origin);
  }

  /* ── Honeypot ──────────────────────────────────────────────── */
  if (texto(body.website, 200) !== "") {
    // Se responde ok para no darle señales al bot, pero no se guarda.
    return json({ ok: true, duplicate: false }, 200, origin);
  }

  /* ── Datos ─────────────────────────────────────────────────── */
  const name = texto(body.name, NAME_MAX);
  const email = texto(body.email, EMAIL_MAX).toLowerCase();
  const consent = body.newsletter_consent === true;
  const utmSource = texto(body.utm_source, UTM_MAX) || null;
  const utmMedium = texto(body.utm_medium, UTM_MAX) || null;
  const utmCampaign = texto(body.utm_campaign, UTM_MAX) || null;

  const eventIdRaw = texto(body.event_id, 40).toLowerCase();
  const eventId = UUID_RE.test(eventIdRaw) ? eventIdRaw : null;

  if (name.length < 2) return json({ ok: false, error: "nombre_invalido" }, 422, origin);
  if (!EMAIL_RE.test(email)) return json({ ok: false, error: "email_invalido" }, 422, origin);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  /* ── 1. Registro propio (siempre, con o sin consentimiento) ── */
  const { data: fila, error: errorInsert } = await supabase
    .from("guide_downloads")
    .insert({
      name,
      email,
      event_id: eventId,
      // Mismo valor que las filas ya existentes en la tabla.
      resource: "crear_posibilidades",
      newsletter_consent: consent,
      // La fecha la pone el servidor. Nunca el navegador.
      consent_at: consent ? new Date().toISOString() : null,
      // La versión sólo tiene sentido cuando hay consentimiento,
      // igual que en los registros históricos.
      consent_text_version: consent ? CONSENT_VERSION : null,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
    })
    .select("id")
    .single();

  /* 1.b Reintento con la misma clave: se devuelve el registro original */
  if (errorInsert) {
    if (errorInsert.code === "23505" && eventId) {
      const { data: original } = await supabase
        .from("guide_downloads")
        .select("id")
        .eq("event_id", eventId)
        .maybeSingle();

      if (original) {
        // No se vuelve a sincronizar: el primer envío ya lo hizo.
        return json({
          ok: true,
          download_id: original.id,
          duplicate: true,
          newsletter_synced: false,
          newsletter: { estado: "ya_registrado" },
        }, 200, origin);
      }
    }

    console.error("guide_downloads insert:", errorInsert.code, errorInsert.message);
    return json({ ok: false, error: "no_se_pudo_guardar" }, 500, origin);
  }

  /* ── 2. MailerLite (solo con consentimiento) ──────────────── */
  let sync: SyncResultado = { estado: "sin_consentimiento" };

  if (consent) {
    try {
      sync = await sincronizarMailerLite(email, name);
    } catch (e) {
      sync = { estado: "error_api", detalle: String(e).slice(0, 120) };
    }

    if (sync.estado !== "sincronizado") {
      // Un fallo de MailerLite nunca invalida la descarga.
      console.warn("mailerlite", sync.estado, sync.detalle ?? "", email);
    }
  }

  return json({
    ok: true,
    download_id: fila.id,
    duplicate: false,
    newsletter_synced: sync.estado === "sincronizado",
    newsletter: sync,
  }, 200, origin);
});
