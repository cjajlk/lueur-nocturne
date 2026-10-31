# V1.0 Lot 5 — Boucliers décoratifs et apparences rares

## Préalable confirmé
Le commit 35cce52 des traînées était déjà publié : GitHub Pages run 41213276065 réussi, fichier game.js public identique au fichier local. Aucune reprise du travail sur les traînées.

## Six objets
| Objet | Prix en Éclats | Compatibilité |
|---|---:|---|
| Cristal nocturne | 4 | Tous les esprits |
| Rosace céleste | 6 | Tous les esprits |
| Nyx nacrée | 12 | Nyx uniquement |
| Mira boréale | 16 | Mira uniquement |
| Orion améthyste | 16 | Orion uniquement |
| Umbra solaire | 20 | Umbra uniquement |

Les boucliers sont des ornements ouverts, placés de part et d'autre sous le personnage : facettes bleu glacier ou rosaces or/violet animées. Aucun cercle fermé imitant une invulnérabilité. Les descriptions et Apparences précisent qu'ils ne protègent pas.

Quatre illustrations dédiées conservent les identités et silhouettes : nacre et filigranes lunaires, ailes d'aurore, cristaux améthyste et étoiles, volutes solaires de cuivre/or. Légers scintillements canvas ; le même sprite est utilisé en prévisualisation, au refuge, dans Créatures et en expédition. Aucun remplacement des originaux ni de Niva/Solstice.

## Création des illustrations
Compétence imagegen, outil intégré, une génération par variante à partir de dist/assets/creatures.png. Prompts exacts : RARE_ART_PROMPTS.md.
Sources PNG conservées : dist/assets/rare/source/{nyx,mira,orion,umbra}.png.
Fichiers utilisés en jeu : dist/assets/rare/{nyx,mira,orion,umbra}.webp, 512×512 avec transparence, 290 894 octets au total. Les PNG sources ne sont pas chargés par le jeu. Aucun filtre de recoloration appliqué à chaque image.

## Boutique, équipements et sécurité
Catalogue commun et transactions existants réutilisés. Achat unique, écriture atomique, pas de débit adopté si l'enregistrement échoue. Équipement gratuit, retrait, cinq emplacements et mémorisation par personnage. Les objets incompatibles possédés restent visibles mais non équipables ; prévisualiser une apparence montre son personnage sans changer la sélection réelle.
Acheter une apparence ne déverrouille pas son personnage. Les apparences des quatre esprits ne sont pas équipables sur Niva/Solstice. Clé de sauvegarde, migrations, prix antérieurs, monnaies, délais de gain, récompenses, Hub et pseudo inchangés. Verrou multi-onglets du Lot 2 conservé.

## Tests réussis
- rare-tests.cjs : six prix, solde insuffisant, doubles achats, échec de stockage, restrictions, absence de déblocage du personnage de base, cinq emplacements, retrait, dix rechargements, conservation de Noël.
- rare-ui-tests.cjs : images chargées, six prévisualisations sans écriture et achats, échec de stockage, équipements combinés/rechargement, refus sur Niva, second onglet bloqué, données protégées et console sans erreur. PC 1920×1080, Android simulé 360×800 et 800×360.
- gameplay-tests.cjs (graine 42) : protections et mécanique existantes. Test ciblé : une collision dangereuse coûte bien une vie sans pouvoir, avec aucun décor, Cristal nocturne ou Rosace céleste ; le pouvoir réel d'Orion protège dans les trois cas.
- Régressions : save-v2-tests.cjs, appearances-tests.cjs, shop-v2-tests.cjs ; shop-v2-ui-tests.cjs, appearances-ui-tests.cjs, mascots-ui-tests.cjs, save-v2-ui-tests.cjs ; recurring-tests.cjs, events-tests.cjs, fragments-tests.cjs, mascots-tests.cjs.
- Stress : cinq emplacements actifs et huit impulsions d'absorption ; environ 51–65 ms pour 120 appels de rendu sur le PC de test. Réserve d'absorption toujours bornée à huit, profil/joueur non modifiés par le rendu. Ce coût CPU d'appels canvas ne garantit pas la cadence GPU ni les performances d'un téléphone physique.

## Captures
- docs/lot5-before-after.png : quatre comparatifs original/rare et les deux boucliers.
- docs/lot5-android.png : cinq catégories combinées, personnage sans invulnérabilité réelle et ennemi dangereux, en portrait simulé.

## Fichiers concernés
- dist/core.js : six entrées de catalogue et restrictions par personnage.
- dist/game.js : ornements, chargement/rendu des sprites, prévisualisation et compatibilité affichée.
- dist/index.html, dist/session.js : versions de cache.
- dist/mobile.css : aperçu des cartes.
- dist/assets/rare/ : quatre WebP et leurs quatre sources PNG.
- rare-tests.cjs, rare-ui-tests.cjs, gameplay-tests.cjs : tests ajoutés.
- shop-v2-tests.cjs, shop-v2-ui-tests.cjs : taille du catalogue et catégories désormais remplies.
- RARE_ART_PROMPTS.md, ce rapport et les deux captures.

## Limites
Les petits motifs fins sont surtout visibles en aperçu et lorsque le personnage grandit ; les palettes et silhouettes restent distinctes à petite taille. Validation finale du rendu et de la fluidité sur téléphone Android réel par CJ. En cas d'image indisponible, le personnage original reste dessiné ; aucun impact sur le jeu ou les possessions.
