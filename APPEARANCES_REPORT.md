# V1.0 Lot 3 — Apparences

## Réalisation
- Nouvelle entrée Apparences au refuge ; cinq catégories, dont quatre vides avec message discret.
- Les quatre traînées existantes sont affichées uniquement si possédées ; compatibilité avec l'esprit sélectionné et état équipé visibles.
- Équipement gratuit, retrait et remise à zéro des cinq emplacements du personnage sélectionné. Les autres personnages restent intacts.
- Aperçu canvas existant réutilisé, complété par un échantillon de la traînée sélectionnée ; taille adaptée au paysage mobile. Fenêtre défilable avec fermeture accessible.
- Aucun nouvel objet, prix ou effet de traînée. L'interface Boutique conserve son catalogue et sa présentation ; son branchement d'équipement a seulement été raccordé aux choix par personnage.

## Sauvegarde
- Clé lueur-nocturne-v1 conservée. cosmetics.version passe de 1 à 2 afin de distinguer l'import unique de skin et un retrait volontaire.
- Sans ancienne structure cosmetics : import de owned/skin pour les six esprits. Depuis cosmetics v1 : conservation des équipements et reprise de la traînée actuellement visible pour l'esprit sélectionné.
- Ensuite cosmetics.equipped fait autorité ; skin reste un miroir compatible avec le rendu existant. Une traînée retirée reste null après rechargement ; les effets naturels utilisent leur couleur de base.
- Modification sur copie, écriture via le verrou du Lot 2, adoption du profil uniquement après succès. En cas d'échec, l'ancien équipement demeure affiché et ne sera pas remplacé lors d'une sauvegarde suivante.
- Éclats, reliquat de temps, achats, défis et marqueurs de récompenses, statistiques, personnages, fragments/mascottes de Noël et données Hub préservés.

## Vérifications
- Tests purs : objets possédés/verrouillés/inconnus, retrait, réinitialisation, indépendance des six personnages, migrations anciennes/v1 et dix rechargements idempotents, raccordement boutique, données protégées.
- Navigateur Edge : PC 1920×1080, Android simulé 360×800 et 800×360 ; quatre objets, catégories vides, aperçu, défilement et boutons, indépendance Nyx/Niva, rechargement, quota refusé sans changement adopté, second onglet bloqué, défis permanents/renouvelables et données Noël/Hub/pseudo conservés. Aucune erreur console.
- Régressions exécutées : tests.cjs, save-v2-tests.cjs, recurring-tests.cjs, fragments-tests.cjs, mascots-tests.cjs, gameplay-tests.cjs (graine 42), save-v2-ui-tests.cjs, mascots-ui-tests.cjs et recurring-ui-tests.cjs.
- Test ajouté au moteur réel : équiper/retirer/rééquiper ne change que les particules de traînée ; mouvement, puissance, temps actif et nombre de tirages aléatoires identiques.
- L'ancien test de sélection globale a été adapté au nouveau comportement attendu : changer d'esprit conserve désormais sa propre traînée.

## Fichiers
- dist/core.js : migration cosmétique ciblée et opérations d'équipement/sélection.
- dist/game.js : fenêtre, aperçu, enregistrement sûr et raccordement du rendu.
- dist/index.html, dist/mobile.css : entrée refuge, styles et versions de cache.
- dist/session.js : version du script chargé uniquement ; verrou inchangé.
- appearances-tests.cjs, appearances-ui-tests.cjs : nouveaux tests.
- tests.cjs, gameplay-tests.cjs : adaptation de la sélection et contrôle du retrait visuel.

## Limites
- Les quatre traînées sont compatibles avec les six personnages ; aucune restriction fictive ni cosmétique des futures catégories n'est ajouté.
- Retirer une traînée retire les particules de déplacement, pas les éléments dessinés dans l'illustration du personnage ni ses effets naturels.
- Protection multi-onglets du Lot 2 inchangée ; fermer les anciennes versions ouvertes après mise à jour.
- Test final sur téléphone physique à réaliser par CJ.
