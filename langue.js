// Langue du navigateur (11/11/2026, demande de Charles) : un navigateur qui n'est pas réglé en français arrive sur la
// version anglaise de la page, quand elle existe (lien hreflang « en » dans l'en-tête). Chargé tôt dans <head>, après
// les liens hreflang, sur les pages qui ont une traduction (et sur les pages anglaises, pour mémoriser le choix).
// Jamais pour un robot : Google indexe chaque langue par ses hreflang. Jamais quand la personne a choisi sa langue
// (lien « English » ou « Français » cliqué, mémorisé ; ou ?lang=fr dans l'adresse). Jamais pour un lien qui transporte
// des réponses (comparaison, résultat partagé) : seuls les paramètres de mesure (utm_…, fbclid, gclid) sont repris.
(function () {
  var CLE = 'qyp-langue';
  function lire() { try { return localStorage.getItem(CLE); } catch (e) { return null; } }
  function ecrire(v) { try { localStorage.setItem(CLE, v); } catch (e) {} }
  var q = new URLSearchParams(location.search);
  var force = q.get('lang');
  if (force === 'fr' || force === 'en') ecrire(force);
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[hreflang][lang]') : null;
    if (a) ecrire(a.getAttribute('hreflang').slice(0, 2).toLowerCase());
  }, true);
  if ((document.documentElement.lang || '').slice(0, 2) !== 'fr') return;
  var choix = force || lire();
  if (choix === 'fr') return;
  if (/bot|crawl|spider|slurp|preview|facebookexternalhit|lighthouse|headless/i.test(navigator.userAgent || '')) return;
  if (location.hash) return;
  var autres = false;
  q.forEach(function (v, k) { if (k !== 'lang' && !/^(utm_|fbclid$|gclid$)/.test(k)) autres = true; });
  if (autres) return;
  if (choix !== 'en') {
    var langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
    if (!langs[0]) return;
    for (var i = 0; i < langs.length; i++) if (/^fr/i.test(langs[i])) return;
  }
  var en = document.querySelector('link[rel="alternate"][hreflang^="en"]');
  if (!en) return;
  var u = new URL(en.href, location.href);
  if (u.pathname === location.pathname) return;
  q.delete('lang');
  var s = q.toString();
  location.replace(u.pathname + (s ? '?' + s : ''));
})();
