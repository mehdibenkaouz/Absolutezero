import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const value = process.argv[2];
if (!value) { console.error('Uso: npm run connect -- https://flow-feedback.nome-account.workers.dev'); process.exit(1); }
const url = new URL(value);
if (url.protocol !== 'https:' || url.username || url.password || url.port || url.search || url.hash || url.pathname !== '/' || !(url.hostname.endsWith('.workers.dev') || url.hostname === 'mehdi-benkaouz.com' || url.hostname.endsWith('.mehdi-benkaouz.com'))) throw Error('Serve l’origine HTTPS del servizio nel tuo account, senza percorsi o parametri.');
const result = await fetch(url.origin + '/health', { headers: { Origin: 'https://www.mehdi-benkaouz.com' }, redirect: 'error', signal: AbortSignal.timeout(15000) });
const data = await result.json();
if (!result.ok || data.service !== 'flow-feedback' || data.ready !== true || data.auth !== 'password') throw Error('Il nuovo servizio non è ancora pronto. Nessuna configurazione è stata modificata.');
const challengeResult = await fetch(url.origin + '/api/feedback/challenge', { headers: { Origin: 'https://www.mehdi-benkaouz.com' }, redirect: 'error', signal: AbortSignal.timeout(15000) });
const challenge = await challengeResult.json();
if (!challengeResult.ok || typeof challenge.challenge !== 'string' || challengeResult.headers.get('Access-Control-Allow-Origin') !== 'https://www.mehdi-benkaouz.com') throw Error('Il servizio non accetta ancora gli invii dal sito Flow. Nessuna modifica.');
const file = new URL('../../../flow/feedback-config.js', import.meta.url);
await readFile(file); // Do not silently write into the wrong checkout.
await writeFile(file, '/* Independent feedback service, owned and hosted outside ChatGPT. */\nwindow.FLOW_FEEDBACK_CONFIG = Object.freeze(' + JSON.stringify({ apiBase: url.origin }, null, 2) + ');\n');
console.log('Configurazione aggiornata: ' + fileURLToPath(file));
console.log('Rivedi e pubblica questo file su GitHub. Nessuna password o chiave è stata scritta nel repository.');
