# Lot 6 — Expéditions variées

## Fonctionnement livré
Cinq possibilités de poids identique (20 % chacune) : classique, pluie, brume, éveil, courant. Configuration centralisée dans dist/expeditions.js. Sélection une seule fois à start(), avec une graine indépendante du générateur de la simulation. Les tests peuvent fournir une graine reproductible.

Départ après 60 secondes de déplacement réel commandé, selon le critère déjà utilisé par le jeu (>0,2 unité par mise à jour). Durées elles aussi en temps de déplacement actif : 45 secondes pour pluie/brume/gardiens, 30 pour courant. Pause, immobilité, perte de focus et onglet masqué ne font pas avancer ce compteur. Les transitions waiting/active/done sont irréversibles dans une expédition ; captures, sanctuaires et pause ne recréent pas l'événement. Une nouvelle expédition fait un nouveau tirage. Comme auparavant, une expédition en cours n'est pas restaurée après fermeture/rechargement ; aucune migration de sauvegarde ajoutée.

- **Pluie de lueurs** : six vagues espacées de 7,5 secondes, 20 lueurs par vague, quatre zones de l'arène. Emplacements hors obstacles et cercles des sanctuaires. Maximum 120 lueurs supplémentaires (520 avec les 400 normales), non remplacées après collecte, supprimées à la fin. Récolte par le joueur et les bots via les fonctions existantes ; statistiques et défis reçoivent les vraies actions. 24 traits lumineux décoratifs, sans nouveau pool de particules.
- **Brume mystérieuse** : cinq nappes translucides avec montée et disparition de quatre secondes. Dessin au-dessus du décor mais sous les lueurs, fragments, créatures, contours de danger et libellés ; HUD inchangé. Pas de filtre appliqué aux personnages.
- **Éveil des gardiens** : renouvellement des destinations de patrouille 1,6 fois plus fréquent (14 secondes de patrouille deviennent environ 8,75). Vitesse de base, détection, poursuite, puissance et protections inchangées. Trois arcs dorés autour des gardiens. À la fin, cadence normale ; la destination en cours reste valide.
- **Courant astral** : facteur de déplacement temporaire 1,12 commun au joueur et aux bots/gardiens, y compris sur leurs multiplicateurs temporaires existants. Coûts, durées, recharges et rapports de vitesse des capacités inchangés. Sous-pas du moteur de collision conservés. Huit filaments cyan/violet et chevrons. Retour au facteur 1 à la fin.

Annonce initiale et notifications de début/fin via le toast existant. Petite pastille de temps restant, sans interaction ni interruption des commandes ; en paysage elle laisse priorité au panneau d'offrande. Toutes les arènes utilisent le même événement, sans remplacer le calendrier de Noël.

## Tests
- expedition-tests.cjs : 10 000 graines reproductibles, toutes les possibilités (classique 1835, pluie 1971, brume 2065, éveil 2064, courant 2065) ; sélection/durées/déclenchement unique ; gel ; extinction ; 120 lueurs réparties/accessibles ; collecte joueur et bot ; transitions sans modification des monnaies/profil ; vitesse commune joueur/gardien ; bouclier de réapparition ; pouvoir Nyx inchangé ; collisions jusqu'à 1000 lumières avec courant et impulsion ; cadence de patrouille et retour normal ; dessin sans mutation sur les trois arènes.
- expedition-ui-tests.cjs : 4 événements × 3 arènes × 3 formats (1920×1080, 360×800, 800×360), 36 scénarios réussis. Pastille dans le viewport, aucune collision avec indication d'exploration/bouton/joystick ; pause et fin ; aucun débordement horizontal ni exception JavaScript ; captures inspectées.
- 30 dessins successifs : environ 9–24 ms de temps hôte selon le scénario testé. Mesure de rendu canvas sur PC, pas une certification de fréquence Android/GPU. Effets décoratifs bornés ; aucun ajout de bibliothèque.
- gameplay-tests.cjs, graine 42 : suite complète réussie (expédition, croissance, collisions, commandes/tactile, pouvoirs, survie libre, absorption, cosmétiques).
- save-v2-tests, recurring-tests, appearances-tests, shop-v2-tests, rare-tests, events-tests, fragments-tests, mascots-tests : réussis.
- hub-activity-tests.cjs : réussi sur les trois formats, plus souris/tactile avec horloge réelle. 599 s + rechargement + 1 s = 600 s et exactement 1 CJ ; pauses/inactivité/masquage/focus, écritures en échec, sessions concurrentes et retour au Hub vérifiés. Une attente du test utilisait l'animation alors que celui-ci neutralise requestAnimationFrame : attente remplacée par un sondage de 50 ms, sans changer CJEngine.

## Fichiers
Production : dist/expeditions.js (nouveau), dist/game.js, dist/ai.js (cadence de patrouille uniquement), dist/index.html, dist/mobile.css, dist/session.js (version du script).
Validation : expedition-tests.cjs, expedition-ui-tests.cjs, hub-activity-tests.cjs, ce rapport et docs/expeditions/*.png.

Aucune modification de core.js, movement.js, combat.js, events.js, recurring.js, des monnaies, du schéma de sauvegarde, du Hub ou de CJEngine. Aucune récompense monétaire directe ajoutée.

## Captures
- [Pluie](docs/expeditions/rain-360.png)
- [Brume](docs/expeditions/mist-360.png)
- [Gardiens](docs/expeditions/guardians-360.png)
- [Courant](docs/expeditions/current-360.png)
- [Noël en paysage](docs/expeditions/christmas-mist-800.png)

Les captures utilisent des situations préparées pour rendre visibles les effets. L'agrément et la fluidité sur téléphone physique restent à valider par CJ. Les poids et bonus sont volontairement modérés et centralisés pour un rééquilibrage ultérieur.
