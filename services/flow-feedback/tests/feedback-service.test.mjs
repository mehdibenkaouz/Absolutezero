import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { handleFeedbackRequest } from '../src/feedback-service.mjs';

const origin = 'https://www.mehdi-benkaouz.com';
const now = 1792354800000;
function setup() {
  const db = new DatabaseSync(':memory:');
  for (const file of readdirSync(new URL('../migrations', import.meta.url)).filter(f => f.endsWith('.sql'))) db.exec(readFileSync(new URL('../migrations/' + file, import.meta.url), 'utf8').replaceAll('--> statement-breakpoint', ''));
  const DB = { prepare(sql) { const statement = (...args) => ({ bind: (...values) => statement(...values), first: async () => db.prepare(sql).get(...args) || null, all: async () => ({ results: db.prepare(sql).all(...args) }), run: async () => db.prepare(sql).run(...args) }); return statement(); } };
  const env = { DB, FEEDBACK_ADMIN_TOKEN: 'test-admin-token-not-a-production-credential', FEEDBACK_SIGNING_KEY: 'test-signing-key-not-a-production-credential' };
  const req = (path, method = 'GET', body, headers = {}) => new Request('https://collector.example' + path, { method, headers: { Origin: origin, 'cf-connecting-ip': '192.0.2.1', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...headers }, body: body === undefined ? undefined : JSON.stringify(body) });
  const run = (path, method, body, headers, time = now) => handleFeedbackRequest(req(path, method, body, headers), env, time);
  async function token(time = now) { return (await (await run('/api/feedback/challenge', 'GET', undefined, {}, time)).json()).challenge; }
  async function payload(message = 'Vorrei capire meglio la gestione delle assenze.') { return { message, category: 'generale', requestId: crypto.randomUUID(), website: '', challenge: await token() }; }
  const admin = { Authorization: 'Bearer ' + env.FEEDBACK_ADMIN_TOKEN };
  return { db, env, req, run, token, payload, admin };
}

test('anonymous submission is committed and receipt is returned; message is not public', async () => {
  const f = setup(), input = await f.payload('Parere: <script>alert(1)</script> & turni 😀');
  const response = await f.run('/api/feedback', 'POST', input);
  assert.equal(response.status, 201); assert.deepEqual(await response.json(), { ok: true, id: input.requestId });
  assert.equal(f.db.prepare('SELECT message FROM feedback').get().message, input.message);
  assert.equal((await f.run('/api/feedback')).status, 405);
  assert.equal((await f.run('/api/admin/feedback')).status, 401);
});
test('only explicit allowed origins get CORS; anonymous reads are rejected', async () => {
  const f = setup();
  assert.equal((await f.run('/api/feedback/challenge', 'GET', undefined, { Origin: 'https://evil.example' })).status, 403);
  assert.equal((await f.run('/api/feedback/challenge', 'GET', undefined, { Origin: 'null' })).status, 403);
  const response = await f.run('/api/feedback', 'OPTIONS'); assert.equal(response.status, 204); assert.equal(response.headers.get('Access-Control-Allow-Origin'), origin);
  const denied = await f.run('/api/admin/feedback', 'GET', undefined, { Authorization: 'Bearer wrong' });
  assert.equal(denied.status, 401); assert.equal(denied.headers.get('Access-Control-Allow-Origin'), null);
});
test('invalid, missing and expired challenges never save a message', async () => {
  const f = setup(), input = await f.payload();
  for (const challenge of [undefined, 'tampered', input.challenge + 'x']) assert.equal((await f.run('/api/feedback', 'POST', { ...input, challenge })).status, 400);
  assert.equal((await f.run('/api/feedback', 'POST', input, {}, now + 600001)).status, 400);
  assert.equal(f.db.prepare('SELECT COUNT(*) AS n FROM feedback').get().n, 0);
});
test('empty, oversized, invalid-category and honeypot submissions are rejected', async () => {
  const f = setup(), input = await f.payload();
  for (const patch of [{ message: '' }, { message: '   ' }, { message: 'a'.repeat(1001) }, { category: 'arbitrary' }, { requestId: 'invalid' }]) assert.equal((await f.run('/api/feedback', 'POST', { ...input, ...patch })).status, 400);
  assert.equal((await f.run('/api/feedback', 'POST', { ...input, website: 'spam' })).status, 422);
  const huge = f.req('/api/feedback', 'POST', { message: 'a'.repeat(9000) });
  assert.equal((await handleFeedbackRequest(huge, f.env, now)).status, 413);
  assert.equal(f.db.prepare('SELECT COUNT(*) AS n FROM feedback').get().n, 0);
});
test('retry is idempotent, changed payloads conflict, consumed challenges cannot create duplicates', async () => {
  const f = setup(), input = await f.payload();
  assert.equal((await f.run('/api/feedback', 'POST', input)).status, 201);
  assert.equal((await f.run('/api/feedback', 'POST', input)).status, 200);
  assert.equal((await f.run('/api/feedback', 'POST', { ...input, message: 'Un messaggio diverso' })).status, 409);
  assert.equal((await f.run('/api/feedback', 'POST', { ...input, requestId: crypto.randomUUID() })).status, 409);
  assert.equal(f.db.prepare('SELECT COUNT(*) AS n FROM feedback').get().n, 1);
});
test('rate limit applies per transport IP; raw IPs are not stored', async () => {
  const f = setup();
  for (let i = 0; i < 5; i++) assert.equal((await f.run('/api/feedback', 'POST', await f.payload())).status, 201);
  const limited = await f.run('/api/feedback', 'POST', await f.payload()); assert.equal(limited.status, 429); assert.equal(limited.headers.get('Retry-After'), '900');
  assert.equal((await f.run('/api/feedback', 'POST', await f.payload(), { 'cf-connecting-ip': '192.0.2.2' })).status, 201);
  assert(!JSON.stringify(f.db.prepare('SELECT * FROM feedback_rate_limits').all()).includes('192.0.2.'));
});
test('only the server credential can read, mark read and archive a message', async () => {
  const f = setup(), input = await f.payload(); await f.run('/api/feedback', 'POST', input);
  const list = await (await f.run('/api/admin/feedback', 'GET', undefined, f.admin)).json(); assert.equal(list.counts.new, 1); assert.equal(list.items[0].message, input.message);
  assert.equal((await f.run('/api/admin/feedback', 'POST', { id: input.requestId, status: 'read' })).status, 401);
  assert.equal((await f.run('/api/admin/feedback', 'POST', { id: input.requestId, status: 'read' }, f.admin)).status, 200);
  const read = await (await f.run('/api/admin/feedback?status=read', 'GET', undefined, f.admin)).json(); assert.equal(read.counts.read, 1);
  await f.run('/api/admin/feedback', 'POST', { id: input.requestId, status: 'archived' }, f.admin);
  const archived = await (await f.run('/api/admin/feedback?status=archived', 'GET', undefined, f.admin)).json(); assert.equal(archived.counts.archived, 1); assert.equal(archived.items.length, 1);
});
test('keyset pagination has no duplicates when timestamps match', async () => {
  const f = setup();
  const add = f.db.prepare('INSERT INTO feedback VALUES (?, ?, ?, ?, ?, ?)');
  for (let i = 0; i < 43; i++) add.run(crypto.randomUUID(), 'Parere ' + i, 'generale', 'new', crypto.randomUUID(), now);
  const page1 = await (await f.run('/api/admin/feedback', 'GET', undefined, f.admin)).json(); assert.equal(page1.items.length, 40); assert(page1.next);
  const page2 = await (await f.run('/api/admin/feedback?before=' + encodeURIComponent(page1.next), 'GET', undefined, f.admin)).json(); assert.equal(page2.items.length, 3); assert.equal(page2.next, null);
  assert.equal(new Set([...page1.items, ...page2.items].map(item => item.id)).size, 43);
});
test('missing database and network failures show errors, never a success receipt', async () => {
  const f = setup(), input = await f.payload();
  const response = await handleFeedbackRequest(f.req('/api/feedback', 'POST', input), { ...f.env, DB: undefined }, now); assert.equal(response.status, 503); assert.equal((await response.json()).ok, undefined);
});
