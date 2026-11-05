# Courant astral — correctif visuel

Les huit longues courbes et leurs chevrons ont été remplacés par 64 flux courts au maximum, répartis dans les coordonnées du monde. Seuls les éléments proches du champ de vision sont dessinés. Cyan et violet alternent, avec têtes lumineuses, petites étincelles et quelques doubles filets. Chaque passage mesure 24 à 78 pixels, indépendamment du zoom de l'arène. Aucun filtre, déformation, voile ni tracé couvrant toute la scène.

Le rendu reste sous les créatures, les contours de danger, les indications et le HUD. Mouvement déterministe à partir du temps actif existant : aucune allocation de particules de simulation, aucun tirage aléatoire partagé, aucune mutation de la caméra ou de l'événement. La pause fige les flux et la fin les supprime.

## Périmètre
- dist/game.js : uniquement la branche de dessin du Courant astral.
- dist/index.html et dist/session.js : versions de cache du chargement du jeu.
- current-visual-tests.cjs : contrôle du rendu local, budget, mouvement, gel et absence de mutation.
- expedition-ui-tests.cjs : captures supplémentaires du courant dans les trois formats.
- docs/current-visual : trois captures inspectées.

Durée 30 s, départ après 60 s actives, facteur 1,12, collisions, autres événements, économies, Noël, défis, sauvegardes et raccordement CJEngine inchangés.

## Validation
- current-visual-tests : réussi en 1920×1080, 360×800 et 800×360 ; traits limités à 78 px, animation déterministe et arrêtée à la fin, aucun effet plein écran ni modification d'état.
- expedition-tests : réussi, dont vitesse commune, durée, pause/reprise, collisions et retour à la normale.
- expedition-ui-tests : 36 combinaisons (4 événements × 3 arènes × 3 formats) réussies ; aucun débordement ni exception JavaScript ; conservation du profil ; autres événements inchangés.
- gameplay-tests, graine 42 : suite complète réussie.
- Coût observé du courant : 30 dessins en environ 10–20 ms sur le PC hôte selon le scénario. Ce contrôle ne mesure pas les performances d'un téléphone physique.

Captures : [portrait](docs/current-visual/current-360.png), [paysage](docs/current-visual/current-800.png), [PC](docs/current-visual/current-1920.png).

Le rendu est désormais dispersé et laisse l'action lisible dans les trois formats inspectés. La validation finale sur Android réel reste à effectuer par CJ.
