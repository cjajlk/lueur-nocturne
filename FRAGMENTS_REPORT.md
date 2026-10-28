# V0.9 — Lot 2 : Fragments de Noël

- Le Lot 1 `cf9004c` est conservé. Calendrier Paris annuel inchangé ; fragments disponibles dans les trois arènes pendant Noël uniquement.
- Une tentative d’apparition toutes les 45 secondes d’expédition active (première à 45 s), maximum deux fragments, durée 60 secondes. Pause : aucun avancement. Une tentative échoue sans rattrapage si le joueur reste au refuge ou si les 12 positions proches sont bloquées/dangereuses.
- Placement à un rayon du joueur + 85 unités, en priorité devant lui, hors refuge, cristaux solides, sanctuaires et proximité immédiate des ennemis. Aucun tirage aléatoire du moteur consommé. Les positions ne garantissent pas la sécurité après apparition.
- Maximum théorique : 10 occasions sur 8 minutes, 16 sur 12 minutes. Estimation de départ : 5 à 10 collectes si environ 50–65 % des occasions sont saisies. Il s’agit d’une hypothèse de rendement, pas d’une moyenne humaine mesurée. Les coûts des mascottes restant inconnus, le temps nécessaire pour les obtenir ne peut pas encore être garanti. Aucun achat ni mascotte ajouté.
- Petit cristal cyan de 24 pixels de hauteur apparente, sans nouvelle image, animation ou particules. Solde au refuge uniquement ; pas de nouveau bloc dans le HUD. Notification courte à la collecte.
- Sauvegarde : `lueur-nocturne-v1.events.christmas2026` avec `fragments`, `collected`, `issued`, `pendingIds`. Chaque apparition reçoit un numéro croissant. Seuls les numéros en attente peuvent être crédités ; collecte/expiration les retire. Cette liste est limitée à deux, sans historique croissant. Numéro et solde sont sauvegardés immédiatement. Après rechargement, les objets non ramassés ne sont pas restaurés, les numéros ne sont pas réutilisés. Nouvelle édition `christmas2027` indépendante ; les soldes anciens restent présents.
- L’ancienne sauvegarde reçoit `events: {}` lors de sa normalisation ; les fonctions existantes pour achats, personnages, records et Éclats restent inchangées. Les limites du stockage local demeurent celles du jeu : si le navigateur refuse l’écriture, l’avertissement existant indique une conservation limitée à la session.
- Début/fin d’événement pilotés par le gestionnaire existant. Chaque attribution et apparition vérifie à nouveau la date ; fin de Noël : aucun nouveau crédit, expédition conservée et solde acquis intact. Aucun usage du compteur de 600 secondes ni du Hub.

## Validation

- Tests de migration, série de collectes, même ID deux fois, persistance JSON/rechargement, retrait des IDs, deux éditions, indépendance du compteur de 600 secondes et des Éclats.
- Harnais de la vraie boucle : apparition, collecte, expiration, pause/reprise, passage novembre/décembre et décembre/janvier via horloge injectée ; expédition non interrompue.
- Navigateur simulé : PC 1920×1080 ; Android 360×800 et paysage 800×360. Solde visible, absence de débordement horizontal, collecte dans les trois arènes, pause réelle, rechargement, fin de Noël, pseudo universel et solde Hub intacts, aucune erreur JavaScript. Captures refuge/fragment PC et portrait inspectées ; validation physique Android à effectuer par CJ.
- Suites existantes : économie, combat, gameplay, rendu, affichage, mouvement, IA, déblocage, collisions gardiens, calendrier et interface saisonnière.
- Aucun changement de `combat.js`, `ai.js`, `movement.js`, `events.js`, `arenas.js`, `display.js` ou du Hub. Formule 22 %, plafond 12 et atténuation au-dessus de 160 conservée.

Commandes : `node fragments-tests.cjs`, `node fragments-ui-tests.cjs` (Playwright déjà disponible via NODE_PATH ; Edge installé). Aucune nouvelle bibliothèque installée.
