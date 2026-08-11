# cotation-kine

App d'aide à la cotation NGAP pour les masseurs-kinésithérapeutes libéraux.

## Objectif

Un kiné reçoit une ordonnance rédigée en langage libre par un médecin. Il doit en déduire la
cotation NGAP exacte de ses séances (lettre-clé + coefficient), ce qui détermine le tarif et le
remboursement. L'app fait ce travail à sa place, puis **montre son raisonnement** sous forme de fil
d'Ariane cliquable pour qu'il puisse corriger n'importe quelle étape.

Phase 1 : saisie du texte de l'ordonnance.
Phase 2 : photo / document en entrée, OCR par IA.

## Principe d'architecture non négociable

Le LLM **n'invente jamais la cotation**. Il extrait des attributs du texte, qui alimentent un
**arbre de décision déterministe et versionné**. C'est l'arbre qui produit l'acte. Conséquences :
résultat traçable, corrigeable au clic, testable par jeu de cas.

## État actuel

Phase de spécification. Rien de codé.

- `docs/SPEC-NGAP.md` — la spécification réglementaire complète, à lire en premier
- `data/actes-ngap.json` — catalogue des 94 actes du titre XIV (lettre-clé, coefficient, référentiel, éligibilité IFS)
- `data/arbre-decision.json` — 138 nœuds, 90 feuilles ; graphe questions → acte
- `data/sources/NGAP-21062026.pdf` — source normative officielle, + son extraction texte du titre XIV

## Contexte réglementaire à ne pas perdre de vue

- Source de vérité : NGAP titre XIV, version du **21/06/2026**. Elle bouge souvent (3 versions
  entre janvier et juin 2026) — toute mise à jour repart du PDF ameli, jamais d'un blog.
- Le « coefficient » (8,09 / 8,11 / 9,79…) est un **identifiant d'acte** autant qu'une base
  tarifaire. Ne jamais l'arrondir ni le normaliser.
- Tarif = coefficient × valeur de la lettre-clé (2,21 € métropole / 2,43 € outre-mer).
- Une seule cotation par séance. Le BDK et les suppléments (kinébalnéo, bandage) se cumulent en
  dehors de l'arbre.
- La responsabilité de la cotation reste celle du praticien : l'UI doit le dire.

## Validation

Script de cohérence des données (références croisées, nœuds orphelins, actes inatteignables) :
les 4 actes non atteignables attendus sont les suppléments, volontairement hors arbre.
