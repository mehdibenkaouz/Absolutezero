/* Feedback language follows browser preferences; no location data is collected. */
(() => {
  'use strict';
  const messages = {
  "it": {
    "question": "Hai una domanda?",
    "invite": "Lasciami un parere o una domanda ↗",
    "leave": "Lascia un parere ↗",
    "kicker": "Un messaggio, direttamente a me",
    "title": "Ci aiuti a migliorare Flow?",
    "intro": "Cosa ti è stato utile in Flow e cosa potremmo migliorare? Va bene anche una frase.",
    "label": "Il tuo parere · massimo 1.000 caratteri",
    "placeholder": "Scrivi qui cosa ne pensi…",
    "note": "Non serve il tuo nome né la tua email. Il messaggio arriva nella mia bacheca privata e non viene pubblicato. Evita dati personali o dei dipendenti.",
    "send": "Invia il tuo parere ↗",
    "sending": "Invio in corso…",
    "thanks": "Grazie, il tuo parere è arrivato.",
    "thanksBody": "Lo leggerò nella mia bacheca privata.",
    "close": "Chiudi",
    "closeAria": "Chiudi il feedback",
    "required": "Scrivi il tuo parere, basta anche una frase.",
    "unavailable": "Il servizio non è disponibile. Il testo è ancora qui: riprova tra poco.",
    "error": "Non ho potuto confermare l’invio. Il testo è ancora qui: riprova.",
    "timeout": "La connessione è lenta e non ho potuto confermare l’invio. Il testo è ancora qui: riprova.",
    "rateLimit": "Hai già inviato alcuni pareri. Riprova tra 15 minuti."
  },
  "en": {
    "question": "Have a question?",
    "invite": "Leave me feedback or a question ↗",
    "leave": "Leave feedback ↗",
    "kicker": "A message, directly to me",
    "title": "Help us improve Flow?",
    "intro": "What was useful in Flow, and what could we improve? Even one sentence is enough.",
    "label": "Your feedback · maximum 1,000 characters",
    "placeholder": "Tell me what you think…",
    "note": "No name or email needed. Your message goes to my private board and is not published. Please avoid personal or employee data.",
    "send": "Send your feedback ↗",
    "sending": "Sending…",
    "thanks": "Thank you, your feedback has arrived.",
    "thanksBody": "I’ll read it on my private board.",
    "close": "Close",
    "closeAria": "Close feedback",
    "required": "Please write your feedback. One sentence is enough.",
    "unavailable": "The service is unavailable. Your text is still here: please try again shortly.",
    "error": "I couldn’t confirm delivery. Your text is still here: please try again.",
    "timeout": "The connection is slow and I couldn’t confirm delivery. Your text is still here: please try again.",
    "rateLimit": "You’ve already sent a few messages. Please try again in 15 minutes."
  },
  "fr": {
    "question": "Une question ?",
    "invite": "Laissez-moi un avis ou une question ↗",
    "leave": "Donner un avis ↗",
    "kicker": "Un message, directement pour moi",
    "title": "Vous nous aidez à améliorer Flow ?",
    "intro": "Qu’est-ce qui vous a été utile dans Flow et que pourrions-nous améliorer ? Une phrase suffit.",
    "label": "Votre avis · 1 000 caractères maximum",
    "placeholder": "Dites-moi ce que vous en pensez…",
    "note": "Ni nom ni adresse e-mail nécessaires. Votre message arrive dans mon tableau privé et n’est pas publié. Évitez les données personnelles ou celles des salariés.",
    "send": "Envoyer votre avis ↗",
    "sending": "Envoi en cours…",
    "thanks": "Merci, votre avis est bien arrivé.",
    "thanksBody": "Je le lirai dans mon tableau privé.",
    "close": "Fermer",
    "closeAria": "Fermer le formulaire",
    "required": "Écrivez votre avis, une phrase suffit.",
    "unavailable": "Le service est indisponible. Votre texte est conservé : réessayez dans un instant.",
    "error": "L’envoi n’a pas pu être confirmé. Votre texte est conservé : réessayez.",
    "timeout": "La connexion est lente et l’envoi n’a pas pu être confirmé. Votre texte est conservé : réessayez.",
    "rateLimit": "Vous avez déjà envoyé plusieurs messages. Réessayez dans 15 minutes."
  },
  "de": {
    "question": "Haben Sie eine Frage?",
    "invite": "Feedback oder eine Frage senden ↗",
    "leave": "Feedback geben ↗",
    "kicker": "Eine Nachricht direkt an mich",
    "title": "Helfen Sie uns, Flow zu verbessern?",
    "intro": "Was war an Flow hilfreich und was könnten wir verbessern? Ein Satz genügt.",
    "label": "Ihr Feedback · maximal 1.000 Zeichen",
    "placeholder": "Schreiben Sie mir Ihre Meinung…",
    "note": "Name und E-Mail sind nicht erforderlich. Ihre Nachricht erscheint in meiner privaten Übersicht und wird nicht veröffentlicht. Bitte keine personenbezogenen Daten oder Mitarbeiterdaten angeben.",
    "send": "Feedback senden ↗",
    "sending": "Wird gesendet…",
    "thanks": "Vielen Dank, Ihr Feedback ist angekommen.",
    "thanksBody": "Ich lese es in meiner privaten Übersicht.",
    "close": "Schließen",
    "closeAria": "Feedback schließen",
    "required": "Bitte schreiben Sie Ihr Feedback. Ein Satz genügt.",
    "unavailable": "Der Dienst ist nicht verfügbar. Ihr Text bleibt erhalten. Versuchen Sie es gleich noch einmal.",
    "error": "Der Versand konnte nicht bestätigt werden. Ihr Text bleibt erhalten. Bitte erneut versuchen.",
    "timeout": "Die Verbindung ist langsam. Der Versand konnte nicht bestätigt werden. Ihr Text bleibt erhalten. Bitte erneut versuchen.",
    "rateLimit": "Sie haben bereits mehrere Nachrichten gesendet. Bitte in 15 Minuten erneut versuchen."
  },
  "es": {
    "question": "¿Tienes alguna pregunta?",
    "invite": "Déjame tu opinión o una pregunta ↗",
    "leave": "Dejar una opinión ↗",
    "kicker": "Un mensaje, directamente para mí",
    "title": "¿Nos ayudas a mejorar Flow?",
    "intro": "¿Qué te ha resultado útil en Flow y qué podríamos mejorar? Basta con una frase.",
    "label": "Tu opinión · máximo 1.000 caracteres",
    "placeholder": "Escribe aquí lo que piensas…",
    "note": "No necesitas dar tu nombre ni tu correo. El mensaje llega a mi panel privado y no se publica. Evita datos personales o de empleados.",
    "send": "Enviar tu opinión ↗",
    "sending": "Enviando…",
    "thanks": "Gracias, tu opinión ha llegado.",
    "thanksBody": "La leeré en mi panel privado.",
    "close": "Cerrar",
    "closeAria": "Cerrar el formulario",
    "required": "Escribe tu opinión, basta con una frase.",
    "unavailable": "El servicio no está disponible. Tu texto sigue aquí: inténtalo de nuevo en un momento.",
    "error": "No se ha podido confirmar el envío. Tu texto sigue aquí: inténtalo de nuevo.",
    "timeout": "La conexión es lenta y no se ha podido confirmar el envío. Tu texto sigue aquí: inténtalo de nuevo.",
    "rateLimit": "Ya has enviado varios mensajes. Inténtalo de nuevo dentro de 15 minutos."
  },
  "pt": {
    "question": "Tem alguma pergunta?",
    "invite": "Deixe uma opinião ou uma pergunta ↗",
    "leave": "Deixar uma opinião ↗",
    "kicker": "Uma mensagem, diretamente para mim",
    "title": "Ajuda-nos a melhorar o Flow?",
    "intro": "O que foi útil no Flow e o que podemos melhorar? Uma frase já ajuda.",
    "label": "A sua opinião · máximo de 1.000 caracteres",
    "placeholder": "Escreva aqui o que pensa…",
    "note": "Não precisa de indicar nome nem e-mail. A mensagem chega ao meu painel privado e não é publicada. Evite dados pessoais ou de funcionários.",
    "send": "Enviar opinião ↗",
    "sending": "A enviar…",
    "thanks": "Obrigado, a sua opinião chegou.",
    "thanksBody": "Vou lê-la no meu painel privado.",
    "close": "Fechar",
    "closeAria": "Fechar formulário",
    "required": "Escreva a sua opinião. Uma frase já ajuda.",
    "unavailable": "O serviço está indisponível. O seu texto continua aqui: tente novamente dentro de instantes.",
    "error": "Não foi possível confirmar o envio. O seu texto continua aqui: tente novamente.",
    "timeout": "A ligação está lenta e não foi possível confirmar o envio. O seu texto continua aqui: tente novamente.",
    "rateLimit": "Já enviou várias mensagens. Tente novamente dentro de 15 minutos."
  },
  "ar": {
    "question": "هل لديك سؤال؟",
    "invite": "اترك لي رأيك أو سؤالك ↗",
    "leave": "اترك رأيك ↗",
    "kicker": "رسالة تصل إليّ مباشرة",
    "title": "هل تساعدنا في تحسين Flow؟",
    "intro": "ما الذي أفادك في Flow وما الذي يمكننا تحسينه؟ تكفي جملة واحدة.",
    "label": "رأيك · بحد أقصى ١٠٠٠ حرف",
    "placeholder": "اكتب رأيك هنا…",
    "note": "لا حاجة إلى اسمك أو بريدك الإلكتروني. تصل الرسالة إلى لوحتي الخاصة ولا تُنشر. تجنّب البيانات الشخصية أو بيانات الموظفين.",
    "send": "أرسل رأيك ↗",
    "sending": "جارٍ الإرسال…",
    "thanks": "شكراً، وصل رأيك.",
    "thanksBody": "سأقرؤه في لوحتي الخاصة.",
    "close": "إغلاق",
    "closeAria": "إغلاق نموذج الملاحظات",
    "required": "اكتب رأيك، تكفي جملة واحدة.",
    "unavailable": "الخدمة غير متاحة. النص محفوظ هنا، حاول مجدداً بعد قليل.",
    "error": "تعذّر تأكيد الإرسال. النص محفوظ هنا، حاول مجدداً.",
    "timeout": "الاتصال بطيء وتعذّر تأكيد الإرسال. النص محفوظ هنا، حاول مجدداً.",
    "rateLimit": "لقد أرسلت عدة رسائل. حاول مجدداً بعد ١٥ دقيقة."
  }
};
  const preferences = navigator.languages?.length ? navigator.languages : [navigator.language || 'en'];
  const lang = preferences.map(value => value.toLowerCase().split(/[-_]/)[0]).find(value => Object.hasOwn(messages, value)) || 'en';
  const copy = messages[lang];
  window.FLOW_FEEDBACK_COPY = Object.freeze(copy);
  const dialog = document.getElementById('flowFeedback');
  if (!dialog) return;
  dialog.lang = lang;
  dialog.dir = lang === 'ar' ? 'rtl' : 'ltr';
  const text = (selector, key) => { const element = dialog.querySelector(selector); if (element) element.textContent = copy[key]; };
  text('.feedback-kicker', 'kicker'); text('#feedbackTitle', 'title'); text('#feedbackIntro', 'intro');
  text('label[for="feedbackMessage"]', 'label'); text('#feedbackNote', 'note');
  text('#feedbackSend', 'send'); text('#feedbackSuccess h3', 'thanks');
  text('#feedbackSuccess p', 'thanksBody'); text('#feedbackDone', 'close');
  dialog.querySelector('#feedbackClose')?.setAttribute('aria-label', copy.closeAria);
  dialog.querySelector('#feedbackMessage')?.setAttribute('placeholder', copy.placeholder);
  document.querySelectorAll('[data-flow-feedback]').forEach(link => {
    const key = link.closest('.site-header') ? 'question' : link.classList.contains('human-secondary') ? 'invite' : 'leave';
    link.textContent = copy[key]; link.lang = lang; link.dir = dialog.dir;
  });
})();
