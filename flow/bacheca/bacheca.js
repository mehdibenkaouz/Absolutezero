(() => {
  'use strict';
  if (window.top !== window.self) { document.body.textContent = 'Apri la bacheca direttamente dal sito Flow.'; return; }
  const $ = id => document.getElementById(id);
  let api = '', token = '', expiresAt = 0, filter = 'all', next = null, busy = false, generation = 0, logoutTimer;
  const categories = { generale: 'Un parere', funzioni: 'Funzioni', prezzo: 'Prezzo', demo: 'Demo', installazione: 'Installazione' };
  const statuses = { new: 'Da leggere', read: 'Letto', archived: 'Archiviato' };
  const date = new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Rome' });
  function notice(text = '', error = false) { $('notice').textContent = text; $('notice').classList.toggle('error', error); }
  function apiOrigin(value) {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || url.search || url.hash || !['', '/'].includes(url.pathname) ||
      !(url.hostname.endsWith('.workers.dev') || url.hostname === 'mehdi-benkaouz.com' || url.hostname.endsWith('.mehdi-benkaouz.com'))) throw Error('Inserisci l’indirizzo HTTPS del servizio nel tuo account Cloudflare.');
    return url.origin;
  }
  function clearSession(text = '') {
    generation++; token = ''; expiresAt = 0; next = null; busy = false; clearTimeout(logoutTimer);
    $('messages').replaceChildren(); $('password').value = ''; $('board').hidden = true; $('logout').hidden = true; $('login').hidden = !api; $('more').hidden = true;
    $('login-button').disabled = false; notice(text);
  }
  async function request(path, options = {}, authenticate = true) {
    if (authenticate && (!token || Date.now() >= expiresAt)) { clearSession('La sessione è terminata. Accedi di nuovo.'); throw Error('Accedi di nuovo per leggere i messaggi.'); }
    const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(authenticate ? { Authorization: 'Bearer ' + token } : {}) };
    const result = await fetch(api + path, { ...options, headers, cache: 'no-store', credentials: 'omit', redirect: 'error', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(15000) });
    const data = await result.json();
    if (result.status === 401 && authenticate) clearSession('La sessione è terminata. Accedi di nuovo.');
    if (!result.ok) throw Error(data.error || 'Non riesco a contattare l’archivio. Riprova.');
    return data;
  }
  async function connect(value) {
    const target = apiOrigin(value);
    const result = await fetch(target + '/health', { cache: 'no-store', credentials: 'omit', redirect: 'error', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(10000) });
    const data = await result.json();
    if (!result.ok || data.service !== 'flow-feedback' || data.auth !== 'password' || data.ready !== true) throw Error('Il servizio non è ancora pronto. Controlla la configurazione in Cloudflare.');
    api = target; $('setup').hidden = true; $('login').hidden = false; notice(); $('password').focus();
  }
  function button(text, status, item) {
    const el = document.createElement('button'); el.type = 'button'; el.textContent = text; el.addEventListener('click', () => change(item, status)); return el;
  }
  function message(item) {
    const article = document.createElement('article'); article.className = 'message message--' + (statuses[item.status] ? item.status : 'new');
    const top = document.createElement('div'); top.className = 'message-top';
    const category = document.createElement('span'); category.className = 'category'; category.textContent = categories[item.category] || 'Un parere';
    const state = document.createElement('span'); state.className = 'status'; state.textContent = statuses[item.status] || 'Da leggere';
    const time = document.createElement('time'); time.dateTime = new Date(item.created_at).toISOString(); time.textContent = date.format(item.created_at); top.append(category, state, time);
    const text = document.createElement('p'); text.className = 'message-body'; text.textContent = item.message;
    const actions = document.createElement('div'); actions.className = 'message-actions';
    if (item.status === 'new') actions.append(button('Segna come letto', 'read', item));
    if (item.status === 'read') actions.append(button('Da rileggere', 'new', item));
    actions.append(item.status === 'archived' ? button('Ripristina', 'new', item) : button('Archivia', 'archived', item));
    article.append(top, text, actions); return article;
  }
  function setBusy(value) {
    busy = value; $('refresh').disabled = value; $('more').disabled = value; $('messages').setAttribute('aria-busy', String(value));
    document.querySelectorAll('.message-actions button').forEach(el => { el.disabled = value; });
  }
  async function load(cursor) {
    const current = ++generation; setBusy(true);
    const query = new URLSearchParams({ status: filter }); if (cursor) query.set('before', cursor);
    try {
      const data = await request('/api/admin/feedback?' + query);
      if (current !== generation || !token) return;
      if (!cursor) $('messages').replaceChildren();
      const fragment = document.createDocumentFragment(); data.items.forEach(item => fragment.append(message(item))); $('messages').append(fragment);
      $('new-count').textContent = data.counts.new; $('total-count').textContent = data.counts.total;
      for (const f of ['all', 'new', 'read', 'archived']) $('count-' + f).textContent = data.counts[f === 'all' ? 'total' : f];
      next = data.next; $('more').hidden = !next; $('empty').hidden = $('messages').childElementCount > 0;
      $('updated').textContent = 'Ultimo aggiornamento: ' + date.format(Date.now());
    } catch (error) { if (current === generation) notice(error.message || 'Connessione non riuscita.', true); }
    finally { if (current === generation) setBusy(false); }
  }
  async function change(item, status) {
    if (busy) return; const current = generation; setBusy(true); notice();
    try {
      const data = await request('/api/admin/feedback', { method: 'POST', body: JSON.stringify({ id: item.id, status }) });
      if (current !== generation || !token) return;
      if (data.ok !== true) throw Error('Il messaggio non è stato aggiornato.');
      notice(status === 'archived' ? 'Messaggio archiviato.' : status === 'read' ? 'Messaggio segnato come letto.' : 'Messaggio riportato tra quelli da leggere.'); await load();
    } catch (error) { if (current === generation) notice(error.message, true); }
    finally { if (current === generation) setBusy(false); }
  }
  $('connect-form').addEventListener('submit', async event => {
    event.preventDefault(); $('connect-button').disabled = true; notice('Controllo dell’archivio…');
    try { await connect($('api-url').value.trim()); notice('Archivio collegato in questa finestra. Salva questo indirizzo nella configurazione del sito per trasferire anche i nuovi invii.'); }
    catch (error) { notice(error.message, true); }
    finally { $('connect-button').disabled = false; }
  });
  $('login-form').addEventListener('submit', async event => {
    event.preventDefault(); if ($('login-button').disabled) return; $('login-button').disabled = true; notice();
    const password = $('password').value; $('password').value = '';
    try {
      const data = await request('/api/admin/login', { method: 'POST', body: JSON.stringify({ password }) }, false);
      if (data.ok !== true || !/^[A-Za-z0-9_-]{43}$/.test(data.token) || !Number.isSafeInteger(data.expiresAt)) throw Error('Risposta di accesso non valida.');
      token = data.token; expiresAt = data.expiresAt; $('login').hidden = true; $('board').hidden = false; $('logout').hidden = false;
      logoutTimer = setTimeout(() => clearSession('La sessione è terminata. Accedi di nuovo.'), Math.max(0, expiresAt - Date.now())); await load();
    } catch (error) { notice(error.message, true); }
    finally { $('login-button').disabled = false; }
  });
  $('logout').addEventListener('click', async () => {
    // Revoke server-side before forgetting the in-memory token; clear the screen immediately.
    const logoutRequest = request('/api/admin/logout', { method: 'POST' }); clearSession('Sei uscito dalla bacheca.');
    try { await logoutRequest; } catch { notice('Accesso chiuso su questa pagina. Non è stato possibile revocare la sessione sul server: scadrà entro 30 minuti.', true); }
  });
  $('refresh').addEventListener('click', () => { if (!busy) { notice(); load(); } });
  $('more').addEventListener('click', () => { if (!busy && next) load(next); });
  document.querySelectorAll('[data-filter]').forEach(el => el.addEventListener('click', () => {
    if (busy || filter === el.dataset.filter) return; filter = el.dataset.filter; notice();
    document.querySelectorAll('[data-filter]').forEach(tab => tab.setAttribute('aria-pressed', String(tab === el))); load();
  }));
  (async () => {
    try { const config = window.FLOW_FEEDBACK_CONFIG; if (config?.apiBase) { await connect(config.apiBase); return; } }
    catch { notice('Non riesco a collegare l’archivio configurato. Puoi controllare l’indirizzo qui sotto.', true); }
    $('setup').hidden = false;
  })();
})();
