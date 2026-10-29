# V0.9 — Lot 3 : Niva et Solstice

Lot 2 `0dafe32` conservé. Aucun changement au calendrier, aux fragments, aux arènes, à l’IA, aux vitesses communes, aux collisions, aux monnaies du Hub ou à la formule d’absorption.

## Déblocages et pouvoirs

- Niva — Esprit du givre : 40 Fragments de Noël 2026. Impulsion de Nyx : coût 4 lumières, durée 0,55 seconde, déplacement temporaire ×3,1 et recharge de base 7 secondes.
- Solstice — Esprit du solstice : 80 Fragments de Noël 2026. Traversée d’Umbra : coût 7 lumières, protection de 3 secondes et recharge de base 11 secondes.
- Même vitesse normale de 180 unités/s et mêmes fonctions de croissance/collision. Bénédictions existantes conservées. Aucun pouvoir inédit ni changement des quatre personnages d’origine.
- Les achats sont possibles dans l’ordre choisi, uniquement pendant l’édition `christmas-2026` active (décembre, heure de Paris). Pas de réouverture automatique de ces offres en 2027. Les deux mascottes acquises restent sélectionnables toute l’année, y compris lors des éditions suivantes.

## Sauvegarde

`lueur-nocturne-v1.events.christmas2026` conserve les champs du Lot 2 et ajoute `mascots` et `transactions` (identifiant, coût, édition). La normalisation charge les acquisitions avant de valider le personnage sélectionné, évitant un retour injustifié à Nyx après rechargement. Les anciennes sauvegardes restent compatibles.

L’achat prépare une copie du profil, vérifie période/solde/acquisition, déduit exactement le coût et ajoute une seule transaction. L’ensemble est écrit dans une seule opération de stockage ; le profil utilisé en jeu n’est remplacé qu’après réussite. Si l’écriture échoue, achat refusé et aucun débit. Le solde ne peut pas devenir négatif. Ni Éclats nocturnes ni CJ universels utilisés.

## Illustrations et interface

PNG originaux de CJ conservés à l’identique dans `dist/assets/christmas/`. Dimensions 1254×1254, transparence vérifiée. WebP sans perte : Niva 1 239 486 octets contre 1 694 514 ; Solstice 1 709 794 contre 2 222 664. Alpha identique et égalité de tous les pixels visibles vérifiés. Aucune nouvelle illustration ni bibliothèque installée.

Rendu par le canvas existant, échelle proportionnelle au rayon, orientation et oscillation existantes ; PNG de secours pour le rendu en cas d’échec WebP. Deux petites cartes au refuge pendant Noël 2026, compteur du Lot 2 conservé, mention Acquise et boutons accessibles au tactile. Collection permanente à six esprits ; aucun nouveau bloc HUD.

## Validation

- `mascots-tests.cjs` : deux ordres d’achat, prix exacts, insuffisance, doublons, migration/rechargement, éditions, sélection permanente, personnages d’origine, solde indépendant ; comparaison des vrais pouvoirs/mouvements/protections Niva–Nyx et Solstice–Umbra.
- `mascots-ui-tests.cjs` : chargement des deux images, trois puissances de rendu (24/100/400), refus sans débit en cas de stockage indisponible, achats et transactions, sélection via la collection, rechargement, janvier puis décembre 2027, départ et retour dans les trois arènes ; conservation du pseudo et du solde Hub.
- PC 1920×1080, Android simulé 360×800 et paysage 800×360 ; absence de débordement horizontal et d’erreur JavaScript. Captures vérifiées pour les offres, la collection mobile et Solstice en jeu. Validation physique Android à effectuer par CJ.
- Toutes les suites existantes passent : économie, combat, gameplay (graine 42), rendu, affichage, déplacement, IA, blocages, collisions gardiens, calendrier, fragments, interface saisonnière et interface fragments.
- `tests.cjs` précise désormais que les accomplissements ordinaires déverrouillent les quatre esprits initiaux, pas les deux acquisitions événementielles.

Fichiers : `dist/core.js`, `dist/game.js`, `dist/index.html`, `dist/mobile.css`, quatre images dans `dist/assets/christmas/`, `tests.cjs`, `mascots-tests.cjs`, `mascots-ui-tests.cjs`, ce rapport.
