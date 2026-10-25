# Lueur Nocturne — V0.7

Jeu solo web, sans dépendance à installer. Ouvrir `LANCER.bat` ou `dist/index.html`. Pour un serveur local : `node server.cjs`, puis http://localhost:4173.

## Expédition

- Récolter les lueurs et absorber les créatures suffisamment faibles. La surface du personnage suit sa lumière ; les pouvoirs, captures et offrandes peuvent donc le faire rétrécir.
- Trois étapes, chacune avec trois repères à visiter et du déplacement actif hors du refuge : 2 min, 2 min 40, puis 3 min 20. Immobile, en pause ou dans le refuge, cette exploration n’avance pas.
- Une fois l’étape prête, choisir un sanctuaire encore éteint et rester quatre secondes dans son cercle. Offrandes : 80, 160, puis 240 lumières, avec 10 de réserve.
- Aube renforce l’attraction ; Éveil réduit de 20 % le délai du pouvoir ; Horizon restaure une vie, dans la limite de trois.
- Les trois sanctuaires n’arrêtent plus la partie. Continuer à survivre et grandir, puis choisir **Pause → Terminer et voir le bilan**. Trois sanctuaires terminés et une sortie volontaire donnent une victoire ; partir avant est une retraite. Perdre les trois vies termine la partie.
- Le bilan indique temps de survie, lueurs récoltées, créatures absorbées, sanctuaires, pic de lumière et records locaux.
- Objectif de rythme : environ 8–12 minutes pour les trois étapes. Minimum structurel : huit minutes d’exploration et douze secondes d’offrandes ; les trajets, captures et pauses peuvent allonger la durée. Ce réglage reste à apprécier en parties humaines.

## Créatures et commandes

Les bots mangent les mêmes lueurs et peuvent se poursuivre, fuir et s’absorber. Une proie doit avoir au plus 90 % de la lumière de son prédateur. Les gardiens sont absorbables à partir de 125 % de leur lumière actuelle (500 contre 400), par le joueur comme par les bots ; leur hexagone orange les distingue. Deux gardiens au départ, sans ajout de gardiens aux sanctuaires.

Une absorption fait disparaître la proie. Sa réapparition est différée de quatre secondes (douze pour les gardiens) et cherche une zone dégagée. Le bouclier cyan dure trois secondes : aucun bot protégé ne peut absorber ou être absorbé. Une tentative d’attaque retire cette protection ; les bots protégés choisissent normalement de récolter ou fuir. Les gardiens respectent aussi les boucliers. Une seconde entre deux absorptions et un gain plafonné à 12 par proie limitent les réactions en chaîne.

PC : souris, ZQSD/WASD/flèches, Espace pour le pouvoir, Échap pour la pause. Mobile : joystick et bouton du pouvoir. Pause automatique quand la fenêtre perd le focus. Les quatre pouvoirs, vitesses et conditions de déblocage sont conservés.

Les petits fragments sont traversables. Les gros cristaux solides sont espacés et éloignés des bordures ; le déplacement glisse le long des surfaces.

## Éclats nocturnes et sauvegarde

La monnaie du jeu est l’**Éclat nocturne**, totalement indépendante du Hub. Un Éclat toutes les dix minutes de déplacement actif ; pause et immobilité ne rapportent rien. Les bots ne génèrent aucune monnaie pour le joueur. Prix des traînées et seuils de déblocage inchangés. Aucun paiement réel ni conversion avec les CJ universels.

La sauvegarde utilise toujours `lueur-nocturne-v1`. Le champ historique `cj` est migré vers `shards` et conservé en miroir pour la compatibilité ; il n’a jamais été connecté au Hub. Soldes, achats, créatures, défis et temps actif sont préservés. Aucun effacement de sauvegarde n’est nécessaire. Le défi de victoire rapide passe de quatre à douze minutes afin de rester réalisable ; son accomplissement historique est conservé.

## Tests

Exécuter `node tests.cjs`, `node combat-tests.cjs`, `node gameplay-tests.cjs`, `node rendering-tests.cjs` et `node display-tests.cjs`.

Les simulations testent aussi une population sur quinze minutes et une expédition entière avec récolte contrôlée. Elles ne remplacent pas des parties humaines ni la validation finale Android physique par CJ. Voir `V04_REPORT.md` pour les résultats et limites.

## IA V0.6

Trois comportements : prudent, équilibré et chasseur. Les gardiens patrouillent, évitent localement les cristaux et les autres gardiens et abandonnent les cibles hors de portée. La progression étend la recherche des chasseurs et conserve les renforts de deux créatures par sanctuaire, sans bonus automatique de vitesse ou de lumière. La vitesse normale commune est de 180 unités/s, indépendamment du personnage et de la masse. Les cristaux sont désormais solides : une collision commune tient compte du rayon réel de chaque créature.

Tests supplémentaires : `node ai-tests.cjs`. Détails et limites : [rapport V0.6](V06_REPORT.md).

Correctif vitesses : `node movement-tests.cjs`. [Audit et validations](SPEED_REPORT.md).
