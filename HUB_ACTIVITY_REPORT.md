# Intégration du temps actif au Hub V2 — 4 novembre 2026

## Cause et correction
Lueur chargeait cjAccount en lecture seule, sans CJEngine, sans getGameState et sans tick. Mes aventures lisait indépendamment les statistiques locales : sa présence ne signifiait pas que le temps universel était transmis.

- dist/index.html : activation du mode universel officiel et chargement différé de CJEngine depuis le Hub, après cjAccount.
- dist/game.js : getGameState indique uniquement une expédition non pausée avec déplacement réel commandé (>0,2 unité, critère existant des Éclats), sur une image récente et après initialisation du compte. Chaque image appelle CJEngine.tick avec le delta réel non plafonné et l'identifiant lueur. Une image immobile libère le suivi. Le moteur rejette les longues interruptions et vérifie lui-même visibilité et focus.
- dist/session.js : mise à jour de la version du script pour invalider le cache.
- hub-activity-tests.cjs : tests reproductibles du raccordement et du retour au Hub, plus entrées souris/tactiles réelles en navigateur simulé.

Aucune modification du dépôt Hub, du moteur CJ, des monnaies locales, du calcul creditTime, des achats ou de la simulation. Les fichiers CJEngine/cjAccount publiés ont été comparés à la copie locale : identiques.

## Persistance et concurrence
Le moteur officiel conserve cjMs et timeMs dans cjPlayerData.cjActivityV1.games.lueur. Il enregistre le solde, les secondes et leurs fractions dans la même écriture. Règle inchangée : 600000 ms admissibles = 1 CJ. Aucun crédit historique construit à partir de activeSeconds, bestSurvival ou des expéditions précédentes.

Le verrou cjajlk-v2-account-write protège le compteur universel contre les autres jeux et les transactions du Hub. Le verrou lueur-nocturne-save-writer existant bloque une deuxième session Lueur. L'initialisation du compte doit être terminée avant toute acquisition par le moteur. Le reliquat reste géré exclusivement par CJEngine ; aucune file locale de temps à rejouer.

## Validation
- hub-activity-tests : 1920×1080, 360×800, 800×360 ; refuge et immobilité exclus ; pause/reprise ; masquage et perte de focus ; long delta de retour rejeté ; 599 s + rechargement + 1 s = exactement 600 s et 1 CJ ; pas de double attribution ; échec d'écriture sans crédit ; deuxième Lueur bloquée ; moteur concurrent bloqué puis transfert du verrou ; retour au véritable écran Profil du Hub avec carte Lueur et solde corrects ; équipements conservés.
- Deux contrôles avec code du jeu non instrumenté et horloge réelle : déplacement souris PC et joystick via événements tactiles Android simulé, temps effectivement enregistré et arrêt à la pause ; aucune erreur JavaScript.
- gameplay-tests (graine 42), save-v2-tests, recurring-tests, shop-v2-tests, rare-tests, fragments-tests, mascots-tests, events-tests : réussis. Le test de gameplay vérifie notamment le compteur local, les pouvoirs, les collisions, les commandes mobiles et l'expédition complète.
- Hub v2/tests/game-activity.cjs : réussi, dix jeux, statistiques locales/globales, sauvegardes, synchronisation et affichage responsive conservés.

## Limites
Le partage fonctionne sur la même origine : les deux sites GitHub Pages sous https://cjajlk.github.io partagent leur stockage. Un jeu lancé sur localhost, un autre navigateur ou un autre appareil ne partage pas ce compte local. Aucun transfert entre appareils n'est ajouté. Sans chargement du moteur/compte, le jeu continue, mais aucun temps CJ ne peut être enregistré ni réattribué rétroactivement. Les garanties restent celles du moteur Hub (Web Locks et stockage local).

Android a été simulé dans Edge/Chromium ; le test physique final appartient à CJ. Aucun changement de mise en page.
