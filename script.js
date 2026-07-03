document.addEventListener("DOMContentLoaded", () => {
  const translations = {
  "it": {
    "meta": {
      "description": "Absolute Zero — software da provare e scaricare."
    },
    "language": {
      "label": "Seleziona lingua"
    },
    "header": {
      "contact": "Contattaci"
    },
    "menu": {
      "label": "Menu",
      "open": "Apri menu",
      "close": "Chiudi menu"
    },
    "nav": {
      "home": "Home",
      "software": "Software",
      "contact": "Contatti"
    },
    "hero": {
      "title": "Software che risolve problemi reali.",
      "subtitle": "Strumenti indipendenti per organizzare il lavoro, controllare l’audio e rendere più semplici i flussi quotidiani.",
      "explore": "Esplora i software",
      "contact": "Parlaci del tuo problema",
      "softwareListLabel": "Software disponibili"
    },
    "products": {
      "avelis": "CRM e workspace per attività, prospect e processi.",
      "piperoute": "Routing audio visivo per flussi, dispositivi e connessioni.",
      "flow": "Richieste, lavori e approvazioni. In un unico luogo."
    },
    "section": {
      "software": "Software"
    },
    "media": {
      "avelis": "Anteprima Avelis",
      "piperoute": "Anteprima PipeRoute",
      "flow": "Anteprima di Flow"
    },
    "cards": {
      "avelis": "CRM e workspace per prospect, clienti, trattative e processi.",
      "piperoute": "Routing audio visivo per controllare flussi, dispositivi e connessioni.",
      "flow": "Ogni richiesta, lavoro e approvazione nel posto giusto."
    },
    "actions": {
      "download": "Scarica gratuitamente",
      "inDevelopment": "In sviluppo"
    },
    "contact": {
      "title": "Parlaci dei problemi della tua attività.",
      "copy": "Se non trovi ancora il software giusto, scrivici cosa ti serve.",
      "name": "Nome",
      "email": "Email",
      "message": "Raccontaci il problema",
      "submit": "Invia richiesta"
    },
    "form": {
      "configure": "Inserisci la tua email in script.js per attivare il modulo.",
      "opening": "Apro la tua applicazione email.",
      "subject": "Richiesta da Absolute Zero",
      "nameLabel": "Nome",
      "emailLabel": "Email",
      "messageLabel": "Problema"
    }
  },
  "en": {
    "meta": {
      "description": "Absolute Zero — software to try and download."
    },
    "language": {
      "label": "Select language"
    },
    "header": {
      "contact": "Contact us"
    },
    "menu": {
      "label": "Menu",
      "open": "Open menu",
      "close": "Close menu"
    },
    "nav": {
      "home": "Home",
      "software": "Software",
      "contact": "Contact"
    },
    "hero": {
      "title": "Software that solves real problems.",
      "subtitle": "Independent tools to organise work, control audio and simplify everyday workflows.",
      "explore": "Explore software",
      "contact": "Tell us about your challenge",
      "softwareListLabel": "Available software"
    },
    "products": {
      "avelis": "CRM and workspace for operations, prospects and processes.",
      "piperoute": "Visual audio routing for flows, devices and connections.",
      "flow": "Requests, work and approvals. In one place."
    },
    "section": {
      "software": "Software"
    },
    "media": {
      "avelis": "Avelis preview",
      "piperoute": "PipeRoute preview",
      "flow": "Flow preview"
    },
    "cards": {
      "avelis": "CRM and workspace for prospects, clients, deals and processes.",
      "piperoute": "Visual audio routing to control flows, devices and connections.",
      "flow": "Every request, task and approval in the right place."
    },
    "actions": {
      "download": "Download for free",
      "inDevelopment": "In development"
    },
    "contact": {
      "title": "Tell us about your business challenges.",
      "copy": "If you have not found the right software yet, tell us what you need.",
      "name": "Name",
      "email": "Email",
      "message": "Describe the challenge",
      "submit": "Send request"
    },
    "form": {
      "configure": "Add your email address in script.js to activate the form.",
      "opening": "Opening your email application.",
      "subject": "Request from Absolute Zero",
      "nameLabel": "Name",
      "emailLabel": "Email",
      "messageLabel": "Challenge"
    }
  },
  "ar": {
    "meta": {
      "description": "Absolute Zero — برمجيات للتجربة والتنزيل."
    },
    "language": {
      "label": "اختر اللغة"
    },
    "header": {
      "contact": "تواصل معنا"
    },
    "menu": {
      "label": "القائمة",
      "open": "فتح القائمة",
      "close": "إغلاق القائمة"
    },
    "nav": {
      "home": "الرئيسية",
      "software": "البرامج",
      "contact": "اتصل بنا"
    },
    "hero": {
      "title": "برامج تحل مشكلات حقيقية.",
      "subtitle": "أدوات مستقلة لتنظيم العمل والتحكم بالصوت وتبسيط سير العمل اليومي.",
      "explore": "استكشف البرامج",
      "contact": "أخبرنا عن مشكلتك",
      "softwareListLabel": "البرامج المتاحة"
    },
    "products": {
      "avelis": "نظام CRM ومساحة عمل للأنشطة والعملاء المحتملين والعمليات.",
      "piperoute": "توجيه صوتي مرئي للتدفقات والأجهزة والاتصالات.",
      "flow": "الطلبات والعمل والموافقات. في مكان واحد."
    },
    "section": {
      "software": "البرامج"
    },
    "media": {
      "avelis": "معاينة Avelis",
      "piperoute": "معاينة PipeRoute",
      "flow": "معاينة Flow"
    },
    "cards": {
      "avelis": "نظام CRM ومساحة عمل للعملاء المحتملين والعملاء والصفقات والعمليات.",
      "piperoute": "توجيه صوتي مرئي للتحكم في التدفقات والأجهزة والاتصالات.",
      "flow": "كل طلب ومهمة وموافقة في المكان الصحيح."
    },
    "actions": {
      "download": "تنزيل مجانًا",
      "inDevelopment": "قيد التطوير"
    },
    "contact": {
      "title": "تحدث معنا عن مشكلات نشاطك.",
      "copy": "إن لم تجد البرنامج المناسب بعد، اكتب لنا ما تحتاج إليه.",
      "name": "الاسم",
      "email": "البريد الإلكتروني",
      "message": "أخبرنا بالمشكلة",
      "submit": "إرسال الطلب"
    },
    "form": {
      "configure": "أدخل بريدك الإلكتروني في script.js لتفعيل النموذج.",
      "opening": "جارٍ فتح تطبيق البريد الإلكتروني.",
      "subject": "طلب من Absolute Zero",
      "nameLabel": "الاسم",
      "emailLabel": "البريد الإلكتروني",
      "messageLabel": "المشكلة"
    }
  },
  "zh": {
    "meta": {
      "description": "Absolute Zero — 可试用和下载的软件。"
    },
    "language": {
      "label": "选择语言"
    },
    "header": {
      "contact": "联系我们"
    },
    "menu": {
      "label": "菜单",
      "open": "打开菜单",
      "close": "关闭菜单"
    },
    "nav": {
      "home": "首页",
      "software": "软件",
      "contact": "联系"
    },
    "hero": {
      "title": "解决实际问题的软件。",
      "subtitle": "用于组织工作、管理音频并简化日常流程的独立工具。",
      "explore": "探索软件",
      "contact": "告诉我们你的需求",
      "softwareListLabel": "可用软件"
    },
    "products": {
      "avelis": "用于业务、潜在客户和流程的 CRM 与工作空间。",
      "piperoute": "用于音频流、设备和连接的可视化路由。",
      "flow": "请求、工作与审批，集中在一个地方。"
    },
    "section": {
      "software": "软件"
    },
    "media": {
      "avelis": "Avelis 预览",
      "piperoute": "PipeRoute 预览",
      "flow": "Flow 预览"
    },
    "cards": {
      "avelis": "用于潜在客户、客户、交易和流程的 CRM 与工作空间。",
      "piperoute": "用于控制音频流、设备和连接的可视化音频路由。",
      "flow": "让每个请求、任务和审批都在正确的位置。"
    },
    "actions": {
      "download": "免费下载",
      "inDevelopment": "开发中"
    },
    "contact": {
      "title": "告诉我们你业务中遇到的问题。",
      "copy": "如果你还没有找到合适的软件，请告诉我们你的需求。",
      "name": "姓名",
      "email": "电子邮件",
      "message": "描述你的需求",
      "submit": "发送请求"
    },
    "form": {
      "configure": "请在 script.js 中填写你的电子邮件地址以启用表单。",
      "opening": "正在打开你的电子邮件应用。",
      "subject": "来自 Absolute Zero 的请求",
      "nameLabel": "姓名",
      "emailLabel": "电子邮件",
      "messageLabel": "需求"
    }
  },
  "fr": {
    "meta": {
      "description": "Absolute Zero — des logiciels à essayer et à télécharger."
    },
    "language": {
      "label": "Choisir la langue"
    },
    "header": {
      "contact": "Nous contacter"
    },
    "menu": {
      "label": "Menu",
      "open": "Ouvrir le menu",
      "close": "Fermer le menu"
    },
    "nav": {
      "home": "Accueil",
      "software": "Logiciels",
      "contact": "Contact"
    },
    "hero": {
      "title": "Des logiciels qui résolvent des problèmes réels.",
      "subtitle": "Des outils indépendants pour organiser le travail, gérer l’audio et simplifier les flux quotidiens.",
      "explore": "Découvrir les logiciels",
      "contact": "Parlez-nous de votre besoin",
      "softwareListLabel": "Logiciels disponibles"
    },
    "products": {
      "avelis": "CRM et espace de travail pour les activités, prospects et processus.",
      "piperoute": "Routage audio visuel pour les flux, appareils et connexions.",
      "flow": "Demandes, travail et validations. Au même endroit."
    },
    "section": {
      "software": "Logiciels"
    },
    "media": {
      "avelis": "Aperçu d’Avelis",
      "piperoute": "Aperçu de PipeRoute",
      "flow": "Aperçu de Flow"
    },
    "cards": {
      "avelis": "CRM et espace de travail pour les prospects, clients, négociations et processus.",
      "piperoute": "Routage audio visuel pour contrôler les flux, appareils et connexions.",
      "flow": "Chaque demande, tâche et validation au bon endroit."
    },
    "actions": {
      "download": "Télécharger gratuitement",
      "inDevelopment": "En développement"
    },
    "contact": {
      "title": "Parlez-nous des difficultés de votre activité.",
      "copy": "Si vous n’avez pas encore trouvé le bon logiciel, dites-nous ce dont vous avez besoin.",
      "name": "Nom",
      "email": "E-mail",
      "message": "Décrivez le besoin",
      "submit": "Envoyer la demande"
    },
    "form": {
      "configure": "Ajoutez votre adresse e-mail dans script.js pour activer le formulaire.",
      "opening": "Ouverture de votre application e-mail.",
      "subject": "Demande depuis Absolute Zero",
      "nameLabel": "Nom",
      "emailLabel": "E-mail",
      "messageLabel": "Besoin"
    }
  },
  "es": {
    "meta": {
      "description": "Absolute Zero — software para probar y descargar."
    },
    "language": {
      "label": "Seleccionar idioma"
    },
    "header": {
      "contact": "Contáctanos"
    },
    "menu": {
      "label": "Menú",
      "open": "Abrir menú",
      "close": "Cerrar menú"
    },
    "nav": {
      "home": "Inicio",
      "software": "Software",
      "contact": "Contacto"
    },
    "hero": {
      "title": "Software que resuelve problemas reales.",
      "subtitle": "Herramientas independientes para organizar el trabajo, controlar el audio y simplificar los flujos diarios.",
      "explore": "Explorar software",
      "contact": "Cuéntanos tu necesidad",
      "softwareListLabel": "Software disponible"
    },
    "products": {
      "avelis": "CRM y espacio de trabajo para actividad, prospectos y procesos.",
      "piperoute": "Enrutamiento visual de audio para flujos, dispositivos y conexiones.",
      "flow": "Solicitudes, trabajo y aprobaciones. En un solo lugar."
    },
    "section": {
      "software": "Software"
    },
    "media": {
      "avelis": "Vista previa de Avelis",
      "piperoute": "Vista previa de PipeRoute",
      "flow": "Vista previa de Flow"
    },
    "cards": {
      "avelis": "CRM y espacio de trabajo para prospectos, clientes, negociaciones y procesos.",
      "piperoute": "Enrutamiento visual de audio para controlar flujos, dispositivos y conexiones.",
      "flow": "Cada solicitud, tarea y aprobación en el lugar correcto."
    },
    "actions": {
      "download": "Descargar gratis",
      "inDevelopment": "En desarrollo"
    },
    "contact": {
      "title": "Cuéntanos los problemas de tu actividad.",
      "copy": "Si todavía no encuentras el software adecuado, dinos qué necesitas.",
      "name": "Nombre",
      "email": "Correo electrónico",
      "message": "Describe el problema",
      "submit": "Enviar solicitud"
    },
    "form": {
      "configure": "Añade tu correo electrónico en script.js para activar el formulario.",
      "opening": "Abriendo tu aplicación de correo electrónico.",
      "subject": "Solicitud desde Absolute Zero",
      "nameLabel": "Nombre",
      "emailLabel": "Correo electrónico",
      "messageLabel": "Problema"
    }
  },
  "ja": {
    "meta": {
      "description": "Absolute Zero — 試してダウンロードできるソフトウェア。"
    },
    "language": {
      "label": "言語を選択"
    },
    "header": {
      "contact": "お問い合わせ"
    },
    "menu": {
      "label": "メニュー",
      "open": "メニューを開く",
      "close": "メニューを閉じる"
    },
    "nav": {
      "home": "ホーム",
      "software": "ソフトウェア",
      "contact": "お問い合わせ"
    },
    "hero": {
      "title": "現実の課題を解決するソフトウェア。",
      "subtitle": "仕事を整理し、音声を管理し、日々の業務フローをよりシンプルにする独立したツール。",
      "explore": "ソフトウェアを見る",
      "contact": "課題をお聞かせください",
      "softwareListLabel": "利用可能なソフトウェア"
    },
    "products": {
      "avelis": "業務、見込み顧客、プロセスのための CRM とワークスペース。",
      "piperoute": "音声フロー、デバイス、接続のための視覚的ルーティング。",
      "flow": "依頼、作業、承認を一つの場所で。"
    },
    "section": {
      "software": "ソフトウェア"
    },
    "media": {
      "avelis": "Avelis のプレビュー",
      "piperoute": "PipeRoute のプレビュー",
      "flow": "Flow のプレビュー"
    },
    "cards": {
      "avelis": "見込み顧客、顧客、商談、プロセスのための CRM とワークスペース。",
      "piperoute": "音声フロー、デバイス、接続を管理する視覚的な音声ルーティング。",
      "flow": "すべての依頼、タスク、承認を適切な場所に。"
    },
    "actions": {
      "download": "無料でダウンロード",
      "inDevelopment": "開発中"
    },
    "contact": {
      "title": "あなたの事業の課題をお聞かせください。",
      "copy": "まだ適切なソフトウェアが見つからない場合は、必要なものをお聞かせください。",
      "name": "名前",
      "email": "メールアドレス",
      "message": "課題を説明してください",
      "submit": "リクエストを送信"
    },
    "form": {
      "configure": "フォームを有効にするには、script.js にメールアドレスを入力してください。",
      "opening": "メールアプリを開いています。",
      "subject": "Absolute Zero からのリクエスト",
      "nameLabel": "名前",
      "emailLabel": "メールアドレス",
      "messageLabel": "課題"
    }
  }
};

  const menuToggle = document.querySelector("#menuToggle");
  const menuOverlay = document.querySelector("#menuOverlay");
  const menuPanel = document.querySelector("#siteMenu");
  const menuLinks = menuPanel.querySelectorAll("a");
  const languageSelect = document.querySelector("#languageSelect");
  const form = document.querySelector("#contactForm");
  const formStatus = document.querySelector("#formStatus");

  const CONTACT_EMAIL = "INSERISCI_LA_TUA_EMAIL";
  let currentLanguage = "it";

  function getValue(source, path) {
    return path.split(".").reduce((value, part) => value && value[part], source);
  }

  function t(path) {
    return (
      getValue(translations[currentLanguage], path) ||
      getValue(translations.it, path) ||
      path
    );
  }

  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", t(open ? "menu.close" : "menu.open"));
    menuPanel.setAttribute("aria-hidden", String(!open));
    menuOverlay.hidden = !open;
  }

  function applyLanguage(language) {
    currentLanguage = translations[language] ? language : "it";

    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === "ar" ? "rtl" : "ltr";
    document.body.classList.toggle("rtl", currentLanguage === "ar");

    document.title = "Absolute Zero";

    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute("content", t("meta.description"));
    }

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = t(element.dataset.i18n);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
      element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
    });

    document.querySelectorAll("[data-i18n-content]").forEach((element) => {
      element.setAttribute("content", t(element.dataset.i18nContent));
    });

    if (languageSelect) {
      languageSelect.value = currentLanguage;
    }

    try {
      localStorage.setItem("absolute-zero-language", currentLanguage);
    } catch (error) {
      // Il sito continua a funzionare anche se il browser blocca localStorage.
    }

    setMenu(menuToggle.getAttribute("aria-expanded") === "true");
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setMenu(!isOpen);
  });

  menuOverlay.addEventListener("click", () => setMenu(false));

  menuLinks.forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenu(false);
    }
  });

  if (languageSelect) {
    languageSelect.addEventListener("change", (event) => {
      applyLanguage(event.target.value);
    });
  }

  let storedLanguage = "";
  try {
    storedLanguage = localStorage.getItem("absolute-zero-language") || "";
  } catch (error) {
    storedLanguage = "";
  }

  const browserLanguage = (navigator.language || "").slice(0, 2).toLowerCase();
  const initialLanguage =
    translations[storedLanguage]
      ? storedLanguage
      : translations[browserLanguage]
        ? browserLanguage
        : "it";

  applyLanguage(initialLanguage);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (CONTACT_EMAIL === "INSERISCI_LA_TUA_EMAIL") {
      formStatus.textContent = t("form.configure");
      return;
    }

    const name = document.querySelector("#name").value.trim();
    const email = document.querySelector("#email").value.trim();
    const message = document.querySelector("#message").value.trim();

    const subject = encodeURIComponent(t("form.subject"));
    const body = encodeURIComponent(
      `${t("form.nameLabel")}: ${name}\n${t("form.emailLabel")}: ${email}\n\n${t("form.messageLabel")}:\n${message}`
    );

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    formStatus.textContent = t("form.opening");
  });
});
