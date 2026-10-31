# Finition visuelle des traînées — Lueur Nocturne

## Modifications
- Aurore : souffle bleu fin, doux et légèrement ondulé.
- Poussière d’or : petites étoiles chaudes avec cœur clair et poussières dorées.
- Comète : segments allongés bleu-cyan, cœur lumineux et petites étincelles ; sillage plus tendu.
- Lucioles : points verts et dorés, oscillations et pulsations irrégulières déterministes.
- Brume astrale : nappes elliptiques translucides roses et violettes.
- Givre lunaire : cristaux bleutés facettés et petites poussières glacées.

Le même dessin de particule est utilisé dans le catalogue, la démonstration et l'arène. Les cartes de traînées montrent maintenant un échantillon de leur forme, pas seulement une tache colorée. La démonstration dure quatre secondes, avec défilement du sillage et léger mouvement du personnage sur fond sombre. Les tailles de particules en partie sont compensées modérément selon le zoom, sans zoom global ni agrandissement du personnage.

## Protection et performances
Aucun changement de catalogue, prix, catégorie, achat, monnaie, sauvegarde, statistiques, défis, Noël, Hub ou pseudo. dist/core.js est inchangé.
Même cadence et durée de vie des particules de déplacement, mêmes tirages aléatoires. Aucun ajout de particule : plafond général de 250 conservé ; réserve et durée des absorptions inchangées. Rendu sans flou/filtre coûteux ni bibliothèque. Aucune conséquence sur la simulation.

## Contrôles réussis
- trail-visual-tests.cjs : six échantillons distincts, six démos sans écriture de sauvegarde, catalogue, fermeture et débordements ; formats 360×800, 800×360 et 1920×1080 ; aucune erreur console.
- Inspection des six démos à largeur mobile et d'une scène de jeu avec Comète et un ennemi dangereux : silhouette, valeur et contour de danger restent lisibles.
- Stress à 250 particules de traînée (cas volontairement excessif) : 60 appels de rendu par effet. Coûts observés de 38 à 310 ms par série, soit environ 0,6 à 5,2 ms par appel sur ce PC. Ce sont des coûts d'appels canvas, pas une mesure garantie de cadence GPU ou de performance Android physique.
- gameplay-tests.cjs, graine 42 : simulation, déplacement, puissance, temps actif, tirages aléatoires, absorptions et limites inchangés ; rendu sans mutation du joueur/profil.
- shop-v2-tests.cjs, appearances-tests.cjs, recurring-tests.cjs, fragments-tests.cjs, mascots-tests.cjs : achats, équipements, retrait, récompenses, sauvegardes et Noël.
- shop-v2-ui-tests.cjs, appearances-ui-tests.cjs, mascots-ui-tests.cjs : trois formats, achats/erreurs de stockage/doublons, rechargements, équipements indépendants, verrou entre onglets, profils et données protégés.

## Fichiers
- dist/game.js : dessin partagé, échantillons, démo et particules d'arène.
- dist/mobile.css : présentation des échantillons canvas et fond d'aperçu.
- dist/index.html, dist/session.js : versions de cache uniquement.
- trail-visual-tests.cjs : vérifications visuelles et charge de rendu.

## Limites
Les illustrations des personnages restent inchangées : seule leur traînée cosmétique est redessinée. Validation définitive du rendu et de la fluidité sur téléphone réel à effectuer par CJ.
