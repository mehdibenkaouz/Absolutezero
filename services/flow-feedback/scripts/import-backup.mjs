import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const source = process.argv[2], remote = process.argv.includes('--remote');
if (!source || source.startsWith('--')) { console.error('Uso: node scripts/import-backup.mjs /percorso/privato/pareri.json [--remote]'); process.exit(1); }
const parsed = JSON.parse(await readFile(source, 'utf8')); const items = Array.isArray(parsed) ? parsed : parsed.items;
if (!Array.isArray(items) || items.length > 10000) throw Error('Backup non valido o troppo grande.');
const quote = text => "'" + text.replaceAll("'", "''") + "'";
const seen = new Set();
const sql = items.map(item => {
  if (!/^[a-f0-9-]{36}$/i.test(item.id) || seen.has(item.id) || typeof item.message !== 'string' || item.message.length > 1000 || !item.message.trim() || !['generale', 'funzioni', 'prezzo', 'demo', 'installazione'].includes(item.category) || !['new', 'read', 'archived'].includes(item.status) || !Number.isSafeInteger(item.created_at) || item.created_at < 0) throw Error('Il backup contiene una riga non valida. Nessun dato è stato importato.');
  seen.add(item.id);
  const nonce = 'import-' + item.id;
  return 'INSERT INTO feedback (id, message, category, status, nonce, created_at) VALUES (' + [item.id, item.message, item.category, item.status, nonce].map(quote).join(', ') + ', ' + item.created_at + ') ON CONFLICT(id) DO NOTHING;';
}).join('\n');
const temp = await mkdtemp(join(tmpdir(), 'flow-feedback-import-'));
try {
  const file = join(temp, 'import.sql'); await writeFile(file, sql, { mode: 0o600 });
  // Wrangler authenticates using the operator's own account. Never pass secrets as arguments.
  const result = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['wrangler', 'd1', 'execute', 'DB', remote ? '--remote' : '--local', '--file', file], { stdio: 'inherit', shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) throw Error('Importazione non completata. Puoi riprovare: gli ID esistenti non vengono duplicati.');
  console.log('Importazione completata per ' + items.length + ' righe. Verifica il risultato nella bacheca; conserva il backup in un luogo privato.');
} finally { await rm(temp, { recursive: true, force: true }); }
