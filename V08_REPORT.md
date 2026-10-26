# V0.8 — Forêt des Lueurs

## Architecture et sélection
Le moteur utilise un canvas commun. Le décor est dessiné avant les éléments interactifs ; les collisions sont calculées séparément dans movement.js. La nouvelle arène est donc un habillage du même monde, sans nouvelle carte physique ni nouvelle mécanique.

Au refuge, choisir Destination → Forêt des Lueurs, puis commencer l’expédition. Ciel nocturne reste disponible et sélectionné par défaut au rechargement. Le choix est fixé pour l’expédition, sans nouveau champ dans les sauvegardes.

## Fichiers
- dist/arenas.js : thème forestier déterministe, silhouettes bleues/violettes, végétation, champignons, lucioles cyan, brume diffuse et lianes sur cristaux.
- dist/game.js : sélection dans l’état temporaire de partie et branche de rendu ; simulation commune inchangée.
- dist/index.html : sélecteur accessible, chargement du thème et version V0.8.
- dist/mobile.css : présentation du sélecteur, cible tactile 44 px et ajustements du menu étroit.
- gameplay-tests.cjs : chargement du module et tests de parité entre les arènes.
- V08_REPORT.md : ce rapport.

Les arbres sont des silhouettes de fond traversables, les cristaux restent les obstacles physiques. Le décor est écarté du voisinage des objectifs. Aucun changement de core.js, ai.js, combat.js, movement.js, rendering.js ou du HUD. Aucune modification du Hub, des monnaies, des sauvegardes ou des personnages.

## Validation du 26 octobre 2026
Les neuf suites *.cjs passent : IA, déblocage, combat, affichage, gameplay, collisions gardiens, mouvement, rendu et économie/sauvegardes.

Tests V0.8 : génération déterministe sans consommation de hasard du gameplay ; choix figé durant la partie ; simulations identiques avec la même graine dans les deux arènes (positions, puissances, nourriture, objectifs) ; aucun changement d’état ni de profil pendant le rendu ; obstacles identiques ; trois sanctuaires puis survie libre fonctionnels.

Régression : expédition contrôlée complète de 503,5 secondes, endurance IA de 15 minutes, croissance, absorption, seuils des gardiens, boucliers, multitouch, rotation, vitesse commune et pouvoirs temporaires. Calcul de 600 mises à jour avec 24 bots : 779 ms sur ce PC, hors rendu ; ce chiffre ne représente pas des FPS Android.

Contrôles dans le navigateur : forêt à 360×800, 390×844, 800×360 et 1920×1080 ; lancement, déplacement clavier et commande du joystick, pause/reprise, rotation, retour au refuge et changement d’arène. HUD, lueurs, créatures et flèches restent lisibles. Aucun débordement horizontal observé. Menu paysage défilable et sélection accessible. Ciel nocturne vérifié à 1920×1080 et 360×800. Aucune erreur console observée.

## Limites
Le décor est limité à 64 arbres et 110 plantes, avec élimination des éléments hors champ ; pas de textures externes ni de filtre coûteux ajouté. La simulation de tailles mobiles est réalisée dans un navigateur de bureau : elle ne mesure ni le GPU ni la batterie d’un Android. Le test définitif de fluidité et de confort sur téléphone physique reste à effectuer par CJ.
