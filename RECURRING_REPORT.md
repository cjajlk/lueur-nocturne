# Défis renouvelables — V1.0 Lot 2

## Implémentation
- Journaliers : 300 lueurs, 3 absorptions, 1 sanctuaire ; série = 1 Éclat.
- Hebdomadaires : 3 000 / 20 / 6 ; série = 2 Éclats.
- Mensuels : 12 000 / 80 / 20 ; série = 4 Éclats.
- Actions du joueur uniquement, sans reprise des statistiques historiques. Une action contribue aux trois périodes.
- Calendrier Europe/Paris, contrôle au lancement, reprise, chaque action et toutes les 30 secondes. Les changements de période ne terminent pas l'expédition. Une période déjà vue ne recule pas si l'horloge recule.
- Rubrique Défis : quatre catégories, progression, récompense de série, temps restant et état attribué. Dix défis permanents inchangés. Défilement interne et fermeture accessible.

## Sauvegarde et sécurité
- Clé et migration V2 inchangées ; réutilisation de recurringChallenges et commitTransaction().
- Verrou Web Locks exclusif conservé pendant toute la page, y compris pause/arrière-plan. Le second onglet ne charge pas le jeu. Fermer le premier puis réessayer libère l'accès.
- Sans Web Locks ou lecture du stockage impossible : démarrage refusé, aucune écriture.
- Tous les chemins d'écriture du jeu passent par le même contrôle du dernier instantané. Un changement externe provoque un rechargement sans écrire le profil obsolète.
- Solde et marqueur de récompense dans une seule écriture ; adoption du nouveau profil uniquement après succès. Échec : aucun Éclat ni marqueur accepté, nouvelle tentative ultérieure. Une série terminée en attente d'écriture est conservée avant tout renouvellement.
- Sauvegarde périodique existante conservée ; ajout lors du masquage/fermeture de page. Un arrêt brutal du navigateur peut perdre les dernières actions non encore enregistrées, comme toute sauvegarde locale périodique.
- La protection concerne les pages de cette version partageant la même origine. Elle ne sécurise pas une modification manuelle du stockage, une ancienne version déjà ouverte ou une restauration de sauvegarde. Pas de synchronisation serveur ; l'horloge reste celle de l'appareil. Fermer les anciennes sessions après mise à jour.

## Vérifications
- Tests purs : progression, trois récompenses 1/2/4, absence de double crédit, rechargement, minuit, lundi, mois/année, jours de 23/25 heures et recul d'horloge.
- Navigateur Edge : 1920×1080, 360×800 et 800×360 ; catégories, défilement, rechargement, quota en échec puis réussite, concurrence et libération du verrou, absence de Web Locks, changement automatique de période, pause/reprise et actions réelles du moteur.
- Régressions : économie/migrations, gameplay graine 42, combat, rendu, affichage, mouvement, IA, blocages, collisions gardiens, calendrier, fragments, mascottes et sauvegarde V2 ; tests navigateur existants sauvegarde V2/fragments/mascottes.
- Hub, pseudo, Noël, prix, gain par 600 secondes, gameplay et pouvoirs préservés. Aucun nouveau cosmétique.
- Validation sur téléphone physique à effectuer par CJ.

## Fichiers
- dist/recurring.js : calendrier, objectifs et progression.
- dist/session.js : verrou et démarrage protégé.
- dist/game.js : branchement des actions, crédits atomiques et interface.
- dist/index.html, dist/mobile.css : chargement et catégories responsive.
- recurring-tests.cjs, recurring-ui-tests.cjs : nouveaux tests.
- save-v2-ui-tests.cjs : périodes désormais initialisées au lancement.
