# Correctif — blocages, flèches latérales et HUD

## Causes et corrections

L’évitement précédent additionnait une répulsion des cristaux à la direction désirée. Avec des cristaux solides, cette méthode peut osciller devant un obstacle sans trouver de passage. Le dégagement pointait vers le centre sans vérifier la liberté du chemin.

L’IA vérifie désormais plusieurs directions sur 80 unités, avec les polygones de collision et le rayon réel. Elle conserve un côté de contournement tant que la route directe reste bloquée. Les petits allers-retours sont détectés plus tôt ; le dégagement utilise lui aussi cette recherche de passage. Un filtrage de proximité évite de tester les cristaux lointains. Vitesse de 180 unités/s, charges, collisions, protections et monnaies inchangées.

L’ancien calcul des flèches projetait vers le haut/bas puis limitait leur hauteur, les laissant à l’intérieur de la scène. Elles restent maintenant à 24 pixels du bord gauche ou droit, avec une flèche orientée vers la cible réelle et un numéro discret. Les objectifs visibles gardent leur indication locale ; aucun doublon hors écran. Repères restants, puis sanctuaire le plus proche : aucune nouvelle série de flèches ennemies.

Les libellés évitent une zone centrale de 130 × 130 pixels autour du joueur. Les valeurs des gardiens utilisent leur symbole hexagonal au lieu du grand mot GARDIEN ; les traits de liaison sont atténués. Le HUD a un fond plus opaque. Le panneau étroit 701–900 pixels utilise une présentation compacte : vies et durée sous les objectifs, mini-carte discrète. Les règles de téléphone existantes sont conservées.

## Vérifications

- `blockage-tests.cjs` : trois types de bots × trois puissances (25, 250, 600), contournement complet d’un cristal, puis sortie d’un groupe concave ; aucune pénétration des obstacles. Ancienne IA testée sur le même scénario : échec reproduit (gardien bloqué à environ 476 unités du but). Nouvelle IA : succès.
- `gameplay-tests.cjs` : endurance 15 minutes, absorption, réapparition, boucliers, croissance, expédition contrôlée de 503,5 s et survie libre ; pouvoirs et contrôles clavier/tactiles.
- Boucle complète à 24 bots : 600 mises à jour en environ 1 507 ms sur ce PC, hors rendu. Ne constitue pas une mesure Android.
- `ai-tests.cjs`, `movement-tests.cjs`, `combat-tests.cjs`, `tests.cjs`, `display-tests.cjs`, `rendering-tests.cjs` : réussis. Assertions ajoutées sur le maintien des flèches aux bords, notamment en 770 × 810.
- Contrôles visuels : 360 × 800, 390 × 844, panneau 770 × 810 proche de la capture, PC 1920 × 1080. Aucun débordement horizontal observé en portrait, aucune erreur JavaScript observée.

## Fichiers

`dist/ai.js`, `dist/game.js`, `dist/rendering.js`, `dist/mobile.css`, `dist/index.html`, `blockage-tests.cjs`, `rendering-tests.cjs`, `BLOCKAGE_HUD_REPORT.md`.

## Limites

Les tests reproduisent des configurations concrètes mais ne prouvent pas l’absence de blocage dans toute disposition possible. L’évitement reste local, sans recherche globale de chemin. Fluidité et confort prolongé sur Android réel à confirmer par CJ. Aucun changement du Hub, des sauvegardes, des Éclats, de la progression ou des personnages.
