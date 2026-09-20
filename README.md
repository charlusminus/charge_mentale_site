# Qui fait quoi à la maison ?

Faites le compte de la répartition des tâches et de la charge mentale du foyer, à deux, en dix minutes.
Gratuit, sans compte : tout se calcule dans le navigateur, rien n'est envoyé.

Ce dépôt est le **site public**, déployé par GitHub Pages depuis `main` : **tout push sur `main` est en ligne**.
Le flow de mise en ligne est dans [`RELEASE.md`](RELEASE.md). Le travail de conception (spec, recherche,
catalogue de tâches, charte) vit dans un dépôt privé.

- `index.html` : le site, un seul fichier, sans framework.
- `catalogue.js` : le catalogue de tâches (familles, tâches, fréquences et durées par défaut), généré depuis le dépôt privé.
- `fonts/` : Fraunces et Instrument Sans, auto-hébergées (licence OFL), pour ne rien charger chez un tiers.
- `tools/check-orphans.js` : contrôle des commits poussés après merge d'une PR.

Sources des valeurs par défaut : INSEE, enquête Emploi du temps 2010 ; Fair Play (Eve Rodsky, 2019) ;
Allison Daminger, « The Cognitive Dimension of Household Labor », 2019.
