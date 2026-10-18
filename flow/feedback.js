/* Feedback goes through the visitor's email account, not an unconfigured API.
   Never send the message (or an email address) to analytics. */
(() => {
  'use strict';
  const dialog = document.getElementById('flowFeedback');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  const form = document.getElementById('feedbackForm');
  const message = document.getElementById('feedbackMessage');
  const status = document.getElementById('feedbackStatus');
  const recipient = 'mehdi@mehdi-benkaouz.com';
  const subject = 'Un parere su Flow';
  const sessionKey = 'flow.feedback.prompted.v1';
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
    // Track attempts, never claim that an email was actually sent.
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
    status.textContent = '';
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

  function body() {
    return message.value.trim() + '\n\n—\nParere sulla pagina Flow\nhttps://www.mehdi-benkaouz.com/Absolutezero/flow/';
  }

  function valid() {
    message.setCustomValidity(message.value.trim() ? '' : 'Scrivi il tuo parere, basta anche una frase.');
    return form.reportValidity();
  }
  message.addEventListener('input', () => message.setCustomValidity(''));

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!valid()) return;
    const method = event.submitter && event.submitter.value === 'gmail' ? 'gmail' : 'email';
    if (method === 'gmail') {
      const url = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(recipient) +
        '&su=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body());
      window.open(url, '_blank', 'noopener,noreferrer');
      status.textContent = 'Invia la bozza da Gmail. Se non si apre una nuova scheda, usa “Prepara l’email” oppure “Copia il messaggio”.';
    } else {
      location.href = 'mailto:' + recipient + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body());
      status.textContent = 'Invia la bozza dalla tua app di posta. Se non si apre, usa Gmail oppure copia il messaggio.';
    }
    track('flow_feedback_email_draft', { method });
  });

  document.getElementById('feedbackCopy').addEventListener('click', async () => {
    if (!valid()) return;
    try {
      await navigator.clipboard.writeText('A: ' + recipient + '\nOggetto: ' + subject + '\n\n' + body());
      status.textContent = 'Messaggio copiato. Incollalo nella tua posta e invialo a ' + recipient + '.';
      track('flow_feedback_copy');
    } catch (_) {
      message.focus();
      message.select();
      status.textContent = 'Copia il testo selezionato e invialo a ' + recipient + '.';
    }
  });
})();
