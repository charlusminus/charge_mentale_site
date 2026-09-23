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
    boite.innerHTML =
      '<div class="consent-boite">' +
      '<h2 id="consent-titre">Une mesure d\'audience, avec votre accord</h2>' +
      '<p>Ce site utilise Google Analytics pour compter les visites et comprendre ce qui est utile. Ça dépose un cookie et envoie des données de navigation à Google. Vos réponses au questionnaire ne sont jamais envoyées à Google, quel que soit votre choix.</p>' +
      '<div class="consent-actions">' +
      '<button class="btn secondary" type="button" data-choix="non">Refuser</button>' +
      '<button class="btn secondary" type="button" data-choix="oui">Accepter</button>' +
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
    var choix = lire();
    if (choix === true) charger(); else if (choix === null) ouvrir();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", demarrer); else demarrer();
})();
