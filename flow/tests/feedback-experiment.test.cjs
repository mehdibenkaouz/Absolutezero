const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(require('node:path').join(__dirname, '../feedback.js'), 'utf8');

function fixture(options = {}) {
  let time = 0, timerId = 0, clipboard = '', opened; const sent = [];
  const frames = new Map(); let frameId = 0;
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
  ids.feedbackForm.querySelectorAll = () => [];
  ids.flowFeedback.getBoundingClientRect = () => options.offscreen ? {width:400,height:500,top:2000,left:0,bottom:2500,right:400} : {width:400,height:500,top:50,left:100,bottom:550,right:500};
  const location = { href: '' };
  const window = { FLOW_FEEDBACK_CONFIG: {apiBase:'https://flow-feedback.convergegame.workers.dev'}, FLOW_FEEDBACK_EXPERIMENT: options.experiment, flowTrack: (name, extra) => analytics.push({ name, extra }), open: (...args) => { opened = args; return null; } };
  const context = {
    URL, Element, document, location, window, crypto: require('node:crypto').webcrypto, AbortController, fetch: async (url, init) => { if (!init?.body) return { ok: true, json: async () => ({ challenge: 'test-challenge' }) }; const body = JSON.parse(init.body); sent.push(body); if (options.fail) throw Error('Connection error'); return { ok: true, json: async () => ({ ok: true, id: options.wrongReceipt ? 'wrong' : body.requestId }) }; }, performance: { now: () => time },
    matchMedia: () => ({ matches: Boolean(options.touch) }),
    scrollY: 0, innerWidth: 1440, innerHeight: 900,
    sessionStorage: {
      getItem: key => { if (options.noStorage) throw Error(); return store.get(key); },
      setItem: (key, value) => { if (options.noStorage) throw Error(); store.set(key, value); }
    },
    navigator: { clipboard: { writeText: async text => { if (options.noClipboard) throw Error(); clipboard = text; } } },
    addEventListener: (name, fn) => (winEvents[name] ||= []).push(fn),
    requestAnimationFrame: fn => { frames.set(++frameId, fn); return frameId; },
    cancelAnimationFrame: id => frames.delete(id),
    setTimeout: (fn, ms) => { timers.set(++timerId, { fn, at: time + ms }); return timerId; },
    clearTimeout: id => timers.delete(id)
  };
  vm.runInNewContext(source, context);
  const fire = (name, event = {}, events = docEvents) => { for (const fn of events[name] || []) fn(event); };
  return {
    frame() { const pending = [...frames.values()]; frames.clear(); for(const fn of pending) fn(); },
    ids, document, classes, analytics, store, location, link, sent,
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
 const impression = f => f.analytics.filter(e=>e.name==='flow_feedback_impression');
 let f=fixture(); f.manual(); assert.equal(impression(f).length,0); f.frame(); assert.equal(impression(f).length,0); f.frame(); assert.equal(impression(f).length,1); f.frame(); assert.equal(impression(f).length,1);
 f=fixture(); f.manual(); f.frame(); f.ids.flowFeedback.close(); f.frame(); assert.equal(impression(f).length,0);
 f=fixture(); f.manual(); f.hide(true); f.frame(); f.frame(); assert.equal(impression(f).length,0); f.hide(false); f.frame(); f.frame(); assert.equal(impression(f).length,1);
 f=fixture({offscreen:true}); f.manual(); f.frame(); f.frame(); assert.equal(impression(f).length,0);
 const experiment={id:'fb_barrier_v1',variant:'B',lang:'it',reason:()=> 'installation',answer:()=> 'installation — Non voglio installare'};
 f=fixture({experiment}); f.ids.feedbackForm.reportValidity=()=>!f.ids.feedbackMessage.error; f.manual(); f.frame(); f.frame(); f.submit(); await new Promise(r=>setImmediate(r));
 assert.equal(f.sent.length,1); assert(f.sent[0].message.includes('fb_barrier_v1 | B | it')); assert(f.sent[0].message.includes('installation'));
 const sent=f.analytics.find(e=>e.name==='flow_feedback_submit'); assert.equal(sent.extra.variant,'B'); assert.equal(sent.extra.reason,'installation');
 assert(!JSON.stringify(f.analytics).includes('Non voglio installare'));
 f=fixture({experiment:{...experiment,answer:()=>''}}); f.ids.feedbackForm.reportValidity=()=>!f.ids.feedbackMessage.error; f.submit(); assert.equal(f.sent.length,0);
 console.log('PASS: painted visible impression; close/hidden/offscreen suppression; resume; metadata; quick-answer persistence; no answer text in analytics; empty response rejected.');
})().catch(e=>{console.error(e);process.exit(1)});
