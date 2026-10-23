# Rapport V0.4 — 23 octobre 2026

## Audit et causes

1. La croissance était comprimée par le terme fixe du rayon, le recul de caméra dès 70 lumières et le plafond à 400. La V0.3 utilisait aussi des formules différentes pour joueur et bots. La normalisation des silhouettes ajoutée précédemment est conservée.
2. Les bots savaient récolter mais aucun couple bot/bot n’était testé. La réapparition après absorption par le joueur était immédiate et sans protection.
3. Les gardiens étaient créés par les renforts de chaque sanctuaire, en plus des trois initiaux.
4. Les anciens rochers n’étaient utilisés que par le dessin : aucune collision ni interaction physique.
5. Une limite de six minutes, puis un maximum de 60 secondes après le troisième sanctuaire, contredisait une expédition de 8–12 minutes et la survie libre.
6. La monnaie intitulée « CJ locaux » était exclusivement stockée dans le navigateur. Aucun appel au Hub, à CJEngine, ni conversion n’existait.

## Corrections par lot

- **Croissance** : rayon commun `5 × √lumière`, initialement 24,5 unités à 24 lumières et 100 à 400 lumières. La constante conserve un petit départ proche du rayon initial précédent (26,3). La surface suit la lumière. Aucun recul lié à la masse, aucun plafond à 400 ; rendement décroissant au-delà de 160 maintenu. Rendu, contacts, récolte et limites de l’arène utilisent le rayon courant. Le seuil de pénétration de contact (70 % de la somme des rayons) est conservé.
- **Bots** : priorité à la fuite, puis poursuite de proies, sinon récolte. Seuil hérité du jeu : proie ≤ 90 % de la lumière du prédateur. Gain hérité de l’absorption joueur : min(12, 22 % de la proie), soumis au rendement décroissant. Cooldown d’une seconde. Les victimes disparaissent et entrent dans une file de réapparition à quatre secondes. Aucun gain de monnaie, statistiques ou récompenses joueur lors d’une absorption entre bots.
- **Protection** : règles pures réutilisables dans `combat.js`, sans réseau ni stockage. Trois secondes de bouclier cyan ; protection dans les deux sens, y compris face aux gardiens. L’API d’intention d’attaque annule immédiatement le bouclier. L’IA protégée reste normalement en récolte/fuite. Recherche bornée de 80 emplacements puis nouvel essai différé plutôt qu’apparition forcée au contact.
- **Hiérarchie** : deux gardiens initiaux, aucun gardien supplémentaire aux sanctuaires. Contours de danger, hexagone et mention GARDIEN. Étiquettes séparées du zoom, exclues du HUD, des commandes et des repères ; déplacement limité à trois lignes avant omission des informations encombrantes.
- **Cristaux** : silhouettes de cinq à sept sommets, faces ombrées, reflets et arêtes bleu-violet. Géométrie calculée une fois, élimination hors champ. Toujours décoratifs.
- **Durée** : trois séries de repères et 120/160/200 secondes de déplacement actif hors refuge. Offrandes inchangées à 80/160/240, quatre secondes chacune. Le joueur choisit toujours l’ordre des sanctuaires. Aucun compte à rebours ni fin automatique au portail. Pause permet une sortie volontaire avec bilan. Les pertes de lumière dues aux offrandes et captures restent intentionnelles.
- **Économie** : `shards` dans le code, « Éclats nocturnes » dans l’interface. Lecture des anciennes sauvegardes `cj`, miroir à l’écriture pour compatibilité ; clé locale inchangée. Prix, déblocages et cadence (un Éclat/600 secondes actives) conservés. Aucun fichier d’un autre jeu ou du Hub modifié.
- **Intégration** : bilan enrichi et deux records persistants. Défi rapide adapté à douze minutes, ancienne progression conservée. Correction du défilement résiduel à l’ouverture d’une autre fenêtre.

## Vérifications

- Tests core : monnaie, achats, déblocages, corruption et migration d’une sauvegarde V0.3 avec tous les achats et personnages.
- Tests combat : limite 90/90,01 %, poursuite/fuite, contacts, trois secondes de protection, annulation à l’attaque, gardiens, cooldown et victime déjà retirée.
- Tests moteur : pouvoirs, captures, refuge, offrandes, collecte partagée, croissance, entrées tactiles simultanées, pause, rotation et redimensionnement.
- Simulation d’endurance : quinze minutes, 14–18 bots présents, population totale présente + attente égale à 18, deux gardiens maximum, aucune fin forcée ni monnaie pour un joueur immobile.
- Scénario contrôlé d’expédition : départ à 24 lumières, une lueur/seconde, déplacements réels du moteur, visites de repères et trois offrandes. Trois étapes à environ 493,5 secondes (8 min 13 s), puis dix secondes de croissance libre avant sortie volontaire. Bots écartés de ce scénario de progression ; ce n’est pas une mesure de difficulté humaine.
- Tests géométriques : huit valeurs de puissance, proportions communes, croissance et placement des étiquettes.
- Navigateur : accueil, menus, jeu, sortie volontaire et bilan inspectés en 360×800, 390×844, 800×360 et PC 1920×1080 ; canvas à la taille exacte du viewport, pas de débordement horizontal. Rotation, passage à 360×680, pause/reprise et contrôles testés. Aucune erreur JavaScript détectée.
- Les captures et observations navigateur sont des simulations de dimensions ; aucun téléphone physique n’a été déclaré validé.

## Limites

L’objectif 8–12 minutes reste un réglage initial : les captures, le rythme de collecte, les détours et les pauses peuvent prolonger une partie. Les tests de quinze minutes n’établissent pas l’équilibre d’une survie infinie. Les silhouettes artistiques ont des transparences : les collisions sont circulaires, pas au pixel. Les récompenses permanentes acquises sont sauvegardées périodiquement, mais une expédition en cours ne reprend pas après fermeture du navigateur (comportement existant).

Le test Android physique final et l’appréciation du rythme restent à effectuer par CJ.

## Fichiers

`dist/core.js`, `dist/combat.js`, `dist/game.js`, `dist/rendering.js`, `dist/index.html`, `dist/mobile.css`, `tests.cjs`, `combat-tests.cjs`, `gameplay-tests.cjs`, `rendering-tests.cjs`, `README.md`, `V04_REPORT.md`.

