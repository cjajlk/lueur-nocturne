# Lueur Nocturne — version locale 0.3

Jeu solo web, sans installation de dépendances. Ouvrir `LANCER.bat` ou `dist/index.html` pour jouer sur ce PC.

## Serveur local (pour tester les autres appareils)

Avec Node.js : `node server.cjs`, puis ouvrir http://localhost:4173. Pour téléphone/tablette sur le même Wi-Fi : utiliser l’adresse IP locale du PC avec le port 4173. Le pare-feu Windows peut demander d’autoriser le réseau privé. Ne pas exposer ce serveur sur Internet.

## Partie

- Six minutes, trois étincelles de vie. Récolter des lueurs et absorber les petites ombres.
- Les trois offrandes coûtent 80, 160 et 240 lumières, dans l’ordre choisi. Conserver 10 lumières en réserve et rester quatre secondes dans le cercle.
- Aube augmente le rayon de récolte ; Éveil réduit de 20 % le délai de recharge du pouvoir ; Horizon rend une vie, dans la limite de trois.
- Rejoindre ensuite le portail au centre, avec au maximum 60 secondes pour la course finale (sans augmenter le temps restant). Le centre est un refuge qui protège des captures.
- Les petites ombres se laissent absorber ; les chasseurs annoncent leur charge par un trait rose ; les gardiens sont toujours dangereux. Les ennemis cherchent et consomment les mêmes lueurs que le joueur : leur masse augmente de 2 par lueur, avec un halo au moment de la récolte. Ils ne grossissent pas sans nourriture. La lumière du joueur progresse moins vite au-delà de 160 et ne dépasse pas 400, ce qui permet l’offrande finale de 240 et la réserve de 10.
- Souris ou ZQSD / WASD / flèches, Espace pour le pouvoir, Échap pour la pause. Joystick et bouton tactile sur les écrans tactiles.
- Pause automatique si l’onglet devient invisible ou si la fenêtre perd le focus.

## Progression

Nyx disponible ; Mira après 12 sanctuaires ; Orion après 3 victoires ; Umbra après une victoire sans capture. Dix défis permanents. Quatre traînées, dont une gratuite. Un CJ toutes les dix minutes de déplacement actif, sans gain en pause ou immobile. Sauvegarde locale au navigateur, pas de compte, pas de paiement, pas de synchronisation avec les CJ universels. Le prototype n’implémente pas de protection anti-triche serveur.

Les quatre créatures illustrées sont tirées d’un atlas transparent généré avec l’outil image intégré à partir de la planche approuvée. Elles sont utilisées dans l’accueil, les portraits et l’arène. Une animation légère et les traînées leur donnent du mouvement. Des silhouettes procédurales servent de repli pendant le chargement. L’arène est dessinée en temps réel et reste volontairement plus sobre que la peinture conceptuelle.

Le jeu utilise les polices Google quand elles sont accessibles, avec des polices de repli hors connexion. Le reste fonctionne sans réseau.

## Vérification

`node --check dist/game.js`, `node tests.cjs` et `node gameplay-tests.cjs`.

Les tests automatisés vérifient les seuils de monnaie, les achats, les déblocages, la restauration de sauvegarde et le déroulement d’une expédition (offrandes, victoire, défaite, refuge, pouvoirs). Les vérifications dans le navigateur couvrent l’accueil, la partie, les fenêtres et les dimensions PC, téléphone et tablette. Elles ne remplacent pas un essai tactile sur appareil physique.

La difficulté, les durées et les prix sont des premiers réglages de prototype à ajuster après des parties humaines sur les appareils ciblés.
