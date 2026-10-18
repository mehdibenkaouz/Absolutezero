/* Send directly to the feedback service. Only confirmed database receipts
   show success. Never send message text or contact details to analytics. */
(() => {
  'use strict';
  const dialog = document.getElementById('flowFeedback');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  const form = document.getElementById('feedbackForm');
  const message = document.getElementById('feedbackMessage');
  const status = document.getElementById('feedbackStatus');
  const endpoint = 'https://flow-feedback-service.speedybasil5.chatgpt.site/api/feedback';
  const send = document.getElementById('feedbackSend');
  const success = document.getElementById('feedbackSuccess');
  const note = document.getElementById('feedbackNote');
  let sending = false, sent = false, requestId = null;
  const sessionKey = 'flow.feedback.prompted.v2';
  const touch = matchMedia('(hover: none), (pointer: coarse)');
  let prompted = false;
  let source = 'manual';
  let previousFocus = null;
  let visibleTime = 0;
  let visibleSince = document.hidden ? null : performance.now();
  let lastScroll = scrollY;
  let deepestScroll = scrollY;
  let readingTimer;

  try { prompted = sessionStorage.getItem(sessionKey) === '1'; } catch (_) { /* in-memory limit still works */ }

  function markPrompted() {
    prompted = true;
    clearTimeout(readingTimer);
    try { sessionStorage.setItem(sessionKey, '1'); } catch (_) { /* storage may be unavailable */ }
  }

  function track(name, extra = {}) {
    // Track interactions without message content or identifying fields.
    if (typeof window.flowTrack === 'function') window.flowTrack(name, { source, ...extra });
  }

  function timeOnPage() {
    return visibleTime + (visibleSince === null ? 0 : performance.now() - visibleSince);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (visibleSince !== null) visibleTime += performance.now() - visibleSince;
      visibleSince = null;
      clearTimeout(readingTimer);
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
    dialog.showModal();
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

  // Phones have no exit pointer. Offer feedback after 45 visible seconds,
  // half the page explored, and a clear upward scroll, once scrolling stops.
  addEventListener('scroll', () => {
    const y = scrollY;
    if (y > lastScroll) deepestScroll = y;
    const upward = deepestScroll - y;
    lastScroll = y;
    clearTimeout(readingTimer);
    const available = document.documentElement.scrollHeight - innerHeight;
    if (!touch.matches || prompted || available <= 0 || deepestScroll / available < 0.5 ||
        upward < 120 || timeOnPage() < 45000) return;
    readingTimer = setTimeout(() => open('mobile_reading'), 1200);
  }, { passive: true });

  // A visitor choosing installation or contact is already taking action.
  document.addEventListener('click', event => {
    const target = event.target instanceof Element ? event.target : null;
    const action = target && target.closest('[data-flow-download], ms-store-badge, a[href$=".apk"], a[href^="mailto:"]');
    if (action && !action.matches('[data-flow-feedback]') && !dialog.contains(action)) markPrompted();
  }, { capture: true });

  function valid() {
    message.setCustomValidity(message.value.trim() ? '' : 'Scrivi il tuo parere, basta anche una frase.');
    return form.reportValidity();
  }
  message.addEventListener('input', () => { message.setCustomValidity(''); if (!sending) requestId = null; });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || sent || !valid()) return;
    sending = true; send.disabled = true; message.readOnly = true;
    send.textContent = 'Invio in corso…'; status.textContent = '';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      requestId = requestId || crypto.randomUUID();
      const tokenResponse = await fetch(endpoint + '/challenge', { credentials: 'omit', cache: 'no-store', signal: controller.signal });
      const token = await tokenResponse.json();
      if (!tokenResponse.ok || typeof token.challenge !== 'string') throw new Error('Il servizio non è disponibile. Il testo è ancora qui: riprova tra poco.');
      const response = await fetch(endpoint, {
        method: 'POST', credentials: 'omit', cache: 'no-store', signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.value.trim(), category: 'generale', requestId, challenge: token.challenge, website: document.getElementById('feedbackWebsite').value })
      });
      const receipt = await response.json();
      if (!response.ok || receipt.ok !== true || receipt.id !== requestId) throw new Error(receipt.error || 'Non ho potuto confermare l’invio. Il testo è ancora qui: riprova.');
      sent = true; form.hidden = true; note.hidden = true; success.hidden = false;
      status.textContent = ''; success.focus({ preventScroll: true });
      track('flow_feedback_submit');
    } catch (error) {
      status.textContent = error.name === 'AbortError' ? 'La connessione è lenta e non ho potuto confermare l’invio. Il testo è ancora qui: riprova.' : (error.message || 'Non ho potuto confermare l’invio. Il testo è ancora qui: riprova.');
      track('flow_feedback_error');
    } finally {
      clearTimeout(timeout); sending = false; send.disabled = false; message.readOnly = false;
      send.textContent = 'Invia il tuo parere ↗';
    }
  });
})();
