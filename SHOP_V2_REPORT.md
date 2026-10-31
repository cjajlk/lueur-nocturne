# V1.0 Lot 4 — Boutique V2

## Catalogue et interface
Six objets ajoutés, exclusivement en Éclats nocturnes : Lucioles 4, Comète 6, Halo lunaire 6, Cercle astral 8, Étincelles boréales 6, Convergence stellaire 8.
Les quatre traînées historiques restent disponibles aux prix 0/2/3/3. Boucliers et apparences rares sont vides. Aucun nouvel objet hors périmètre.
Boutique et Apparences utilisent le même catalogue et les cinq catégories. Les objets achetés sont disponibles dans Apparences, sans équipement automatique lors de l'achat. L'ancien raccourci gratuit d'équipement des quatre traînées historiques est conservé.
Prévisualisation sur canvas, démonstration limitée à 2,4 secondes, sans changement de profil ni écriture. Aperçu combiné dans Apparences.

## Achats et sauvegarde
Clé lueur-nocturne-v1, version de cosmetics et migrations existantes inchangées. Nouveaux identifiants dans cosmetics.owned et équipements par personnage. Le champ skin reste un miroir des anciennes couleurs pour compatibilité ; les nouvelles traînées sont lues dans cosmetics.
Achat sur copie puis commitTransaction() avec identifiant unique cosmetic:<objet>, débit et acquisition dans la même écriture. Le profil n'est adopté qu'après succès. Solde insuffisant, doublons et erreur d'enregistrement refusés sans débit adopté.
Protection d'écriture du Lot 2 conservée. Aucun accès nouveau au Hub ni à CJEngine.

## Rendu et limites
Traînées : mêmes particules de déplacement, palettes alternées vert/or et bleu/cyan ; quelques petites croix stellaires pour Comète. Aucun tirage aléatoire supplémentaire.
Auras : anneau fin translucide, argenté ou violet ; quatre petits symboles pour Cercle astral. Pas de remplissage opaque, rayon limité autour du personnage ; contours de protection et indicateurs existants conservés.
Absorptions : réutilisation des emplacements existants, cinq particules par impulsion, durée inchangée de 0,42 seconde. Maximum huit impulsions et 24 collectes simultanées ; aucune modification des effets des bots. Particules générales plafonnées à 250.
Aucun effet sur puissance, croissance, collisions, mouvement, IA, pouvoirs ou récompenses.

## Tests exécutés et réussis
- shop-v2-tests.cjs : six objets/prix exacts, anciens prix, fonds insuffisants, doublons, quota, transactions, combinaison triple, choix par personnage, dix rechargements, données protégées ; récompense journalière unique et gain de 600 secondes conservant les nouveaux équipements.
- shop-v2-ui-tests.cjs : achats des six objets et prévisualisation sans écriture, échec de stockage, doublons, combinaison/rechargement, indépendance Niva, catégories vides, verrou second onglet, profils Noël/Hub/défis conservés. PC 1920×1080, Android simulé 360×800 et 800×360 ; aucune erreur console.
- Stress navigateur : 100 demandes d'absorption restent limitées à huit impulsions ; 120 appels de rendu coûtent environ 56 ms PC, 45 ms portrait simulé, 53 ms paysage simulé sur cette machine. Mesure de coût des appels canvas, pas une garantie de cadence GPU ou de performance sur téléphone physique.
- Régressions : tests.cjs, save-v2-tests.cjs, appearances-tests.cjs, recurring-tests.cjs, fragments-tests.cjs, mascots-tests.cjs, gameplay-tests.cjs (graine 42), save-v2-ui-tests.cjs, appearances-ui-tests.cjs, mascots-ui-tests.cjs.
- Contrôle ajouté dans le moteur réel : combinaison triple sans différence de mouvement, puissance, temps actif et tirages aléatoires ; rendu sans mutation du joueur/profil ; durée et réserve d'effets inchangées.

## Fichiers
- dist/core.js : catalogue, propriété/équipement et préparation des achats.
- dist/game.js : interface, transaction, démonstration et effets canvas.
- dist/index.html, dist/session.js : versions de cache.
- dist/mobile.css : aperçu et espacement des boutons.
- shop-v2-tests.cjs, shop-v2-ui-tests.cjs, gameplay-tests.cjs : contrôles.

Validation définitive sur téléphone Android réel à effectuer par CJ. Fermer les anciennes sessions après mise à jour ; limites de stockage local et de Web Locks identiques au Lot 2.
