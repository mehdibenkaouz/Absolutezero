import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { handleRequest } from '../src/worker.mjs';
const origin = 'https://www.mehdi-benkaouz.com', now = 1792354800000;
function setup() {
  const db = new DatabaseSync(':memory:');
  for (const file of readdirSync(new URL('../migrations', import.meta.url)).filter(f => f.endsWith('.sql')).sort()) db.exec(readFileSync(new URL('../migrations/' + file, import.meta.url), 'utf8').replaceAll('--> statement-breakpoint', ''));
  const DB = { prepare(sql) { const statement = (...args) => ({ bind: (...values) => statement(...values), first: async () => db.prepare(sql).get(...args) || null, all: async () => ({ results: db.prepare(sql).all(...args) }), run: async () => db.prepare(sql).run(...args) }); return statement(); } };
  const env = { DB, ADMIN_PASSWORD: 'test-password-only-not-used-in-production', FEEDBACK_SIGNING_KEY: 'test-signing-key-only-not-used-in-production-123456789' };
  const req = (path, method = 'GET', body, extra = {}) => new Request('https://feedback.example.workers.dev' + path, { method, headers: { Origin: origin, 'cf-connecting-ip': '192.0.2.10', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...extra }, body: body === undefined ? undefined : JSON.stringify(body) });
  const run = (path, method, body, extra, time = now, config = env) => handleRequest(req(path, method, body, extra), config, time);
  async function login() { const result = await run('/api/admin/login', 'POST', { password: env.ADMIN_PASSWORD }); assert.equal(result.status, 200); return result.json(); }
  return { db, env, req, run, login };
}

test('ready only with database migrations and configured secrets', async () => {
  const f = setup(); const ready = await f.run('/health'); assert.equal(ready.status, 200); assert.deepEqual(await ready.json(), { service: 'flow-feedback', version: 1, ready: true, auth: 'password' });
  for (const patch of [{ ADMIN_PASSWORD: '' }, { ADMIN_PASSWORD: 'short' }, { FEEDBACK_SIGNING_KEY: '' }, { DB: undefined }, { ADMIN_PASSWORD: 'INSERISCI-UNA-PASSWORD-DI-20-CARATTERI' }]) {
    const config = { ...f.env, ...patch }; assert.equal((await f.run('/health', 'GET', undefined, {}, now, config)).status, 503);
    assert.equal((await f.run('/api/feedback/challenge', 'GET', undefined, {}, now, config)).status, 503);
  }
});
test('anonymous readers and fabricated or legacy credentials cannot read messages', async () => {
  const f = setup(); assert.equal((await f.run('/api/admin/feedback')).status, 401);
  assert.equal((await f.run('/api/admin/feedback', 'GET', undefined, { Authorization: 'Bearer ' + 'a'.repeat(43) })).status, 401);
  assert.equal((await f.run('/api/admin/feedback', 'POST', { id: crypto.randomUUID(), status: 'read' })).status, 401);
  assert.equal((await f.run('/api/admin/login', 'POST', { password: 'wrong' })).status, 401);
  assert.equal(f.db.prepare('SELECT COUNT(*) AS n FROM feedback_admin_sessions').get().n, 0);
});
test('password login reads and archives submissions; only a hash of the session is stored', async () => {
  const f = setup(), session = await f.login(); assert.match(session.token, /^[A-Za-z0-9_-]{43}$/); assert.equal(session.expiresAt, now + 1800000);
  const stored = f.db.prepare('SELECT * FROM feedback_admin_sessions').get(); assert.notEqual(stored.token_hash, session.token); assert(!JSON.stringify(stored).includes(f.env.ADMIN_PASSWORD));
  const challenge = await (await f.run('/api/feedback/challenge')).json(); const id = crypto.randomUUID();
  assert.equal((await f.run('/api/feedback', 'POST', { message: 'Un parere <script>alert(1)</script>', category: 'generale', requestId: id, website: '', challenge: challenge.challenge })).status, 201);
  const headers = { Authorization: 'Bearer ' + session.token };
  const response = await f.run('/api/admin/feedback', 'GET', undefined, headers); assert.equal(response.status, 200); assert.equal(response.headers.get('Access-Control-Allow-Origin'), origin); assert.equal(response.headers.get('Cache-Control'), 'no-store');
  const data = await response.json(); assert.equal(data.items[0].id, id); assert.equal(data.counts.new, 1);
  assert.equal((await f.run('/api/admin/feedback', 'POST', { id, status: 'archived' }, headers)).status, 200);
  assert.equal((await (await f.run('/api/admin/feedback?status=archived', 'GET', undefined, headers)).json()).counts.archived, 1);
});
test('logout revokes sessions; expiry and password rotation invalidate access', async () => {
  const f = setup(), session = await f.login(), headers = { Authorization: 'Bearer ' + session.token };
  assert.equal((await f.run('/api/admin/feedback', 'GET', undefined, headers, now + 1800000)).status, 401);
  assert.equal((await f.run('/api/admin/feedback', 'GET', undefined, headers, now, { ...f.env, ADMIN_PASSWORD: 'a-new-test-password-not-for-production' })).status, 401);
  assert.equal((await f.run('/api/admin/logout', 'POST', undefined, headers)).status, 200);
  assert.equal((await f.run('/api/admin/feedback', 'GET', undefined, headers)).status, 401);
  assert.equal(f.db.prepare('SELECT COUNT(*) AS n FROM feedback_admin_sessions').get().n, 0);
});
test('foreign origins and missing origins cannot log in, read or mutate the board', async () => {
  const f = setup(), session = await f.login();
  for (const bad of ['https://evil.example', 'null', 'https://www.mehdi-benkaouz.com.evil.example']) {
    assert.equal((await f.run('/api/admin/login', 'POST', { password: f.env.ADMIN_PASSWORD }, { Origin: bad })).status, 403);
    const result = await f.run('/api/admin/feedback', 'GET', undefined, { Origin: bad, Authorization: 'Bearer ' + session.token }); assert.equal(result.status, 403); assert.equal(result.headers.get('Access-Control-Allow-Origin'), null);
    assert.equal((await f.run('/api/admin/feedback', 'OPTIONS', undefined, { Origin: bad })).status, 403);
  }
  const noOrigin = f.req('/api/admin/feedback'); noOrigin.headers.delete('Origin'); assert.equal((await handleRequest(noOrigin, f.env, now)).status, 403);
  const allowed = await f.run('/api/admin/feedback', 'OPTIONS'); assert.equal(allowed.status, 204); assert.match(allowed.headers.get('Access-Control-Allow-Headers'), /Authorization/);
});
test('brute-force limits apply per transport IP and globally without raw IP storage', async () => {
  const f = setup();
  for (let i = 0; i < 5; i++) assert.equal((await f.run('/api/admin/login', 'POST', { password: 'wrong' })).status, 401);
  assert.equal((await f.run('/api/admin/login', 'POST', { password: f.env.ADMIN_PASSWORD })).status, 429);
  assert.equal((await f.run('/api/admin/login', 'POST', { password: f.env.ADMIN_PASSWORD }, { 'cf-connecting-ip': '192.0.2.11' })).status, 200);
  for (let i = 0; i < 18; i++) assert.equal((await f.run('/api/admin/login', 'POST', { password: 'wrong' }, { 'cf-connecting-ip': '192.0.2.' + (30 + i) })).status, 401);
  assert.equal((await f.run('/api/admin/login', 'POST', { password: f.env.ADMIN_PASSWORD }, { 'cf-connecting-ip': '192.0.2.99' })).status, 429);
  const before = f.db.prepare('SELECT COUNT(*) AS n FROM feedback_rate_limits').get().n;
  await f.run('/api/admin/login', 'POST', { password: 'wrong' }, { 'cf-connecting-ip': '192.0.2.123' });
  assert.equal(f.db.prepare('SELECT COUNT(*) AS n FROM feedback_rate_limits').get().n, before);
  assert(!JSON.stringify(f.db.prepare('SELECT * FROM feedback_rate_limits').all()).includes('192.0.2.'));
});
test('malformed login and database failures never expose credentials or claim success', async () => {
  const f = setup(); assert.equal((await f.run('/api/admin/login', 'POST', { password: 'x'.repeat(2000) })).status, 413);
  assert.equal((await f.run('/api/admin/login', 'POST', { password: 1 })).status, 400);
  const failure = await f.run('/api/admin/login', 'POST', { password: f.env.ADMIN_PASSWORD }, {}, now, { ...f.env, DB: { prepare() { throw Error('internal secret database detail'); } } });
  assert.equal(failure.status, 503); const body = await failure.text(); assert(!body.includes('internal secret')); assert(!body.includes(f.env.ADMIN_PASSWORD));
});
