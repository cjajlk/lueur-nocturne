# V0.7 — Gardiens et collisions

## Diagnostic et règles
Deux interdictions explicites causaient le problème : combat.weaker excluait sentinel, et la collision joueur classait tout sentinel comme danger. L'IA traitait aussi tous les gardiens comme menaces. Aucune dépendance des sanctuaires ne rendait les gardiens immortels ; les sanctuaires ajoutent uniquement un wisp et un hunter.
La puissance utilisée par le moteur est mass, sa lumière actuelle, distincte du total récolté, des vies et du score. Joueur et bots absorbent désormais un gardien à mass >= 1,25 fois sa mass. Contact, boucliers et récompense existants conservés ; éclat orange de 28 particules ; réapparition gardien après 12 secondes, puis bouclier de 3 secondes. Autres créatures : délai de 4 secondes inchangé.

## Collisions
Fragments de rayon inférieur à 34 traversables, dessin conservé. Gros cristaux espacés de 416 unités entre leurs enveloppes et éloignés des limites ; les exemplaires incompatibles avec l'espacement sont retirés. Les points de progression restent dégagés. Glissement tangent aux surfaces, mouvement par sous-pas de 4 unités, résolution des recouvrements après croissance. Une recherche de position libre sert de secours à une croissance coincée. Même moteur pour joueur, bots et gardiens. L'IA maintient sa direction de sortie pendant 4 secondes sans réinitialisation intempestive.
Espacement validé jusqu'au rayon 200 (1600 de lumière). La croissance reste illimitée : on ne prétend pas garantir le passage de tailles arbitraires dans une arène finie.

## Vérifications
Suites : tests, combat, gameplay, rendering, display, ai, movement, blockage et guardian-collision.
Seuils joueur 450 / 499,99 / 500 / 550 contre gardien 400 ; bot 500 contre 400 ; réapparition et bouclier ; sanctuaires ; monnaie et sauvegarde ; commandes multitouch, rotation et pause simulées ; fragments, tangente oblique, contournement de groupes, bordures et grandes tailles.
Endurance simulée : 15 minutes. Expédition avec récolte contrôlée : environ 503,5 secondes (8 min 24). Le pilote de ce test utilise un corridor intérieur et évite les obstacles ; l'ancien aller-retour aveugle pouvait rester appuyé contre un cristal déplacé.
L'ancien test x < cristal a été remplacé par le contrôle de non-pénétration à chaque pas : un glissement peut légitimement contourner le cristal. Un échec de sortie de poche a été corrigé dans l'IA.
Performance logique sur ce PC : environ 650–685 ms pour 600 mises à jour à 24 bots, hors rendu. Tests mobiles via DOM/canvas simulés, pas de mesure FPS Android ni de test sur téléphone physique. Difficulté et sensation finale à confirmer par CJ.

## Périmètre
Aucune modification du core (monnaie, sauvegardes, personnages), du HUD, des flèches, du CSS ou de la vitesse commune 180. Modifications : dist/combat.js, dist/ai.js, dist/game.js, dist/movement.js, combat-tests.cjs, gameplay-tests.cjs, movement-tests.cjs, guardian-collision-tests.cjs, README.md et ce rapport.
