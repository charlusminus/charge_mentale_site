#!/usr/bin/env node
// Version anglaise (Who thinks of it?, quiypense.org/en/, 10/11/2026).
// Le français reste la source unique : ce script génère en/index.html et catalogue-en.js à partir de index.html,
// catalogue.js et des traductions de i18n/. À relancer après chaque changement du site français.
//
//   node tools/traduire.mjs          génère, puis signale les traductions introuvables et le français restant
//   node tools/traduire.mjs --strict sort en erreur s'il reste quelque chose à signaler (recette)
//
// i18n/en.json : { "remplacements": [["texte français exact", "English text"], ...] }, appliqués du plus long au plus
// court, sur le HTML comme sur le JavaScript. Une entrée introuvable est signalée (le français a changé : à reprendre).
// i18n/catalogue-en.json : { "familles": { id: nom }, "taches": { id: { "nom": ..., "aide": ... } } }.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lire = f => fs.readFileSync(path.join(RACINE, f), "utf8");
const strict = process.argv.includes("--strict");
const alertes = [];

// ---------- catalogue ----------
const catFr = lire("catalogue.js");
const C = JSON.parse(catFr.slice(catFr.indexOf("{"), catFr.lastIndexOf("}") + 1));
const T = JSON.parse(lire("i18n/catalogue-en.json"));
for (const c of C.categories) {
  if (T.familles[c.id]) c.nom = T.familles[c.id]; else alertes.push(`catalogue : famille sans traduction ${c.id}`);
  for (const t of c.taches) {
    const e = T.taches[t.id];
    if (!e) { alertes.push(`catalogue : tâche sans traduction ${t.id}`); continue; }
    t.nom = e.nom; t.aide = e.aide ?? t.aide;
  }
}
if (T.source) C.source = T.source;
if (T.periodes) C.periodesLibelles = T.periodes;
fs.writeFileSync(path.join(RACINE, "catalogue-en.js"), "window.CATALOGUE = " + JSON.stringify(C) + ";\n");

// ---------- page ----------
let s = lire("index.html");
// Blocs propres au site français (blog, articles) : retirés de la version anglaise.
s = s.replace(/<!-- en:retirer -->[\s\S]*?<!-- \/en:retirer -->/g, "");
const I18N = JSON.parse(lire("i18n/en.json")), R = I18N.remplacements, IGNORER = I18N.ignorer || [];
for (const [fr, en] of [...R].sort((a, b) => b[0].length - a[0].length)) {
  if (!s.includes(fr)) { alertes.push(`introuvable : ${fr.slice(0, 90)}`); continue; }
  s = s.split(fr).join(en);
}
// Chemins : la page vit dans en/ ; les ressources communes restent à la racine.
s = s.replace(/(["'(])(fonts\/|img\/|manifest\.webmanifest|favicon\.ico|mesure\.js|reperes\.js)/g, "$1../$2");
s = s.replace(/(["'])catalogue\.js/g, "$1../catalogue-en.js");
// Blog anglais (10/11/2026) : les cartes des derniers articles anglais (générées par blog/build.py du dépôt privé dans
// i18n/blog-cartes-en.html) remplacent le bloc du blog français ; le renvoi « Avant d'en parler » pointe vers l'article anglais.
const fCartes = path.join(RACINE, "i18n", "blog-cartes-en.html");
const cartes = fs.existsSync(fCartes) ? fs.readFileSync(fCartes, "utf8").trim() : "";
s = s.replace("<!-- en:blog -->", cartes ? `<section class="blog-accueil" id="blog-accueil" aria-labelledby="blog-titre">
      <h2 id="blog-titre">Further reading</h2>
      <p class="muted">What the surveys say, and how to talk about it together without it turning into a trial.</p>
      <ul class="blog-cartes">
${cartes}
      </ul>
      <p><a class="btn secondary" href="blog/">All resources</a></p>
    </section>` : "");
s = s.replace("<!-- en:parler -->", cartes ? `<p class="parler"><strong>Before you talk it over.</strong> A method for one evening, tried at home and with friends: <a href="blog/talking-about-chores-without-a-row.html?utm_source=quiypense&amp;utm_medium=resultat&amp;utm_campaign=parler">how to talk about sharing chores without a row</a>.</p>` : "");
fs.mkdirSync(path.join(RACINE, "en"), { recursive: true });
fs.writeFileSync(path.join(RACINE, "en", "index.html"), s);

// ---------- français restant ----------
// On retire commentaires HTML et JS, balises <style>, puis on cherche des mots français courants dans ce qui reste.
let vu = s.replace(/<!--[\s\S]*?-->/g, "").replace(/<style>[\s\S]*?<\/style>/g, "")
  .replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[\s;{}(),])\/\/[^\n]*/g, "$1");
const MOTS = /[éèêàùâîôûçœ]|\b(le|la|les|des|une|pour|avec|vous|votre|est|sont|qui|dans|chaque|tâche|jour|semaine|deux|enfants|maison|résultat)\b/i;
const lignes = vu.split("\n");
lignes.forEach((l, i) => {
  // texte entre balises, ou chaîne JS / attribut visible
  const morceaux = [...l.matchAll(/>([^<>]{3,})</g)].map(m => m[1])
    .concat([...l.matchAll(/(?:"|`)([^"`]{6,})(?:"|`)/g)].map(m => m[1]))
    .concat([...l.matchAll(/(?:aria-label|title|alt|placeholder|content)="([^"]+)"/g)].map(m => m[1]));
  for (const m of morceaux) {
    if (/^[a-z0-9_-]+$/.test(m.trim())) continue;   // identifiant seul (id de tâche, classe CSS), jamais visible tel quel
    if (IGNORER.some(x => m.trim() === x || m.trim().split(/\s+/).every(w => IGNORER.includes(w)) || (x.length > 8 && m.includes(x)))) continue;   // identifiants de code
    if (/^[\w\s.:#%-]*$/.test(m) && !MOTS.test(m)) continue;
    if (MOTS.test(m.replace(/https?:\/\/\S+/g, "").replace(/[\w-]+\.(js|html|css|png|svg)/g, ""))) { alertes.push(`français ? l.${i + 1} : ${m.trim().slice(0, 90)}`); break; }
  }
});

const nIntrouvables = alertes.filter(a => a.startsWith("introuvable")).length, nFr = alertes.filter(a => a.startsWith("français")).length;
for (const a of alertes) console.log(a);
console.log(`en/index.html et catalogue-en.js générés ; ${R.length} remplacements, ${nIntrouvables} introuvables, ${nFr} lignes avec du français possible`);
if (strict && alertes.length) process.exit(1);
