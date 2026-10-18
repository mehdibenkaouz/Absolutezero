const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(require('node:path').resolve(__dirname, '../../../flow/feedback.js'), 'utf8');

function fixture(options = {}) {
  let time = 0, timerId = 0, clipboard = '', opened; const sent = [], urls = [];
  const timers = new Map(), docEvents = {}, winEvents = {}, analytics = [], store = options.store || new Map();
  class Element {
    constructor(id) { this.id = id; this.events = {}; this.value = ''; this.open = false; this.isConnected = true; }
    addEventListener(name, fn) { (this.events[name] ||= []).push(fn); }
    fire(name, event = {}) { event.target ||= this; for (const fn of this.events[name] || []) fn(event); }
    matches(selector) { return this.kind === 'input' && selector.includes('input'); }
    setAttribute(name, value) { this[name] = value; }
    focus() { document.activeElement = this; }
    select() { this.selected = true; }
    reset() { ids.feedbackMessage.value = ''; }
    contains(el) { return el.inside; }
    showModal() { this.open = true; }
    close() { this.open = false; this.fire('close'); }
    getBoundingClientRect() { return { top: 50, bottom: 650, left: 100, right: 660 }; }
    setCustomValidity(error) { this.error = error; }
  }
  const ids = Object.fromEntries(['flowFeedback', 'feedbackForm', 'feedbackMessage', 'feedbackStatus', 'feedbackClose', 'feedbackCopy', 'feedbackDone', 'feedbackSend', 'feedbackSuccess', 'feedbackNote', 'feedbackWebsite'].map(id => [id, new Element(id)]));
  if (options.unsupported) ids.flowFeedback.showModal = undefined;
  const classes = new Set(), link = new Element('feedbackLink');
  ids.feedbackForm.reportValidity = () => !ids.feedbackMessage.error && Boolean(ids.feedbackMessage.value.trim());
  const document = {
    hidden: false, activeElement: null, fullscreenElement: null,
    body: { classList: { contains: x => classes.has(x), add: x => classes.add(x), remove: x => classes.delete(x) } },
    documentElement: { scrollHeight: 10000 },
    getElementById: id => ids[id],
    querySelectorAll: selector => selector === '[data-flow-feedback]' ? [link] : selector === 'video' ? (document.videos || []) : [],
    querySelector: selector => selector === 'dialog[open]' ? (ids.flowFeedback.open || document.otherDialog ? {} : null) : (document.themeOpen ? {} : null),
    addEventListener: (name, fn) => (docEvents[name] ||= []).push(fn)
  };
  const location = { href: '' };
  const window = { FLOW_FEEDBACK_CONFIG: { apiBase: options.independent ? 'https://flow-feedback.example.workers.dev' : '', legacyApiBase: 'https://flow-feedback-service.speedybasil5.chatgpt.site' }, flowTrack: (name, extra) => analytics.push({ name, extra }), open: (...args) => { opened = args; return null; } };
  if (options.missingConfig) delete window.FLOW_FEEDBACK_CONFIG;
  if (options.invalidConfig) window.FLOW_FEEDBACK_CONFIG.apiBase = 'https://evil.example';
  const context = {
    URL, Element, document, location, window, crypto: require('node:crypto').webcrypto, AbortController, fetch: async (url, init) => { urls.push(url); if (!init?.body) return { ok: true, json: async () => ({ challenge: 'test-challenge' }) }; const body = JSON.parse(init.body); sent.push(body); if (options.fail) throw Error('Connection error'); return { ok: true, json: async () => ({ ok: true, id: options.wrongReceipt ? 'wrong' : body.requestId }) }; }, performance: { now: () => time },
    matchMedia: () => ({ matches: Boolean(options.touch) }),
    scrollY: 0, innerWidth: 1440, innerHeight: 900,
    sessionStorage: {
      getItem: key => { if (options.noStorage) throw Error(); return store.get(key); },
      setItem: (key, value) => { if (options.noStorage) throw Error(); store.set(key, value); }
    },
    navigator: { clipboard: { writeText: async text => { if (options.noClipboard) throw Error(); clipboard = text; } } },
    addEventListener: (name, fn) => (winEvents[name] ||= []).push(fn),
    setTimeout: (fn, ms) => { timers.set(++timerId, { fn, at: time + ms }); return timerId; },
    clearTimeout: id => timers.delete(id)
  };
  vm.runInNewContext(source, context);
  const fire = (name, event = {}, events = docEvents) => { for (const fn of events[name] || []) fn(event); };
  return {
    ids, document, classes, analytics, store, location, link, sent, urls,
    tick(ms) { time += ms; for (const [id, timer] of timers) if (timer.at <= time) { timers.delete(id); timer.fn(); } },
    exit(extra = {}) { fire('mouseout', { relatedTarget: null, clientX: 400, clientY: 0, ...extra }); },
    manual() { let prevented = false; link.fire('click', { preventDefault() { prevented = true; } }); return prevented; },
    hide(value) { document.hidden = value; fire('visibilitychange'); },
    scroll(y) { context.scrollY = y; fire('scroll', {}, winEvents); },
    action() { const el = new Element('download'); el.closest = () => el; fire('click', { target: el }); },
    submit(method) { ids.feedbackForm.fire('submit', { preventDefault() {}, submitter: { value: method } }); },
    get clipboard() { return clipboard; }, get opened() { return opened; }
  };
}

(async () => {
  let count = 0;
  function test(name, fn) { fn(); count++; console.log('PASS', name); }
  test('Desktop: wait 15 seconds, ignore side exits and internal transitions', () => {
    const f = fixture(); f.exit(); assert(!f.ids.flowFeedback.open);
    f.tick(15000); f.exit({ clientX: -1 }); f.exit({ relatedTarget: {} }); assert(!f.ids.flowFeedback.open);
    f.exit(); assert(f.ids.flowFeedback.open); assert(f.classes.has('feedback-open'));
    assert.equal(f.document.activeElement, f.ids.feedbackClose);
  });
  test('One automatic invitation per session; manual reopening still works', () => {
    const f = fixture(); f.tick(16000); f.exit(); f.ids.flowFeedback.close(); f.exit(); assert(!f.ids.flowFeedback.open);
    const again = fixture({ store: f.store }); again.tick(16000); again.exit(); assert(!again.ids.flowFeedback.open);
    assert(again.manual()); assert(again.ids.flowFeedback.open);
  });
  test('Blocked session storage does not break opening or dismissal', () => {
    const f = fixture({ noStorage: true }); f.tick(15000); f.exit(); assert(f.ids.flowFeedback.open);
    f.ids.flowFeedback.close(); f.exit(); assert(!f.ids.flowFeedback.open);
  });
  test('Background time does not arm an automatic invitation', () => {
    const f = fixture(); f.tick(3000); f.hide(true); f.tick(60000); f.hide(false); f.exit(); assert(!f.ids.flowFeedback.open);
    f.tick(12000); f.exit(); assert(f.ids.flowFeedback.open);
  });
  for (const reason of ['flow-pieno', 'dialog', 'video', 'input', 'theme', 'fullscreen']) test('Does not interrupt ' + reason, () => {
    const f = fixture(); f.tick(16000);
    if (reason === 'flow-pieno') f.classes.add(reason);
    if (reason === 'dialog') f.document.otherDialog = true;
    if (reason === 'video') f.document.videos = [{ paused: false, ended: false }];
    if (reason === 'input') f.document.activeElement = { kind: 'input', matches: () => true };
    if (reason === 'theme') f.document.themeOpen = true;
    if (reason === 'fullscreen') f.document.fullscreenElement = {};
    f.exit(); assert(!f.ids.flowFeedback.open);
  });
  test('An installation/contact action suppresses automatic invitations', () => {
    const f = fixture(); f.action(); f.tick(16000); f.exit(); assert(!f.ids.flowFeedback.open); f.manual(); assert(f.ids.flowFeedback.open);
  });
  test('Mobile: time + reading + upward gesture + idle, never mouse exit', () => {
    const f = fixture({ touch: true }); f.tick(46000); f.exit(); assert(!f.ids.flowFeedback.open);
    f.scroll(5500); f.tick(2000); assert(!f.ids.flowFeedback.open);
    f.scroll(5300); f.tick(1199); assert(!f.ids.flowFeedback.open); f.tick(1); assert(f.ids.flowFeedback.open);
    assert.equal(f.analytics[0].extra.source, 'mobile_reading');
  });
  test('A pending mobile invitation is cancelled when the page is hidden', () => {
    const f = fixture({ touch: true }); f.tick(46000); f.scroll(5500); f.scroll(5300); f.hide(true); f.tick(5000); assert(!f.ids.flowFeedback.open);
  });
  test('Empty and whitespace messages do not submit', () => {
    const f = fixture(); f.manual(); f.submit(); assert.equal(f.sent.length, 0);
    f.ids.feedbackMessage.value = '   '; f.submit(); assert.equal(f.sent.length, 0);
  });
  let f = fixture(); f.manual(); f.ids.feedbackMessage.value = 'Un parere & turni 😀'; f.submit();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(f.sent.length, 1); assert.equal(f.sent[0].message, 'Un parere & turni 😀');
  assert.equal(f.ids.feedbackSuccess.hidden, false); assert.equal(f.ids.feedbackForm.hidden, true);
  assert(!JSON.stringify(f.analytics).includes('Un parere & turni'));
  console.log('PASS Only confirmed receipts show success, with no message in analytics'); count++;
  f = fixture({ fail: true }); f.manual(); f.ids.feedbackMessage.value = 'Il mio parere'; f.submit();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(f.ids.feedbackMessage.value, 'Il mio parere'); assert.notEqual(f.ids.feedbackSuccess.hidden, false);
  assert.equal(f.ids.feedbackSend.disabled, false); assert(f.ids.feedbackStatus.textContent);
  const requestId = f.sent[0].requestId; f.submit(); await new Promise(resolve => setImmediate(resolve));
  assert.equal(f.sent[1].requestId, requestId);
  console.log('PASS Errors preserve the message and retries reuse the request UUID'); count++;
  f = fixture({ wrongReceipt: true }); f.manual(); f.ids.feedbackMessage.value = 'Il mio parere'; f.submit();
  await new Promise(resolve => setImmediate(resolve)); assert.notEqual(f.ids.feedbackSuccess.hidden, false);
  console.log('PASS A mismatched receipt never displays success'); count++;
  for (const options of [{ missingConfig: true }, { invalidConfig: true }]) {
    const f = fixture(options); f.manual(); f.ids.feedbackMessage.value = 'Non perdere questo parere'; f.submit();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(f.urls.length, 0); assert.equal(f.ids.feedbackMessage.value, 'Non perdere questo parere'); assert.notEqual(f.ids.feedbackSuccess.hidden, false); count++;
    console.log('PASS Missing or invalid configuration fails closed and preserves text');
  }
  {
    const f = fixture({ independent: true }); f.manual(); f.ids.feedbackMessage.value = 'Parere sul nuovo archivio'; f.submit();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(f.sent.length, 1); assert(f.urls.every(url => url.startsWith('https://flow-feedback.example.workers.dev/api/feedback'))); count++;
    console.log('PASS Independent configuration never calls the previous ChatGPT service');
  }
  test('Unsupported dialog leaves the page anchor available', () => {
    const f = fixture({ unsupported: true }); assert(!f.manual()); assert(!f.ids.flowFeedback.open);
  });
  console.log(`${count} checks passed (controller tests; no browser rendering).`);
})().catch(error => { console.error(error); process.exit(1); });
