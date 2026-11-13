/* Mesure d'audience des pages hors application : blog et presse.
   Même consentement que l'accueil (clé localStorage « consent-ga », six mois), même propriété GA4, même bandeau.
   Rien ne se charge chez Google sans un clic sur « Accepter ». L'accueil garde sa propre copie de cette logique,
   dans index.html : toute modification du texte ou de la clé se fait aux deux endroits. */
(function () {
  var ID = "G-NYTV9VXCBN", CLE = "consent-ga", SIX_MOIS = 1000 * 60 * 60 * 24 * 182;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  gtag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });

  function charger() {
    if (window.__ga) return; window.__ga = true;
    gtag("consent", "update", { analytics_storage: "granted" });
    var sc = document.createElement("script"); sc.async = true; sc.src = "https://www.googletagmanager.com/gtag/js?id=" + ID;
    document.head.appendChild(sc);
    gtag("js", new Date());
    gtag("config", ID);
  }
  function lire() { try { var v = JSON.parse(localStorage.getItem(CLE) || "null"); return v && Date.now() - v.t < SIX_MOIS ? v.ok : null; } catch (e) { return null; } }
  function ecrire(ok) { try { localStorage.setItem(CLE, JSON.stringify({ ok: ok, t: Date.now() })); } catch (e) {} }

  var boite = null;
  function construire() {
    boite = document.createElement("div");
    boite.className = "consent"; boite.hidden = true;
    boite.setAttribute("role", "dialog"); boite.setAttribute("aria-modal", "true"); boite.setAttribute("aria-labelledby", "consent-titre");
    // Version anglaise (10/11/2026) : mêmes textes en anglais sur les pages en <html lang="en-…">.
    var en = (document.documentElement.lang || "").indexOf("en") === 0;
    var t = en ? ["Audience measurement, with your consent",
        "This site uses Google Analytics to count visits and understand what is useful. It sets a cookie and sends browsing data to Google, which does not say who you are. Your answers to the questionnaire are never sent to Google, whatever you choose.",
        "Decline", "Accept"]
      : ["Une mesure d'audience, avec votre accord",
        "Ce site utilise Google Analytics pour compter les visites et comprendre ce qui est utile. Ça dépose un cookie et envoie à Google des données de navigation, qui ne disent pas qui vous êtes. Vos réponses au questionnaire ne sont jamais envoyées à Google, quel que soit votre choix.",
        "Refuser", "Accepter"];
    boite.innerHTML =
      '<div class="consent-boite">' +
      '<h2 id="consent-titre">' + t[0] + '</h2>' +
      '<p>' + t[1] + '</p>' +
      '<div class="consent-actions">' +
      '<button class="btn secondary" type="button" data-choix="non">' + t[2] + '</button>' +
      '<button class="btn secondary" type="button" data-choix="oui">' + t[3] + '</button>' +
      '</div></div>';
    document.body.appendChild(boite);
    boite.addEventListener("click", function (e) {
      var b = e.target.closest("[data-choix]"); if (!b) return;
      var ok = b.getAttribute("data-choix") === "oui";
      ecrire(ok); fermer(); if (ok) charger();
    });
  }
  function ouvrir() { if (!boite) construire(); boite.hidden = false; document.body.classList.add("consent-ouvert"); boite.querySelector("[data-choix='non']").focus(); }
  function fermer() { if (boite) boite.hidden = true; document.body.classList.remove("consent-ouvert"); }

  function demarrer() {
    // Le lien « Cookies » du pied de page rouvre le bandeau pour changer d'avis.
    document.addEventListener("click", function (e) { var a = e.target.closest("[data-cookies]"); if (a) { e.preventDefault(); ouvrir(); } });
    // Bouton « Soutenir » de l'en-tête, vers Ko-fi (09/11/2026) : un clic compté par page d'origine.
    document.addEventListener("click", function (e) { var a = e.target.closest("[data-soutenir]"); if (a && window.__ga) gtag("event", "soutenir_clic", { origine: a.getAttribute("data-soutenir") }); });
    var choix = lire();
    if (choix === true) charger(); else if (choix === null) ouvrir();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer); else demarrer();
})();

/* Menu du site : burger sur mobile, sous-menu « À propos » sur ordinateur. Même code dans index.html pour l'accueil. */
(function () {
  function init() {
    var h = document.querySelector(".haut"), b = h && h.querySelector(".burger"); if (!b) return;
    var s = h.querySelector(".sous"), sb = s && s.querySelector(".sous-btn");
    function menu(o) { h.classList.toggle("ouvert", o); b.setAttribute("aria-expanded", String(o)); document.documentElement.classList.toggle("menu-ouvert", o); }
    function sous(o) { if (s) { s.classList.toggle("ouvert", o); sb.setAttribute("aria-expanded", String(o)); } }
    b.addEventListener("click", function () { menu(!h.classList.contains("ouvert")); });
    if (sb) sb.addEventListener("click", function () { sous(!s.classList.contains("ouvert")); });
    document.addEventListener("click", function (e) { if (s && !s.contains(e.target)) sous(false); if (!h.contains(e.target)) menu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { if (h.classList.contains("ouvert")) b.focus(); menu(false); sous(false); } });
    h.querySelectorAll(".menu a").forEach(function (a) { a.addEventListener("click", function () { menu(false); }); });
    if (window.matchMedia) matchMedia("(min-width: 761px)").addEventListener("change", function () { menu(false); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
