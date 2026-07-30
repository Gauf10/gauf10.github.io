/*  FARO API — Cloudflare Worker
 *  POST /api/login     → { charla, password } → token
 *  GET  /api/notes     → notes.md content
 *  PUT  /api/notes     → { content } → commit
 *  GET  /api/aprendizajes → aprendizajes.md content
 *  PUT  /api/aprendizajes → { content } → commit
 *
 *  ENV vars:
 *    GITHUB_TOKEN    — Personal Access Token with repo scope (Secret)
 *    GITHUB_REPO     — "Gauf10/gauf10.github.io" (Plain text)
 *    CHARLA_PATH     — "charlas/exp-humanas" (Plain text)
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
  return entry.charla;
}

function requireAuth(request) {
  var token = getAuth(request);
  if (!token) return null;
  return verifyToken(token);
}

async function ghGet(path, env) {
  var url = 'https://api.github.com/repos/' + env.GITHUB_REPO + '/contents/' + path;
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
  return {
    content: atob(data.content),
    sha: data.sha,
  };
}

async function ghPut(path, content, sha, env, charla) {
  var url = 'https://api.github.com/repos/' + env.GITHUB_REPO + '/contents/' + path;
  var body = {
    message: 'Actualiza ' + path.split('/').pop() + ' de ' + charla,
    content: btoa(content),
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
      tokens.set(token, { charla: body.charla, created: Date.now() });
      return json({ token: token, expiresIn: TOKEN_EXPIRY_MS }, 200, origin);
    }

    /* ── require auth for all other endpoints ── */
    var charla = requireAuth(request);
    if (!charla) return error('unauthorized', 401, origin);

    /* ── GET /api/notes ── */
    if (url.pathname === '/api/notes' && request.method === 'GET') {
      var file = await ghGet(env.CHARLA_PATH + '/notes.md', env);
      if (!file) return json({ content: '' }, 200, origin);
      return json({ content: file.content }, 200, origin);
    }

    /* ── PUT /api/notes ── */
    if (url.pathname === '/api/notes' && request.method === 'PUT') {
      var body = await request.json();
      if (typeof body.content !== 'string') return error('content required', 400, origin);
      var existing = await ghGet(env.CHARLA_PATH + '/notes.md', env);
      var sha = existing ? existing.sha : null;
      var ok = await ghPut(env.CHARLA_PATH + '/notes.md', body.content, sha, env, charla);
      if (!ok) return error('failed to save', 500, origin);
      return json({ ok: true }, 200, origin);
    }

    /* ── GET /api/aprendizajes ── */
    if (url.pathname === '/api/aprendizajes' && request.method === 'GET') {
      var file = await ghGet(env.CHARLA_PATH + '/aprendizajes.md', env);
      if (!file) return json({ content: '' }, 200, origin);
      return json({ content: file.content }, 200, origin);
    }

    /* ── PUT /api/aprendizajes ── */
    if (url.pathname === '/api/aprendizajes' && request.method === 'PUT') {
      var body = await request.json();
      if (typeof body.content !== 'string') return error('content required', 400, origin);
      var existing = await ghGet(env.CHARLA_PATH + '/aprendizajes.md', env);
      var sha = existing ? existing.sha : null;
      var ok = await ghPut(env.CHARLA_PATH + '/aprendizajes.md', body.content, sha, env, charla);
      if (!ok) return error('failed to save', 500, origin);
      return json({ ok: true }, 200, origin);
    }

    return error('not found', 404, origin);
  },
};
