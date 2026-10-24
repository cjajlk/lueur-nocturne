# Correctif V0.6.1 — vitesse commune et cristaux solides

## Audit

Avant correction, les vitesses configurées étaient : Nyx 180, Mira 170, Orion 145, Umbra 185 ; petits bots 48, chasseurs 76, gardiens 38 unités/s. Un facteur supplémentaire `1 - min(lumière,180)/1100` ralentissait toutes les catégories selon leur masse (jusqu’à 16,4 %). Il n’y avait pas de véritable accélération progressive : la vitesse était appliquée immédiatement. La caméra lissée et les changements de direction pouvaient modifier la sensation de déplacement, pas le plafond physique.

## Correction

- Plafond normal commun : 180 unités/s. Un seul moteur de déplacement, indépendant de la masse, de la catégorie et du dispositif de commande.
- Les quatre valeurs de configuration des personnages sont alignées ; description d’Orion corrigée.
- Clavier diagonal, souris et joystick normalisés à une longueur maximale de 1. Le joystick partiellement incliné reste volontairement plus lent. Aucun avantage tactile permanent.
- Impulsion de Nyx ×3,1 conservée. Préparation de charge du chasseur ×0,12 puis charge ×2,5 conservées. Durées, coûts, recharge, protections et capacités des autres personnages inchangés. Immobilisation temporaire conservée.
- Poursuite, fuite, patrouille et récupération de blocage conservées. Tous les bots évitent désormais les cristaux, pas seulement les gardiens.
- Les cristaux étaient décoratifs et traversables. Pour satisfaire le contrôle demandé, leurs facettes visibles et leur éclat secondaire sont désormais des polygones solides communs au joueur et aux bots.
- Collision selon le rayon réel, déplacement découpé en pas de 4 unités maximum pour éviter la traversée pendant les impulsions, glissement le long des obstacles et correction du chevauchement dû à la croissance.
- Les cristaux trop proches des repères ou sanctuaires ne sont pas générés afin de maintenir leur accès. Aucun objectif déplacé, aucune nouvelle carte.
- Une correction de position physique sans commande ne doit pas compter comme déplacement actif : protection explicite de ce cas. Règles et soldes des Éclats inchangés.

## Résultats

- `movement-tests.cjs` : course de 1 seconde = 180 unités pour les quatre catégories et des puissances 10, 24, 100, 250, 400 et 1 600 ; diagonales et entrées tactiles excessives plafonnées ; poursuite/fuite en ligne droite à écart constant ; impulsion puis retour normal ; non-traversée des cristaux pour grandes créatures et charges ; récupération après croissance ; gardien autonome face à un cristal solide.
- `gameplay-tests.cjs` : comparaison du clavier et du joystick à pleine inclinaison sur les quatre personnages ; activation et expiration réelle du pouvoir de Nyx ; absorption, boucliers, pouvoirs, progression, captures et sauvegardes. Parcours contrôlé adapté à un couloir libre, les obstacles étant devenus solides.
- Endurance 15 minutes : aucune fin forcée ; population et monnaie inactive conformes.
- Expédition contrôlée : 503,5 s, trois sanctuaires et survie libre. Les ennemis y sont neutralisés pour isoler les conditions de progression ; cela ne mesure pas la difficulté humaine.
- Boucle à 24 bots : 600 mises à jour en environ 909 ms sur ce PC, hors rendu ; pas une mesure de FPS Android.
- Tests IA, combat, économie/migration, affichage et rendu : réussis.
- Navigateur : 360 × 800 et 390 × 844, PC 1920 × 1080 ; joystick, clavier et pause/reprise vérifiés. Aucune erreur JavaScript observée.

## Fichiers

`dist/movement.js`, `dist/core.js`, `dist/ai.js`, `dist/game.js`, `dist/index.html`, `movement-tests.cjs`, `gameplay-tests.cjs`, `README.md`, `SPEED_REPORT.md`.

## Limites

Le ressenti de vitesse, la difficulté désormais plus élevée et la fluidité sur téléphone physique restent à confirmer par CJ. Les différences temporaires de vitesse sont intentionnelles ; une collision ou une direction de fuite non rectiligne peut réduire la distance parcourue. La résolution des collisions est locale, pas un calcul de chemin global. Aucun nouveau prédateur ajouté ; aucun changement du Hub, des soldes ou du format des sauvegardes.
