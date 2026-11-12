/*  FARO API — Cloudflare Worker
 *  POST /api/login        → { charla, folder, password } → token
 *  GET  /api/notes        → notes.md content (per charla folder)
 *  PUT  /api/notes        → { content }
 *  GET  /api/aprendizajes → aprendizajes.md content (per charla folder)
 *  PUT  /api/aprendizajes → { content }
 *  GET  /api/charlas      → charlas.json content
 *  PUT  /api/charlas      → { content } (JSON string of charlas array)
 *  POST /api/upload       → { filename, data (base64), mime } → { url }
 *  PUT  /api/preguntas    → { preguntas: [..] } → guarda preguntas/preguntas.json
 *
 *  ENV vars:
 *    GITHUB_TOKEN    — Personal Access Token with repo scope (Secret)
 *    GITHUB_REPO     — "Gauf10/gauf10.github.io" (Plain text) — repo público: covers subidos
 *    PRIVATE_REPO    — "Gauf10/gauf-privado" (Plain text) — notas.md, aprendizajes.md, charlas.json
 *                      (si falta, usa GITHUB_REPO). El token debe tener acceso a ambos.
 *    CHARLA_PATH     — "charlas/exp-humanas" (Plain text, fallback if no folder in token)
 *    FARO_PASSWORD   — contraseña global para todas las charlas (Secret)
 */

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;
const tokens = new Map();

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, PUT, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

function error(msg, status, origin) {
  return json({ error: msg }, status || 400, origin);
}

function getOrigin(request) {
  var o = request.headers.get('Origin');
  return o && (o.endsWith('gaufgang.com') || o === 'http://localhost:8787') ? o : null;
}

function getAuth(request) {
  var h = request.headers.get('Authorization');
  if (!h || !h.startsWith('Bearer ')) return null;
  return h.slice(7);
}

function verifyToken(token) {
  var entry = tokens.get(token);
  if (!entry) return null;
  if (Date.now() - entry.created > TOKEN_EXPIRY_MS) {
    tokens.delete(token);
    return null;
  }
  return entry;
}

function requireAuth(request) {
  var token = getAuth(request);
  if (!token) return null;
  return verifyToken(token);
}

async function ghGet(path, env, repo) {
  var url = 'https://api.github.com/repos/' + (repo || env.GITHUB_REPO) + '/contents/' + path;
  var res = await fetch(url, {
    headers: {
      'Authorization': 'Bearer ' + env.GITHUB_TOKEN,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'faro-worker',
    },
  });
  if (!res.ok) return null;
  var data = await res.json();
  if (data.type !== 'file') return null;
  var binary = atob(data.content.replace(/\n/g, ''));
  var bytes = new Uint8Array(binary.length);
  for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return {
    content: new TextDecoder().decode(bytes),
    sha: data.sha,
  };
}

async function ghPut(path, content, sha, env, charla, isBinary, repo) {
  var url = 'https://api.github.com/repos/' + (repo || env.GITHUB_REPO) + '/contents/' + path;
  var b64;
  if (isBinary) {
    b64 = content; // already base64
  } else {
    var bytes = new TextEncoder().encode(content);
    var binary = '';
    for (var i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    b64 = btoa(binary);
  }
  var body = {
    message: 'Actualiza ' + path.split('/').pop() + (charla ? ' de ' + charla : ''),
    content: b64,
    branch: 'main',
  };
  if (sha) body.sha = sha;
  var res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer ' + env.GITHUB_TOKEN,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'faro-worker',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return res.ok;
}

export default {
  async fetch(request, env) {
    var url = new URL(request.url);
    var origin = getOrigin(request);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    /* ── POST /api/login ── */
    if (url.pathname === '/api/login' && request.method === 'POST') {
      var body = await request.json();
      if (!body.charla || !body.password) {
        return error('charla and password required', 400, origin);
      }
      if (body.password !== env.FARO_PASSWORD) {
        return error('invalid credentials', 401, origin);
      }
      var token = uuid();
      tokens.set(token, {
        charla: body.charla,
        folder: body.folder || null,
        created: Date.now(),
      });
      return json({ token: token, expiresIn: TOKEN_EXPIRY_MS }, 200, origin);
    }

    /* ── require auth for all other endpoints ── */
    var entry = requireAuth(request);
    if (!entry) return error('unauthorized', 401, origin);
    var charla = entry.charla;
    var charlaPath = entry.folder ? 'charlas/' + entry.folder : env.CHARLA_PATH;
    var PRIV = env.PRIVATE_REPO || env.GITHUB_REPO;

    /* ── GET /api/notes ── */
    if (url.pathname === '/api/notes' && request.method === 'GET') {
      var file = await ghGet(charlaPath + '/notas.md', env, PRIV);
      if (!file) return json({ content: '' }, 200, origin);
      return json({ content: file.content }, 200, origin);
    }

    /* ── PUT /api/notes ── */
    if (url.pathname === '/api/notes' && request.method === 'PUT') {
      var body = await request.json();
      if (typeof body.content !== 'string') return error('content required', 400, origin);
      var existing = await ghGet(charlaPath + '/notas.md', env, PRIV);
      var sha = existing ? existing.sha : null;
      var ok = await ghPut(charlaPath + '/notas.md', body.content, sha, env, charla, false, PRIV);
      if (!ok) return error('failed to save', 500, origin);
      return json({ ok: true }, 200, origin);
    }

    /* ── GET /api/aprendizajes ── */
    if (url.pathname === '/api/aprendizajes' && request.method === 'GET') {
      var file = await ghGet(charlaPath + '/aprendizajes.md', env, PRIV);
      if (!file) return json({ content: '' }, 200, origin);
      return json({ content: file.content }, 200, origin);
    }

    /* ── PUT /api/aprendizajes ── */
    if (url.pathname === '/api/aprendizajes' && request.method === 'PUT') {
      var body = await request.json();
      if (typeof body.content !== 'string') return error('content required', 400, origin);
      var existing = await ghGet(charlaPath + '/aprendizajes.md', env, PRIV);
      var sha = existing ? existing.sha : null;
      var ok = await ghPut(charlaPath + '/aprendizajes.md', body.content, sha, env, charla, false, PRIV);
      if (!ok) return error('failed to save', 500, origin);
      return json({ ok: true }, 200, origin);
    }

    /* ── GET /api/charlas ── */
    if (url.pathname === '/api/charlas' && request.method === 'GET') {
      var file = await ghGet('charlas/charlas.json', env, PRIV);
      if (!file) return json({ content: '[]' }, 200, origin);
      return json({ content: file.content }, 200, origin);
    }

    /* ── PUT /api/charlas ── */
    if (url.pathname === '/api/charlas' && request.method === 'PUT') {
      var body = await request.json();
      if (typeof body.content !== 'string') return error('content required', 400, origin);
      var existing = await ghGet('charlas/charlas.json', env, PRIV);
      var sha = existing ? existing.sha : null;
      var ok = await ghPut('charlas/charlas.json', body.content, sha, env, charla, false, PRIV);
      if (!ok) return error('failed to save', 500, origin);
      return json({ ok: true }, 200, origin);
    }

    /* ── PUT /api/preguntas ── (panel admin de /preguntas, repo público) */
    if (url.pathname === '/api/preguntas' && request.method === 'PUT') {
      var body = await request.json();
      var list = Array.isArray(body.preguntas) ? body.preguntas
        .filter(function(p) { return typeof p === 'string'; })
        .map(function(p) { return p.trim(); })
        .filter(function(p) { return p.length > 0 && p.length < 500; }) : [];
      if (!list.length) return error('preguntas required', 400, origin);
      var path = 'preguntas/preguntas.json';
      var existing = await ghGet(path, env);
      var sha = existing ? existing.sha : null;
      var ok = await ghPut(path, JSON.stringify(list, null, 2), sha, env, 'preguntas');
      if (!ok) return error('failed to save', 500, origin);
      return json({ ok: true, count: list.length }, 200, origin);
    }

    /* ── POST /api/upload ── */
    if (url.pathname === '/api/upload' && request.method === 'POST') {
      var body = await request.json();
      if (!body.filename || !body.data) return error('filename and data required', 400, origin);
      var safeName = body.filename.replace(/[^a-zA-Z0-9.\-_]/g, '-').toLowerCase();
      var folder   = body.folder || 'covers';
      var path     = 'charlas/' + folder + '/' + safeName;
      var existing = await ghGet(path, env);
      var sha = existing ? existing.sha : null;
      var ok = await ghPut(path, body.data, sha, env, charla, true);
      if (!ok) return error('failed to upload', 500, origin);
      var baseUrl = env.SITE_BASE_URL || 'https://gaufgang.com';
      var publicUrl = baseUrl + '/' + path;
      return json({ ok: true, url: publicUrl }, 200, origin);
    }

    return error('not found', 404, origin);
  },
};
