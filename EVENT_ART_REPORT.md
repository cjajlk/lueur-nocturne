# Finitions visuelles des quatre événements

## Différences
| Événement | Avant | Après |
|---|---|---|
| Pluie | 24 traits fins répartis dans le viewport | Gouttes dorées descendantes ancrées dans le monde, halos doux, étoiles à quatre branches ; anneau et étoile d'arrivée pendant 1,2 s pour les vraies lueurs ajoutées |
| Brume | Teinte uniforme et cinq larges gradients | Nappes bleues/mauves localisées et allongées, espaces dégagés, dérive lente, volutes et points lumineux ; aucune teinte uniforme |
| Gardiens | Trois arcs tournants | Impulsion d'ouverture de 1,4 s, halo orangé, six motifs stellaires animés autour du gardien ; contours de danger et protection dessinés au-dessus |
| Courant | Flux cyan/violet corrigés | Conservé : pas de nouvelle ligne plein écran ni de distorsion ; vérifié dans les trois formats |

[Galerie comparative avant/après](docs/event-art/index.html) : quatre paires de captures réelles 360×800, plus PC et paysage. Les scènes utilisent une graine fixe pour le décor et la simulation, ainsi que des graines d'événements reproductibles. Mêmes positions et instant 8 s de l'événement. Les scènes sont préparées pour rendre les effets visibles, pas des illustrations.

## Portée et performance
- Production : dist/game.js (dessin et mémorisation graphique de l'instant d'apparition des lueurs), dist/index.html et dist/session.js (cache).
- Les instants d'apparition utilisent une WeakMap hors sauvegarde, sans changer les lueurs, leurs coordonnées, leur collecte ou le générateur aléatoire de la simulation.
- Plafonds : 80 gouttes décoratives dans le monde avec élimination hors champ ; 25 nappes au maximum, seules les nappes visibles étant dessinées ; six motifs par gardien visible ; Courant inchangé à 64 flux maximum.
- Pas de bibliothèque, filtre de flou plein écran, nouvelle particule de simulation ni tirage aléatoire de rendu.
- Les effets sont dessinés sous les créatures et indications. Les animations lisent l'horloge active existante : elles restent figées en pause. Les transitions progressives existantes sont conservées.
- Durées, probabilités, vitesse, IA, absorption, collisions, sauvegardes, défis, monnaies, calendrier de Noël et CJEngine inchangés. Aucun changement dans leurs modules.

## Tests réussis
- event-art-tests.cjs : animations déterministes et figées sans progression du temps, aucun changement de l'état de jeu, plafonds, brume sans voile uniforme, impulsion et fin d'impulsion des gardiens, apparition/expiration des halos de lueurs, priorité visuelle aux dangers.
- current-visual-tests.cjs : passages locaux ≤78 px, absence de distorsion, animation/gel/fin, trois formats.
- expedition-tests.cjs : sélection, durées, gel, vitesse commune, collecte, collisions, cadence des gardiens et retour normal, trois arènes et protection du profil.
- expedition-ui-tests.cjs : 36 combinaisons (4 événements × 3 arènes × 1920×1080 / 360×800 / 800×360), aucune exception JavaScript, pause/fin, contrôles et indicateurs accessibles, profil inchangé par le dessin. Captures avant/après inspectées.
- gameplay-tests.cjs, graine 42 : suite complète réussie (expédition complète, croissance, protections, pouvoirs, commandes tactiles, pause, survie libre et cosmétiques).
- Mesures indicatives sur le PC hôte : généralement 9–23 ms pour 30 dessins ; quelques pics 34–158 ms, y compris des variations dans les références avant modification. Ce ne sont pas des mesures de fluidité sur téléphone physique. Aucune garantie Android réel déduite de ces chiffres.

Fichiers de validation : event-art-tests.cjs, expedition-ui-tests.cjs (graines fixes et captures supplémentaires), ce rapport, docs/event-art/.

Le résultat simulé est lisible et visuellement différencié. Le ressenti et la fluidité sur téléphone réel restent à valider par CJ.
