# Captain AMK

App d'aide à la cotation NGAP pour les masseurs-kinésithérapeutes libéraux, open source.

- Repo : https://github.com/vincent-bidaux/captain-amk (public)
- Live : https://captain-amk.netlify.app

## Objectif

Un kiné reçoit une ordonnance rédigée en langage libre par un médecin. Il doit en déduire la
cotation NGAP exacte de ses séances (lettre-clé + coefficient), ce qui détermine le tarif et le
remboursement. L'app fait ce travail à sa place, puis **montre son raisonnement** sous forme de fil
d'Ariane vertical, cliquable à n'importe quelle étape pour corriger et repartir en manuel.

Phase 1 : saisie du texte de l'ordonnance.
Phase 2 : photo / PDF en entrée, transcription par IA (vision).

## Principe d'architecture non négociable

Le LLM **n'invente jamais la cotation**. Il suit l'arbre de décision et fait des déductions au
maximum à partir du texte, mais s'arrête pour poser une question dès que l'ordonnance ne répond
pas à un embranchement. C'est l'arbre — déterministe et versionné — qui produit l'acte, jamais le
LLM directement. Conséquences : résultat traçable, corrigeable au clic, testable par jeu de cas.

Modèle IA à utiliser : **`claude-opus-5`** (Opus 5 — vérifié via le skill claude-api le
2026-08-11 ; ne pas utiliser Opus 4.8, qui est un modèle plus ancien).

## UI — décisions produit fixées avec l'utilisateur (2026-08-11)

- **Fil d'Ariane vertical** : chaque étape affiche son nom, la décision prise, et une explication
  textuelle plus petite en dessous. Il continue de se dérouler au fur et à mesure.
- **Icônes** : prévoir la place pour une icône par étape, mais pour l'instant afficher un carré
  avec le texte « icone de [description] » en petit — les vraies icônes viendront plus tard.
- **Questions à l'utilisateur** : présentées comme Claude Code — gros boutons cliquables pour
  chaque réponse possible, toujours avec une option « Je ne sais pas répondre ». Si cliquée, l'app
  propose d'écrire au médecin : elle génère un texte dans une box avec une icône « copier ».
- **Historique** : une fois une question répondue, la question + la réponse restent visibles dans
  le fil d'Ariane (jamais remplacées ni masquées).
- **Fil d'Ariane éditable** : cliquer sur n'importe quel maillon passé permet de reprendre l'arbre
  à la main à partir de ce point-là.
- **Sessions** : sauvegardées, listées dans une barre latérale gauche, avec suppression et
  archivage possibles depuis la liste.
- **Upload** : photo ou PDF de l'ordonnance possible ; la transcription détectée s'affiche en haut
  du fil d'Ariane avant le début du parcours de l'arbre.
- **Responsive** obligatoire. Favicon + app-icon de base à prévoir.
- **Coût IA affiché** : pour chaque cotation produite, afficher en haut du résultat le coût réel
  des appels Opus 5 ayant servi à l'obtenir (somme input/output/cache tokens × tarif, en euros).
  Transparence pour l'utilisateur, pas juste un total interne.

## Confidentialité — donnée sensible, lire avant de toucher au stockage

Directive du user, formulée de façon apparemment contradictoire : « Aucune donnée personnelle
n'est autorisée, ou capturée, mais on essaye de choper le nom et prénom quand même. »

**Interprétation retenue (assumption à valider avec l'utilisateur si contestée)** : le nom/prénom
du patient peut être extrait et affiché de façon éphémère (ex. pré-remplir le texte à envoyer au
médecin), mais **n'est jamais persisté** dans une session sauvegardée. Les sessions stockées ne
contiennent que le cheminement clinique (chemin dans l'arbre, texte de l'ordonnance transcrit) —
pas de nom, prénom, ni autre identifiant patient.

**Pourquoi c'est important** : c'est une donnée de santé, hébergée sur Netlify (pas
d'hébergement de données de santé certifié HDS), dans un repo **public**. Ne pas construire un
système qui persiste des identifiants patient sans en reparler explicitement avec l'utilisateur.

## Stack technique

- Next.js (App Router) + TypeScript + Tailwind CSS, déployé sur Netlify (Next.js Runtime auto).
- IA : `@anthropic-ai/sdk`, modèle `claude-opus-5`.
- Stockage sessions : à définir au Groupe 6 (Netlify Blobs pressenti — zéro provisioning DB, list
  natif, correspond au besoin barre latérale + suppression/archivage). Pas de PII dans le schéma.

## Workflow de travail avec l'utilisateur (2026-08-11)

- On ne travaille jamais en local uniquement : chaque groupe de tâches se termine par une
  publication (push GitHub + déploiement Netlify vérifié en ligne), puis un message à
  l'utilisateur, puis on enchaîne sur le groupe suivant sans attendre de confirmation.
- Commit après chaque étape terminée (voir mémoire globale `git-deploy-workflow-habits`).
- Toujours donner l'URL Netlify après un déploiement qui la déclenche.

## État actuel

Groupe 1 (infra) en cours. Voir la liste des groupes dans les tâches de session.

- `docs/SPEC-NGAP.md` — spécification réglementaire complète, à lire en premier
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
