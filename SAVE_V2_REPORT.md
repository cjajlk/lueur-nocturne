# V1.0 Lot 1 — Sauvegarde V2

Clé conservée : `lueur-nocturne-v1`. Aucun nouveau défi, objet, écran, prix ou gain. `creditTime()`, les monnaies, le Hub et les mécaniques ne changent pas.

## Structures additives

- `cosmetics.version: 1` : version de migration indépendante de la clé historique ; `owned` contient les identifiants `trail:aurore`, `trail:or`, `trail:rose`, `trail:givre` possédés ; `equipped` contient six personnages et cinq emplacements (`trail`, `aura`, `absorption`, `shield`, `appearance`) ; `transactionIds` prépare les marqueurs des futurs achats.
- `recurringChallenges.version: 1` : `periods.daily/weekly/monthly`, initialement null. Chaque période future pourra conserver son `id`, ses objectifs (`id`, `metric`, `target`, `progress`). `rewardIds` conserve les identifiants déjà attribués. Aucun calendrier ou attribution n’est activé.
- Migration : union des anciens achats avec les identifiants cosmétiques déjà conservés. Première migration : ancienne traînée équipée copiée sur les six personnages. Les champs historiques `owned` et `skin` sont conservés ; tant que l’interface actuelle les utilise, ils restent prioritaires pour la traînée du personnage sélectionné. Les autres emplacements et les équipements des autres personnages sont préservés. Cette priorité devra être inversée explicitement lors du lot Apparences, pas maintenant.
- `fresh()` et `normalize()` évoluent ensemble. Les statistiques, événements, fragments, transactions de Noël et déblocages gardent leur traitement existant. Les six personnages restent sélectionnables selon leurs conditions actuelles.

## Écriture et transactions futures

`serializeProfile()` ajoute les structures préparées en conservant le miroir historique local `cj: shards` (sans lien avec les CJ du Hub). Le jeu et l’achat saisonnier utilisent ce sérialiseur ; la copie cosmétique en mémoire est synchronisée après sauvegarde réussie.

`commitTransaction()` est une infrastructure non appelée par le jeu dans ce lot. Un appel futur devra fournir un profil, une copie modifiée, un identifiant, un type achat/récompense, un delta de solde et le contenu brut attendu du stockage. Le helper vérifie le delta et le solde, refuse les doublons en mémoire et dans le stockage, puis écrit marqueur et profil dans un unique `setItem`. Le profil courant n’est pas modifié ; le profil retourné ne doit être adopté qu’en cas de réussite. Échec d’écriture : aucune nouvelle acquisition confirmée. Seuls les tests utilisent des transactions synthétiques.

## Plusieurs onglets : limite identifiée

Le contenu attendu doit être capturé au chargement, jamais relu pour justifier un ancien profil. Une différence détectée refuse la transaction. `localStorage` n’offre toutefois pas de comparaison-écriture atomique entre onglets : deux écritures simultanées et les sauvegardes automatiques historiques peuvent encore se remplacer. Aucune garantie de synchronisation multi-onglets n’est annoncée. Avant de brancher les futurs crédits/débits, prévoir une coordination des écrivains (verrou partagé et détection de modification externe, ou refus explicite d’une deuxième session active). Pas de refonte générale engagée ici ; aucun nouveau crédit actif exposé à ce risque.

## Tests

- `save-v2-tests.cjs` : nouvelle sauvegarde, ancienne complète, dix normalisations/rechargements identiques, quatre traînées, cinq emplacements/six personnages, solde et 599,75 secondes préservés, records, Noël, Niva/Solstice, données futures de période/équipement ; transaction synthétique cohérente, doublon après rechargement, quota refusé, conflit détecté, solde négatif refusé.
- `save-v2-ui-tests.cjs` : vraie sauvegarde ancienne injectée, sauvegarde par la boutique historique, trois rechargements en navigateur sur PC 1920×1080 et Android simulé 360×800, conservation de chaque champ ancien, pseudo et données Hub inchangés.
- Suites existantes économie, mascottes, fragments, gameplay graine 42, combat, mouvement et calendrier réussies. Scénarios navigateur mascottes/fragments sur PC, Android portrait et paysage réussis ; trois arènes, retour refuge, rechargement, dates simulées, aucune erreur JavaScript.
- Aucun changement HTML visuel : seules les versions des scripts chargés changent. Validation physique Android non revendiquée.

Fichiers : `dist/core.js`, `dist/game.js`, `dist/index.html`, deux suites `save-v2-*.cjs`, ce rapport.
