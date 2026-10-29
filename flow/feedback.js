/* Send directly to the feedback service. Only confirmed database receipts
   show success. Never send message text or contact details to analytics. */
(() => {
  'use strict';
  const dialog = document.getElementById('flowFeedback');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  const form = document.getElementById('feedbackForm');
  const message = document.getElementById('feedbackMessage');
  const status = document.getElementById('feedbackStatus');
  const copy = window.FLOW_FEEDBACK_COPY || {};
  const config = window.FLOW_FEEDBACK_CONFIG;
  let endpoint = null;
  try {
    const independent = Boolean(config?.apiBase);
    const base = new URL(independent ? config.apiBase : config?.legacyApiBase);
    const allowed = independent
      ? base.hostname.endsWith('.workers.dev') || base.hostname === 'mehdi-benkaouz.com' || base.hostname.endsWith('.mehdi-benkaouz.com')
      : base.hostname === 'flow-feedback-service.speedybasil5.chatgpt.site';
    if (allowed && base.protocol === 'https:' && !base.username && !base.password && !base.port && !base.search && !base.hash && base.pathname === '/') endpoint = base.origin + '/api/feedback';
  } catch { /* Fail closed when the configuration script is unavailable. */ }
  const send = document.getElementById('feedbackSend');
  const success = document.getElementById('feedbackSuccess');
  const note = document.getElementById('feedbackNote');
  const experiment = window.FLOW_FEEDBACK_EXPERIMENT;
  let impressionFrame = 0, impressionSent = false, started = false;
  let sending = false, sent = false, requestId = null;
  const sessionKey = 'flow.feedback.prompted.v2';
  const touch = matchMedia('(hover: none), (pointer: coarse)');
  let prompted = false;
  let source = 'manual';
  let previousFocus = null;
  let visibleTime = 0;
  let visibleSince = document.hidden ? null : performance.now();
  let lastScroll = scrollY;

  try { prompted = sessionStorage.getItem(sessionKey) === '1'; } catch (_) { /* in-memory limit still works */ }

  function markPrompted() {
    prompted = true;
    try { sessionStorage.setItem(sessionKey, '1'); } catch (_) { /* storage may be unavailable */ }
  }

  function track(name, extra = {}) {
    // Track interactions without message content or identifying fields.
    if (typeof window.flowTrack === 'function') window.flowTrack(name, { source, ...(experiment ? {experiment_id: experiment.id, variant: experiment.variant, language: experiment.lang} : {}), ...extra });
  }

  function visiblePopup() {
    const rect = dialog.getBoundingClientRect();
    return dialog.open && !document.hidden && rect.width > 0 && rect.height > 0 &&
      rect.bottom > 0 && rect.right > 0 && rect.top < innerHeight && rect.left < innerWidth;
  }
  function observeImpression() {
    cancelAnimationFrame(impressionFrame);
    if (impressionSent || !visiblePopup()) return;
    // Two frames allow the browser to render the modal before recording exposure.
    impressionFrame = requestAnimationFrame(() => {
      impressionFrame = requestAnimationFrame(() => {
        if (impressionSent || !visiblePopup()) return;
        impressionSent = true;
        track('flow_feedback_impression', {visibility_rule: 'painted_visible_v1'});
      });
    });
  }
  function startAnswer() {
    if (!started) { started = true; track('flow_feedback_start'); }
  }
  function feedbackText() {
    const text = message.value.trim();
    if (!experiment) return text;
    const answer = experiment.answer();
    if (!text && !answer) return '';
    return '[Test ' + experiment.id + ' | ' + experiment.variant + ' | ' + experiment.lang +
      ']\n' + (answer ? 'Risposta: ' + answer + '\n' : '') + text;
  }

  function timeOnPage() {
    return visibleTime + (visibleSince === null ? 0 : performance.now() - visibleSince);
  }

  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(impressionFrame);
    if (!document.hidden) observeImpression();
    if (document.hidden) {
      if (visibleSince !== null) visibleTime += performance.now() - visibleSince;
      visibleSince = null;
    } else visibleSince = performance.now();
  });

  function busy() {
    const active = document.activeElement;
    return document.hidden || document.body.classList.contains('flow-pieno') ||
      Boolean(document.fullscreenElement) || Boolean(document.querySelector('dialog[open]')) ||
      Boolean(active && active.matches('input, textarea, select, [contenteditable="true"]')) ||
      Boolean(document.querySelector('#temaPannello:not([hidden])')) ||
      [...document.querySelectorAll('video')].some(video => !video.paused && !video.ended);
  }

  function open(trigger) {
    if (dialog.open || (trigger !== 'manual' && (prompted || busy()))) return;
    previousFocus = document.activeElement;
    source = trigger;
    if (trigger === 'manual' && sent) {
      form.reset(); sent = false; requestId = null; success.hidden = true; form.hidden = false; note.hidden = false;
    }
    if (!sending) status.textContent = '';
    impressionSent = false; started = false;
    dialog.showModal();
    observeImpression();
    document.body.classList.add('feedback-open');
    markPrompted();
    track('flow_feedback_open');
    // Keep the soft keyboard closed until a mobile visitor chooses to type.
    document.getElementById('feedbackClose').focus({ preventScroll: true });
  }

  document.querySelectorAll('[data-flow-feedback]').forEach(link => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', event => {
      // Preserve normal new-tab and modifier-key link behaviour.
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      open('manual');
    });
  });

  document.getElementById('feedbackClose').addEventListener('click', () => dialog.close());
  document.getElementById('feedbackDone').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  // Escape is handled by the native dialog, including its focus trap.
  dialog.addEventListener('close', () => {
    cancelAnimationFrame(impressionFrame);
    document.body.classList.remove('feedback-open');
    track('flow_feedback_close');
    if (previousFocus && previousFocus.isConnected && previousFocus !== document.body) previousFocus.focus({ preventScroll: true });
  });

  // A top-edge mouse exit is a signal, not a guaranteed tab-close event.
  // Do not interfere with Back, navigation, reload or tab closing.
  document.addEventListener('mouseout', event => {
    if (touch.matches || event.relatedTarget || event.clientY > 6 ||
        event.clientX < 0 || event.clientX > innerWidth || timeOnPage() < 15000) return;
    open('exit_intent');
  });

  // Ask immediately on the first upward scroll, on desktop and mobile.
  // Clamp overscroll so the elastic bounce at a page edge is not an exit signal.
  addEventListener('scroll', () => {
    const available = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    const y = Math.max(0, Math.min(scrollY, available));
    const upward = y < lastScroll;
    lastScroll = y;
    if (upward) open('scroll_up');
  }, { passive: true });

  // A visitor choosing installation or contact is already taking action.
  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    const action = target && target.closest('[data-flow-download], ms-store-badge, a[href$=".apk"], a[href^="mailto:"]');
    if (action && !action.matches('[data-flow-feedback]') && !dialog.contains(action)) markPrompted();
  }, { capture: true });

  function valid() {
    message.setCustomValidity(feedbackText() ? '' : (copy.required || 'Scrivi il tuo parere, basta anche una frase.'));
    return form.reportValidity();
  }
  message.addEventListener('input', () => { startAnswer(); message.setCustomValidity(''); if (!sending) requestId = null; });

  form.addEventListener('change', event => {
    if (event.target.name !== 'feedbackReason') return;
    startAnswer(); message.setCustomValidity(''); requestId = null;
    track('flow_feedback_choice', {reason: experiment?.reason() || ''});
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || sent || !valid()) return;
    form.querySelectorAll('input[name=feedbackReason]').forEach(input => { input.disabled = true; });
    sending = true; send.disabled = true; message.readOnly = true;
    send.textContent = (copy.sending || 'Invio in corso…'); status.textContent = '';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      if (!endpoint) throw new Error((copy.unavailable || 'Il servizio non è disponibile. Il testo è ancora qui: riprova tra poco.'));
      requestId = requestId || crypto.randomUUID();
      const tokenResponse = await fetch(endpoint + '/challenge', { credentials: 'omit', cache: 'no-store', signal: controller.signal });
      const token = await tokenResponse.json();
      if (!tokenResponse.ok || typeof token.challenge !== 'string') throw new Error((copy.unavailable || 'Il servizio non è disponibile. Il testo è ancora qui: riprova tra poco.'));
      const response = await fetch(endpoint, {
        method: 'POST', credentials: 'omit', cache: 'no-store', signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: feedbackText(), category: 'generale', requestId, challenge: token.challenge, website: document.getElementById('feedbackWebsite').value })
      });
      const receipt = await response.json();
      if (!response.ok || receipt.ok !== true || receipt.id !== requestId) throw new Error(response.status === 429 ? (copy.rateLimit || 'Riprova tra 15 minuti.') : (copy.error || 'Non ho potuto confermare l’invio. Il testo è ancora qui: riprova.'));
      sent = true; form.hidden = true; note.hidden = true; success.hidden = false;
      status.textContent = ''; success.focus({ preventScroll: true });
      track('flow_feedback_submit', {reason: experiment?.reason() || 'text_only'});
    } catch (error) {
      status.textContent = error.name === 'AbortError' ? (copy.timeout || 'La connessione è lenta e non ho potuto confermare l’invio. Il testo è ancora qui: riprova.') : (error.message || copy.error || 'Non ho potuto confermare l’invio. Il testo è ancora qui: riprova.');
      track('flow_feedback_error');
    } finally {
      form.querySelectorAll('input[name=feedbackReason]').forEach(input => { input.disabled = false; });
      clearTimeout(timeout); sending = false; send.disabled = false; message.readOnly = false;
      send.textContent = (copy.send || 'Invia il tuo parere ↗');
    }
  });
})();
