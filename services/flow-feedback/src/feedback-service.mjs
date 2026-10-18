const ORIGINS = new Set(['https://www.mehdi-benkaouz.com', 'https://mehdi-benkaouz.com', 'https://mehdibenkaouz.github.io']);
const CATEGORIES = new Set(['generale', 'funzioni', 'prezzo', 'demo', 'installazione']);
const STATUSES = new Set(['new', 'read', 'archived']);
const encoder = new TextEncoder();
export const allowedOrigin = origin => ORIGINS.has(origin);

function json(data, status = 200, origin = null, extra = {}) {
  const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex', ...extra };
  if (allowedOrigin(origin)) { headers['Access-Control-Allow-Origin'] = origin; headers.Vary = 'Origin'; }
  return new Response(JSON.stringify(data), { status, headers });
}
function b64(bytes) { return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function unb64(text) { const base = text.replace(/-/g, '+').replace(/_/g, '/'); return Uint8Array.from(atob(base.padEnd(Math.ceil(base.length / 4) * 4, '=')), c => c.charCodeAt(0)); }
async function hmac(secret, value) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value))));
}
function equal(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0; for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
async function challenge(secret, now) {
  const payload = b64(encoder.encode(JSON.stringify({ at: now, nonce: crypto.randomUUID() })));
  return payload + '.' + await hmac(secret, payload);
}
async function verifyChallenge(secret, token, now) {
  if (typeof token !== 'string' || token.length > 400) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 2 || !equal(parts[1], await hmac(secret, parts[0]))) return null;
    const data = JSON.parse(new TextDecoder().decode(unb64(parts[0])));
    if (!Number.isSafeInteger(data.at) || data.at > now + 5000 || now - data.at > 600000 || !/^[a-f0-9-]{36}$/i.test(data.nonce)) return null;
    return data.nonce;
  } catch { return null; }
}
async function boundedJson(request) {
  if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) throw { status: 415, error: 'Formato del messaggio non valido.' };
  if (Number(request.headers.get('content-length')) > 8192) throw { status: 413, error: 'Il messaggio è troppo lungo.' };
  const reader = request.body?.getReader();
  if (!reader) throw { status: 400, error: 'Scrivi un messaggio prima di inviare.' };
  let size = 0, text = ''; const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read(); if (done) break;
    size += value.byteLength;
    if (size > 8192) { await reader.cancel(); throw { status: 413, error: 'Il messaggio è troppo lungo.' }; }
    text += decoder.decode(value, { stream: true });
  }
  try { const value = JSON.parse(text + decoder.decode()); if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error(); return value; }
  catch { throw { status: 400, error: 'Il messaggio non è valido. Riprova.' }; }
}

async function publicApi(request, env, url, now) {
  const origin = request.headers.get('Origin');
  if (!allowedOrigin(origin)) return json({ error: 'Origine non autorizzata.' }, 403);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': origin, Vary: 'Origin', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '600' } });
  if (!env.DB || !env.FEEDBACK_SIGNING_KEY) return json({ error: 'Il servizio non è disponibile. Riprova tra poco.' }, 503, origin);
  if (url.pathname === '/api/feedback/challenge' && request.method === 'GET') return json({ challenge: await challenge(env.FEEDBACK_SIGNING_KEY, now) }, 200, origin);
  if (url.pathname !== '/api/feedback' || request.method !== 'POST') return json({ error: 'Operazione non disponibile.' }, 405, origin);
  const input = await boundedJson(request);
  if (input.website) return json({ error: 'Non è stato possibile inviare il parere. Riprova.' }, 422, origin);
  const message = typeof input.message === 'string' ? input.message.trim() : '';
  const category = input.category || 'generale';
  if (!message || message.length > 1000 || !CATEGORIES.has(category) || typeof input.requestId !== 'string' || !/^[a-f0-9-]{36}$/i.test(input.requestId)) return json({ error: 'Scrivi un parere di massimo 1.000 caratteri.' }, 400, origin);
  const nonce = await verifyChallenge(env.FEEDBACK_SIGNING_KEY, input.challenge, now);
  if (!nonce) return json({ error: 'La richiesta è scaduta. Premi di nuovo Invia.', retry: true }, 400, origin);
  const existing = await env.DB.prepare('SELECT message, category FROM feedback WHERE id = ?').bind(input.requestId).first();
  if (existing) return existing.message === message && existing.category === category ? json({ ok: true, id: input.requestId }, 200, origin) : json({ error: 'Il messaggio è cambiato: riprova.' }, 409, origin);
  // Daily rotating HMACs, never raw IP addresses, limit repeat submissions.
  // Only Cloudflare's transport header is accepted, not X-Forwarded-For.
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const rateKey = await hmac(env.FEEDBACK_SIGNING_KEY, 'rate:' + Math.floor(now / 86400000) + ':' + ip);
  const bucket = Math.floor(now / 900000);
  const quota = await env.DB.prepare('INSERT INTO feedback_rate_limits (key, bucket, count) VALUES (?, ?, 1) ON CONFLICT(key, bucket) DO UPDATE SET count = count + 1 WHERE count < 5 RETURNING count').bind(rateKey, bucket).first();
  if (!quota) return json({ error: 'Hai già inviato alcuni pareri. Riprova tra 15 minuti.' }, 429, origin, { 'Retry-After': '900' });
  await env.DB.prepare('DELETE FROM feedback_rate_limits WHERE bucket < ?').bind(bucket - 96).run();
  let inserted;
  try {
    inserted = await env.DB.prepare('INSERT INTO feedback (id, message, category, status, nonce, created_at) SELECT ?, ?, ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM feedback WHERE created_at >= ?) < 500 ON CONFLICT(id) DO NOTHING RETURNING id').bind(input.requestId, message, category, 'new', nonce, now, now - 3600000).first();
  } catch (error) {
    if (String(error).includes('UNIQUE')) return json({ error: 'Premi di nuovo Invia per completare il messaggio.', retry: true }, 409, origin);
    throw error;
  }
  if (!inserted) {
    const saved = await env.DB.prepare('SELECT message, category FROM feedback WHERE id = ?').bind(input.requestId).first();
    if (!saved || saved.message !== message || saved.category !== category) return json({ error: 'Il servizio è momentaneamente occupato. Il testo è ancora qui: riprova tra poco.' }, 503, origin);
  }
  return json({ ok: true, id: input.requestId }, 201, origin);
}

async function adminApi(request, env, url) {
  if (!env.FEEDBACK_ADMIN_TOKEN || !equal(request.headers.get('Authorization'), 'Bearer ' + env.FEEDBACK_ADMIN_TOKEN)) return json({ error: 'Accesso non autorizzato.' }, 401);
  if (!env.DB) return json({ error: 'Archivio non disponibile.' }, 503);
  if (request.method === 'GET' && url.pathname === '/api/admin/feedback') {
    const status = url.searchParams.get('status') || 'all';
    if (status !== 'all' && !STATUSES.has(status)) return json({ error: 'Filtro non valido.' }, 400);
    let where = status === 'all' ? '1 = 1' : 'status = ?';
    const params = status === 'all' ? [] : [status];
    const cursor = url.searchParams.get('before');
    if (cursor) {
      try {
        const value = JSON.parse(new TextDecoder().decode(unb64(cursor)));
        if (!Number.isSafeInteger(value.at) || !/^[a-f0-9-]{36}$/i.test(value.id)) throw Error();
        where += ' AND (created_at < ? OR (created_at = ? AND id < ?))'; params.push(value.at, value.at, value.id);
      } catch { return json({ error: 'Pagina non valida.' }, 400); }
    }
    const result = await env.DB.prepare('SELECT id, message, category, status, created_at FROM feedback WHERE ' + where + ' ORDER BY created_at DESC, id DESC LIMIT 41').bind(...params).all();
    const counts = await env.DB.prepare("SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS new, SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) AS read, SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) AS archived FROM feedback").first();
    const items = result.results.slice(0, 40); const last = items.at(-1);
    const next = result.results.length > 40 ? b64(encoder.encode(JSON.stringify({ at: last.created_at, id: last.id }))) : null;
    return json({ items, counts: { total: counts.total, new: counts.new || 0, read: counts.read || 0, archived: counts.archived || 0 }, next });
  }
  if (request.method === 'POST' && url.pathname === '/api/admin/feedback') {
    const input = await boundedJson(request);
    if (typeof input.id !== 'string' || !/^[a-f0-9-]{36}$/i.test(input.id) || !STATUSES.has(input.status)) return json({ error: 'Operazione non valida.' }, 400);
    const row = await env.DB.prepare('UPDATE feedback SET status = ? WHERE id = ? RETURNING id, status').bind(input.status, input.id).first();
    return row ? json({ ok: true, ...row }) : json({ error: 'Messaggio non trovato.' }, 404);
  }
  return json({ error: 'Operazione non disponibile.' }, 405);
}
export async function handleFeedbackRequest(request, env, now = Date.now()) {
  const url = new URL(request.url);
  try {
    if (url.pathname.startsWith('/api/admin/')) return await adminApi(request, env, url);
    if (url.pathname === '/api/feedback' || url.pathname === '/api/feedback/challenge') return await publicApi(request, env, url, now);
    return json({ error: 'Risorsa non trovata.' }, 404);
  } catch (error) {
    const status = Number.isInteger(error?.status) ? error.status : 503;
    return json({ error: error?.error || 'Il servizio non è disponibile. Il testo non è perso: riprova tra poco.' }, status, request.headers.get('Origin'));
  }
}
