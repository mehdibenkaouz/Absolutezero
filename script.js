document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector("#menuToggle");
  const menuOverlay = document.querySelector("#menuOverlay");
  const menuPanel = document.querySelector("#siteMenu");
  const menuLinks = menuPanel.querySelectorAll("a");

  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Chiudi menu" : "Apri menu");
    menuPanel.setAttribute("aria-hidden", String(!open));
    menuOverlay.hidden = !open;
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

  const form = document.querySelector("#contactForm");
  const formStatus = document.querySelector("#formStatus");

  const CONTACT_EMAIL = "INSERISCI_LA_TUA_EMAIL";

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (CONTACT_EMAIL === "INSERISCI_LA_TUA_EMAIL") {
      formStatus.textContent =
        "Inserisci la tua email in script.js per attivare il modulo.";
      return;
    }

    const name = document.querySelector("#name").value.trim();
    const email = document.querySelector("#email").value.trim();
    const message = document.querySelector("#message").value.trim();

    const subject = encodeURIComponent("Richiesta da Absolute Zero");
    const body = encodeURIComponent(
      `Nome: ${name}\nEmail: ${email}\n\nProblema:\n${message}`
    );

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    formStatus.textContent = "Apro la tua applicazione email.";
  });
});
