// ============================================================
//  GAUF · guia-download
//  Supabase Edge Function
//
//  Recibe el formulario de /guia/, guarda el registro en la
//  tabla privada guide_downloads y —solo si la persona tildó
//  el newsletter— la da de alta en MailerLite.
//
//  La API key de MailerLite vive en variables de entorno del
//  proyecto. Nunca viaja al navegador.
//
//  Variables de entorno:
//    SUPABASE_URL               (inyectada automáticamente)
//    SUPABASE_SERVICE_ROLE_KEY  (inyectada automáticamente)
//    MAILERLITE_API_KEY         obligatoria para el alta
//    MAILERLITE_GROUP_ID        grupo "Trama invisible"
//    MAILERLITE_STATUS          active | unconfirmed   (default: active)
//    ALLOWED_ORIGINS            default: https://gaufgang.com,https://www.gaufgang.com
// ============================================================

import { createClient } from "npm:@supabase/supabase-js@2";

const ALLOWED = (Deno.env.get("ALLOWED_ORIGINS") ??
  "https://gaufgang.com,https://www.gaufgang.com")
  .split(",").map((s) => s.trim()).filter(Boolean);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const NAME_MAX = 120;
const EMAIL_MAX = 160;
const UTM_MAX = 120;

// Un formulario humano tarda más que esto. Los bots, no.
// Bajo a propósito: con autocompletado, alguien puede enviar
// en menos de un segundo y no queremos perder ese registro.
const MIN_MS = 700;

function cors(origin: string | null): Record<string, string> {
  const allow = ALLOWED.includes("*")
    ? "*"
    : (origin && ALLOWED.includes(origin) ? origin : ALLOWED[0]);
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(origin), "Content-Type": "application/json; charset=utf-8" },
  });
}

function texto(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

type Sync = "skipped" | "synced" | "unsubscribed" | "error";

async function altaEnMailerLite(
  email: string,
  name: string,
): Promise<{ sync: Sync; error?: string }> {
  const key = Deno.env.get("MAILERLITE_API_KEY");
  const grupo = Deno.env.get("MAILERLITE_GROUP_ID");
  const estado = Deno.env.get("MAILERLITE_STATUS") ?? "active";

  if (!key) return { sync: "error", error: "falta MAILERLITE_API_KEY" };

  const base = "https://connect.mailerlite.com/api";
  const auth = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": `Bearer ${key}`,
  };

  // MailerLite es la autoridad sobre el estado actual. Si la persona
  // ya se dio de baja, no la reactivamos.
  try {
    const actual = await fetch(
      `${base}/subscribers/${encodeURIComponent(email)}`,
      { headers: auth },
    );
    if (actual.ok) {
      const data = await actual.json();
      const estadoActual = data?.data?.status;
      if (estadoActual === "unsubscribed" || estadoActual === "bounced") {
        return { sync: "unsubscribed" };
      }
    }
  } catch (_) {
    // Si falla la consulta seguimos: el POST de abajo hace upsert.
  }

  const cuerpo: Record<string, unknown> = {
    email,
    fields: { name },
    status: estado,
  };
  if (grupo) cuerpo.groups = [grupo];

  const res = await fetch(`${base}/subscribers`, {
    method: "POST",
    headers: auth,
    body: JSON.stringify(cuerpo),
  });

  if (!res.ok) {
    const detalle = await res.text().catch(() => "");
    return { sync: "error", error: `mailerlite_${res.status} ${detalle.slice(0, 200)}`.trim() };
  }

  return { sync: "synced" };
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors(origin) });
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

  // ── Antispam ─────────────────────────────────────────────
  // Campo trampa: si viene con algo, es un bot. Respondemos ok
  // para no darle señales, pero no guardamos nada.
  if (texto(body.honey, 200) !== "") {
    return json({ ok: true }, 200, origin);
  }

  const elapsed = Number(body.elapsed_ms);
  if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < MIN_MS) {
    return json({ ok: true }, 200, origin);
  }

  // ── Datos ────────────────────────────────────────────────
  const name = texto(body.name, NAME_MAX);
  const email = texto(body.email, EMAIL_MAX).toLowerCase();
  const resource = texto(body.resource, 80) || "guia_crear_posibilidades";
  const consent = body.newsletter_consent === true;
  const consentAt = consent ? new Date().toISOString() : null;

  if (name.length < 2) {
    return json({ ok: false, error: "nombre_invalido" }, 422, origin);
  }
  if (!EMAIL_RE.test(email)) {
    return json({ ok: false, error: "email_invalido" }, 422, origin);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  // ── 1. Registro propio (siempre) ─────────────────────────
  const { data: fila, error: errorInsert } = await supabase
    .from("guide_downloads")
    .insert({
      name,
      email,
      resource,
      newsletter_consent: consent,
      consent_at: consentAt,
      utm_source: texto(body.utm_source, UTM_MAX) || null,
      utm_medium: texto(body.utm_medium, UTM_MAX) || null,
      utm_campaign: texto(body.utm_campaign, UTM_MAX) || null,
      source: texto(body.source, UTM_MAX) || null,
      referrer: texto(body.referrer, 300) || null,
    })
    .select("id")
    .single();

  if (errorInsert) {
    console.error("guide_downloads insert:", errorInsert.message);
    return json({ ok: false, error: "no_se_pudo_guardar" }, 500, origin);
  }

  // ── 2. MailerLite, solo con consentimiento ───────────────
  let sync: Sync = "skipped";
  let syncError: string | undefined;

  if (consent) {
    const r = await altaEnMailerLite(email, name);
    sync = r.sync;
    syncError = r.error;

    await supabase
      .from("guide_downloads")
      .update({ newsletter_sync: sync, newsletter_error: syncError ?? null })
      .eq("id", fila.id);

    if (sync === "error") {
      console.error("mailerlite:", syncError);
    }
  }

  // La descarga no depende de esto: el cliente ya abrió el PDF.
  return json({ ok: true, newsletter: sync }, 200, origin);
});
