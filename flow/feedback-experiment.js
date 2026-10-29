/* Experiment fb_barrier_v1: random assignment per session, no personal identifiers. */
(() => {
  'use strict';
  const translations = {"it": [["Cosa ti ferma dal provare Flow?", "Cosa cercavi che qui non hai trovato?", "Cosa dovremmo chiarire su Flow?"], "Basta una scelta. Se vuoi, aggiungi un dettaglio.", ["Non mi serve", "Non capisco come funziona", "Non voglio installare", "Altro"], "Un dettaglio, se vuoi · massimo 800 caratteri", "Scegli una risposta o scrivi un dettaglio.", "Invia risposta ↗"], "en": [["What stops you from trying Flow?", "What were you looking for but couldn’t find?", "What should we explain about Flow?"], "One choice is enough. You can add a detail if you wish.", ["I don’t need it", "I don’t understand how it works", "I don’t want to install it", "Other"], "Add a detail, if you wish · maximum 800 characters", "Choose an answer or write a detail.", "Send answer ↗"], "fr": [["Qu’est-ce qui vous empêche d’essayer Flow ?", "Que cherchiez-vous sans le trouver ici ?", "Que devrions-nous expliquer sur Flow ?"], "Un choix suffit. Vous pouvez ajouter un détail.", ["Je n’en ai pas besoin", "Je ne comprends pas son fonctionnement", "Je ne veux pas l’installer", "Autre"], "Un détail, si vous voulez · 800 caractères maximum", "Choisissez une réponse ou ajoutez un détail.", "Envoyer la réponse ↗"], "de": [["Was hält Sie davon ab, Flow auszuprobieren?", "Was haben Sie hier gesucht und nicht gefunden?", "Was sollten wir zu Flow erklären?"], "Eine Auswahl genügt. Sie können ein Detail ergänzen.", ["Ich brauche es nicht", "Ich verstehe die Funktionsweise nicht", "Ich möchte nichts installieren", "Sonstiges"], "Optional ein Detail · maximal 800 Zeichen", "Wählen Sie eine Antwort oder ergänzen Sie ein Detail.", "Antwort senden ↗"], "es": [["¿Qué te impide probar Flow?", "¿Qué buscabas y no has encontrado aquí?", "¿Qué deberíamos aclarar sobre Flow?"], "Basta con una opción. Puedes añadir un detalle.", ["No lo necesito", "No entiendo cómo funciona", "No quiero instalarlo", "Otro"], "Un detalle, si quieres · máximo 800 caracteres", "Elige una respuesta o escribe un detalle.", "Enviar respuesta ↗"], "pt": [["O que impede que experimente o Flow?", "O que procurava e não encontrou aqui?", "O que devemos esclarecer sobre o Flow?"], "Basta uma opção. Se quiser, acrescente um detalhe.", ["Não preciso", "Não percebo como funciona", "Não quero instalar", "Outro"], "Um detalhe, se quiser · máximo de 800 caracteres", "Escolha uma resposta ou escreva um detalhe.", "Enviar resposta ↗"], "ar": [["ما الذي يمنعك من تجربة Flow؟", "ما الذي كنت تبحث عنه ولم تجده هنا؟", "ما الذي ينبغي توضيحه عن Flow؟"], "يكفي اختيار إجابة، ويمكنك إضافة تفاصيل إن أردت.", ["لا أحتاجه", "لا أفهم كيف يعمل", "لا أريد تثبيته", "سبب آخر"], "تفاصيل اختيارية · بحد أقصى ٨٠٠ حرف", "اختر إجابة أو اكتب تفاصيل.", "إرسال الإجابة ↗"]};
  const dialog = document.getElementById('flowFeedback');
  if (!dialog) return;
  const lang = Object.hasOwn(translations, dialog.lang) ? dialog.lang : 'en';
  const [titles, intro, choices, label, required, send] = translations[lang];
  const variants = ['A', 'B', 'C'];
  let variant;
  try { variant = sessionStorage.getItem('flow.feedback.fb_barrier_v1'); } catch (_) {}
  if (!variants.includes(variant)) {
    // Rejection sampling avoids modulo bias across the three variants.
    const random = new Uint8Array(1);
    do { crypto.getRandomValues(random); } while (random[0] === 255);
    variant = variants[random[0] % 3];
    try { sessionStorage.setItem('flow.feedback.fb_barrier_v1', variant); } catch (_) {}
  }
  dialog.querySelector('#feedbackTitle').textContent = titles[variants.indexOf(variant)];
  dialog.querySelector('#feedbackIntro').textContent = intro;
  const copy = { ...window.FLOW_FEEDBACK_COPY, required, send };
  window.FLOW_FEEDBACK_COPY = Object.freeze(copy);
  dialog.querySelector('#feedbackSend').textContent = send;
  dialog.querySelector('label[for="feedbackMessage"]').textContent = label;
  const message = dialog.querySelector('#feedbackMessage');
  message.required = false; message.maxLength = 800; message.placeholder = '';
  const group = document.createElement('fieldset'); group.className = 'feedback-reasons';
  group.setAttribute('aria-labelledby', 'feedbackTitle');
  const reasons = ['not_needed', 'unclear', 'installation', 'other'];
  reasons.forEach((reason, i) => {
    const item = document.createElement('label');
    const radio = document.createElement('input'); radio.type = 'radio';
    radio.name = 'feedbackReason'; radio.value = reason;
    const text = document.createElement('span'); text.textContent = choices[i];
    item.append(radio, text); group.append(item);
  });
  dialog.querySelector('#feedbackForm').prepend(group);
  window.FLOW_FEEDBACK_EXPERIMENT = Object.freeze({
    id: 'fb_barrier_v1', variant, lang,
    reason: () => group.querySelector('input:checked')?.value || '',
    answer: () => {
      const selected = group.querySelector('input:checked');
      if (!selected) return '';
      return selected.value + ' — ' + choices[reasons.indexOf(selected.value)];
    }
  });
})();
