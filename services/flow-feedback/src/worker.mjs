import { allowedOrigin, handleFeedbackRequest } from './feedback-service.mjs';

const encoder = new TextEncoder();
const SESSION_MS = 30 * 60 * 1000;
function base64url(bytes) { return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
async function digest(text) { return base64url(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(text)))); }
async function sign(secret, text) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return base64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(text))));
}
function same(a, b) { if (a.length !== b.length) return false; let diff = 0; for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i); return diff === 0; }
function configurationChecks(env) {
  return {
    databaseBinding: Boolean(env.DB),
    adminPasswordValid: typeof env.ADMIN_PASSWORD === 'string' && env.ADMIN_PASSWORD.length >= 20 && env.ADMIN_PASSWORD.length <= 200,
    signingKeyValid: typeof env.FEEDBACK_SIGNING_KEY === 'string' && env.FEEDBACK_SIGNING_KEY.length >= 32,
    secretsDistinct: typeof env.ADMIN_PASSWORD === 'string' && typeof env.FEEDBACK_SIGNING_KEY === 'string' && env.ADMIN_PASSWORD !== env.FEEDBACK_SIGNING_KEY,
    noPlaceholders: !/CHANGE_ME|INSERISCI|replace-me/i.test(String(env.ADMIN_PASSWORD || '') + String(env.FEEDBACK_SIGNING_KEY || '')),
  };
}
function configured(env) { return Object.values(configurationChecks(env)).every(Boolean); }
function response(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8' } }); }
function secure(result, origin) {
  const headers = new Headers(result.headers);
  headers.set('Cache-Control', 'no-store'); headers.set('X-Content-Type-Options', 'nosniff'); headers.set('X-Robots-Tag', 'noindex');
  headers.set('Referrer-Policy', 'no-referrer');
  if (allowedOrigin(origin)) { headers.set('Access-Control-Allow-Origin', origin); headers.set('Vary', 'Origin'); }
  return new Response(result.body, { status: result.status, headers });
}
async function loginBody(request) {
  if (!(request.headers.get('Content-Type') || '').toLowerCase().startsWith('application/json')) throw { status: 415 };
  if (Number(request.headers.get('Content-Length')) > 1024 || !request.body) throw { status: 413 };
  const reader = request.body.getReader(); let size = 0; const chunks = [];
  while (true) { const { value, done } = await reader.read(); if (done) break; size += value.byteLength; if (size > 1024) { await reader.cancel(); throw { status: 413 }; } chunks.push(value); }
  const all = new Uint8Array(size); let at = 0; for (const chunk of chunks) { all.set(chunk, at); at += chunk.length; }
  try { const body = JSON.parse(new TextDecoder().decode(all)); if (typeof body?.password !== 'string' || body.password.length > 200) throw Error(); return body; }
  catch { throw { status: 400 }; }
}
async function sessionVersion(env) { return sign(env.FEEDBACK_SIGNING_KEY, 'password-version:' + env.ADMIN_PASSWORD); }
async function getSession(request, env, now) {
  const match = /^Bearer ([A-Za-z0-9_-]{43})$/.exec(request.headers.get('Authorization') || '');
  if (!match) return null;
  const hash = await digest(match[1]);
  const row = await env.DB.prepare('SELECT token_hash, secret_version, expires_at FROM feedback_admin_sessions WHERE token_hash = ? AND expires_at > ?').bind(hash, now).first();
  return row && same(row.secret_version, await sessionVersion(env)) ? row : null;
}
async function login(request, env, now) {
  const bucket = Math.floor(now / 900000);
  // Claim the shared quota before creating any per-IP rows.
  const global = await env.DB.prepare('INSERT INTO feedback_rate_limits (key, bucket, count) VALUES (?, ?, 1) ON CONFLICT(key, bucket) DO UPDATE SET count = count + 1 WHERE count < 25 RETURNING count').bind('login-global', bucket).first();
  if (!global) return response({ error: 'Accesso temporaneamente limitato. Riprova più tardi.' }, 429);
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  const key = 'login:' + await sign(env.FEEDBACK_SIGNING_KEY, Math.floor(now / 86400000) + ':' + ip);
  const quota = await env.DB.prepare('INSERT INTO feedback_rate_limits (key, bucket, count) VALUES (?, ?, 1) ON CONFLICT(key, bucket) DO UPDATE SET count = count + 1 WHERE count < 5 RETURNING count').bind(key, bucket).first();
  if (!quota) return response({ error: 'Troppi tentativi. Riprova tra 15 minuti.' }, 429);
  const body = await loginBody(request);
  const candidate = await sign(env.FEEDBACK_SIGNING_KEY, 'password:' + body.password);
  const expected = await sign(env.FEEDBACK_SIGNING_KEY, 'password:' + env.ADMIN_PASSWORD);
  if (!same(candidate, expected)) return response({ error: 'Password non corretta.' }, 401);
  const token = base64url(crypto.getRandomValues(new Uint8Array(32)));
  const expiresAt = now + SESSION_MS;
  await env.DB.prepare('DELETE FROM feedback_admin_sessions WHERE expires_at <= ?').bind(now).run();
  await env.DB.prepare('DELETE FROM feedback_rate_limits WHERE bucket < ?').bind(bucket - 96).run();
  await env.DB.prepare('INSERT INTO feedback_admin_sessions (token_hash, secret_version, expires_at) VALUES (?, ?, ?)').bind(await digest(token), await sessionVersion(env), expiresAt).run();
  return response({ ok: true, token, expiresAt });
}
export async function handleRequest(request, env, now = Date.now()) {
  const url = new URL(request.url), origin = request.headers.get('Origin');
  let result;
  try {
    if (url.pathname === '/health' && request.method === 'GET') {
      // Expose only pass/fail flags, never secret values, lengths or database errors.
      const checks = { ...configurationChecks(env), databaseTables: false };
      if (checks.databaseBinding) {
        try {
          const result = await env.DB.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'table' AND name IN ('feedback', 'feedback_rate_limits', 'feedback_admin_sessions')").first();
          checks.databaseTables = result?.n === 3;
        } catch { /* A failed database check must not disclose the underlying error. */ }
      }
      const ready = Object.values(checks).every(Boolean);
      return secure(response({ service: 'flow-feedback', version: 1, ready, auth: 'password', checks }, ready ? 200 : 503), origin);
    }
    if (!allowedOrigin(origin)) return secure(response({ error: 'Origine non autorizzata.' }, 403), null);
    if (request.method === 'OPTIONS') {
      return secure(new Response(null, { status: 204, headers: { 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Max-Age': '600' } }), origin);
    }
    if (!configured(env)) return secure(response({ error: 'Il servizio non è ancora configurato.' }, 503), origin);
    if (url.pathname === '/api/admin/login' && request.method === 'POST') result = await login(request, env, now);
    else if (url.pathname.startsWith('/api/admin/')) {
      const session = await getSession(request, env, now);
      if (!session) result = response({ error: 'Accedi di nuovo alla bacheca.' }, 401);
      else if (url.pathname === '/api/admin/logout' && request.method === 'POST') {
        await env.DB.prepare('DELETE FROM feedback_admin_sessions WHERE token_hash = ?').bind(session.token_hash).run();
        result = response({ ok: true });
      } else {
        // Only validated short-lived sessions reach the core's private API.
        // The core credential is derived server-side and never sent to the browser.
        const internalToken = await sign(env.FEEDBACK_SIGNING_KEY, 'internal-admin');
        const headers = new Headers(request.headers); headers.set('Authorization', 'Bearer ' + internalToken);
        result = await handleFeedbackRequest(new Request(request, { headers }), { ...env, FEEDBACK_ADMIN_TOKEN: internalToken }, now);
      }
    } else result = await handleFeedbackRequest(request, env, now);
  } catch (error) {
    result = response({ error: error?.status ? 'Richiesta non valida.' : 'Servizio non disponibile. Riprova tra poco.' }, error?.status || 503);
  }
  return secure(result, origin);
}
// Cloudflare passes ExecutionContext as the third fetch argument, not a timestamp.
export default { fetch(request, env) { return handleRequest(request, env); } };
