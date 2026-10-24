# Lueur Nocturne V0.6 — rapport de vérification

## Corrections

- IA isolée dans `dist/ai.js`, sans accès aux sauvegardes ni à la monnaie.
- Cause du blocage des gardiens : direction réfléchie au bord puis remplacée par la cible à l’image suivante ; logique de fuite commune traitant les autres gardiens comme des menaces.
- Patrouille autonome, éloignement progressif des limites selon le rayon réel, séparation des gardiens et évitement local des cristaux. Après 1,5 s sans déplacement suffisant, abandon de la cible et trajectoire de dégagement temporaire. Aucun déplacement instantané.
- Perception des gardiens limitée à 420 unités, poursuite limitée à 8 s, délai avant nouvelle acquisition. Cible oubliée hors de portée, protégée ou revenue au refuge. Pas de connaissance de la position distante du joueur.
- Profils prudent (récolte/fuite), équilibré (récolte/opportunités), chasseur (recherche de proies/poursuite bornée). Profil conservé à la réapparition. Récolte et absorption restent les seules sources de croissance.
- Renforts existants conservés : 18 créatures puis 2 supplémentaires par sanctuaire, soit 24 maximum. Recherche des chasseurs : 360 à 465 unités selon les sanctuaires. Ancienne hausse automatique de vitesse supprimée ; masses de départ et gains conservés.
- Collisions, seuil d’absorption, bouclier de 3 s, coûts des offrandes et progression inchangés. Survie libre sans durée maximale.
- Cristaux allongés bleu-violet, facettes stables, éclats secondaires, ombres et reflets. Ils restent décoratifs, comme avant : aucune nouvelle collision solide. Calcul des silhouettes au démarrage, éléments hors champ non dessinés.
- Aube : triangle doré ; Éveil : carré lavande ; Horizon : hexagone cyan. Noms courts, cartouches arrondis sans bordure épaisse. Étiquettes déplacées ou omises si occupées.
- Flèches masquées quand l’objectif est à l’écran ; marge haute accrue pour éviter la mini-carte et les bénédictions.

## Tests exécutés

- `ai-tests.cjs` : quatre coins, dégagement d’un cristal, gardiens superposés, perception/oubli/abandon, profils, évolution de la détection et maintien du bouclier. Simulation déterministe.
- `combat-tests.cjs` : absorption, seuils, collisions, protection et délai entre repas.
- `gameplay-tests.cjs` : boucle réelle, collecte/croissance, absorption entre bots, réapparition, multitouch, rotation, pause, pouvoirs, offrandes, progression et survie libre. Capture effective d’un joueur immobile hors refuge par un chasseur.
- Endurance : 15 minutes simulées avec IA normale, population totale stable, aucune fin forcée ni monnaie gagnée à l’arrêt.
- Expédition contrôlée : 503,5 s, collecte et déplacements réels, trois sanctuaires et poursuite libre. Ce scénario neutralise les ennemis pour tester les portes de progression ; il ne valide pas la difficulté d’une partie humaine complète.
- Charge maximale : 24 bots, 600 mises à jour de la boucle complète en 1 332 ms sur ce PC, hors rendu. IA seule : environ 47 ms pour 600 pas à 24 bots. Ces mesures ne sont pas des FPS Android.
- `tests.cjs` : économie locale, migration de l’ancien solde, personnages, achats et sauvegardes préservés.
- `rendering-tests.cjs` et `display-tests.cjs` : croissance, placement, bords, hauteur dynamique et plein écran.
- Contrôles navigateur : 360 × 800, 390 × 844, 800 × 360 et 1920 × 1080 ; partie locale et scène fixe locale près d’Horizon/cristaux. Aucun débordement horizontal observé en portrait, aucune erreur JavaScript observée.

## Limites

La difficulté ressentie, les FPS, la chauffe et le tactile prolongé restent à valider par CJ sur téléphone réel. Le contournement est une direction d’évitement locale avec récupération de blocage, pas un calcul de chemin global. Aucune carte ni aucun personnage ajouté. Aucun accès au Hub ni modification des Éclats nocturnes.

## Fichiers concernés

dist/ai.js, dist/game.js, dist/rendering.js, dist/index.html, ai-tests.cjs, gameplay-tests.cjs, README.md et V06_REPORT.md.
