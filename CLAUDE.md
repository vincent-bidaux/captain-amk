# Captain AMK

App d'aide à la cotation NGAP pour les masseurs-kinésithérapeutes libéraux, open source.

- Repo : https://github.com/vincent-bidaux/captain-amk (public)
- Live : https://captain-amk.netlify.app

## Objectif

Un kiné reçoit une ordonnance rédigée en langage libre par un médecin. Il doit en déduire la
cotation NGAP exacte de ses séances (lettre-clé + coefficient), ce qui détermine le tarif et le
remboursement. L'app fait ce travail à sa place, puis **montre son raisonnement** sous forme de fil
d'Ariane vertical, cliquable à n'importe quelle étape pour corriger et repartir en manuel.

Phase 1 : saisie du texte de l'ordonnance. ✅
Phase 2 : photo / PDF en entrée, transcription par IA (vision). ✅

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
- **Coût IA affiché** : bandeau en haut de chaque session, cumul des tokens input/output de tous
  les appels Opus 5 de la session (transcription + décisions) × tarif officiel. Affiché **en
  dollars US ($)**, pas en euros : c'est la devise de facturation réelle d'Anthropic, une
  conversion € inventerait un taux de change à maintenir sans raison. Transparence sur le coût
  réel, pas une estimation vague.

## Confidentialité — historique de la décision, lire avant de toucher au stockage

**Ordre chronologique important, pour ne pas revenir en arrière par erreur :**

1. (2026-08-11, matin) Directive initiale, formulée de façon apparemment contradictoire :
   « Aucune donnée personnelle n'est autorisée, ou capturée, mais on essaye de choper le nom et
   prénom quand même. » → interprétée comme : extraction éphémère côté client uniquement, jamais
   rien envoyé au serveur pour être stocké.
2. (2026-08-11, après-midi) **Revirement explicite de l'utilisateur** : « oublie ce que j'avais
   dit sur le nom du patient, d'une manière générale, il faut le nom du patient. » Le nom du
   patient est désormais une donnée voulue, affichée en évidence (cartouche d'en-tête du
   résultat : date d'ordonnance, médecin, patient, prescription).

**Implémentation actuelle (fait foi)** : l'extraction (nom/prénom patient, nom du médecin, date
de l'ordonnance) se fait dès le premier appel `/api/decide` (`extractHeader: true`) et alimente un
bandeau d'en-tête affiché en haut du cartouche de résultat, en direct pendant la session. La
**persistance reste opt-in** : à l'enregistrement d'une session (`SaveSessionBox`), une case à
cocher « Enregistrer aussi le nom du patient et la prescription » contrôle si `patientName`,
`medecinNom`, `dateOrdonnance` et `prescription` (le texte brut de l'ordonnance) sont envoyés à
`POST /api/sessions` et stockés. Non cochée par défaut. Si cochée, la barre latérale affiche le
nom du patient sous le titre de la session.

**Pourquoi l'opt-in reste utile** malgré le revirement : c'est une donnée de santé, hébergée sur
Netlify (pas d'hébergement HDS certifié), dans un repo **public** — la case à cocher laisse le
praticien décider au cas par cas s'il veut cette traçabilité nominative pour telle session, sans
que ce soit automatique/invisible.

## Stack technique

- Next.js (App Router) + TypeScript + Tailwind CSS, déployé sur Netlify (Next.js Runtime auto).
- IA : `@anthropic-ai/sdk`, modèle `claude-opus-5`, structured outputs via Zod
  (`zodOutputFormat`) pour toutes les réponses (décision d'arbre, transcription).
  `thinking: {type: "disabled"}` + `effort: "medium"` sur ces deux routes (classification bornée,
  pas de raisonnement long — voir l'échange avec l'utilisateur sur Opus vs Sonnet, tranché en
  faveur d'Opus 5 par prudence sur l'enjeu financier/légal de la cotation).
- Stockage sessions : **Netlify Blobs** (`@netlify/blobs`, store `captain-amk-sessions`) — zéro
  provisioning, identifiants injectés automatiquement au runtime Netlify. Aucune PII dans le
  schéma stocké (voir section Confidentialité).
- Routes API : `/api/decide` (une décision d'arbre), `/api/transcribe` (vision, image/PDF →
  texte), `/api/sessions` + `/api/sessions/[id]` (CRUD sessions).
- Upload : redimensionnement client-side des photos (1600px, JPEG 0.85) avant envoi
  (`src/lib/image/prepareUpload.ts`) ; PDF envoyé tel quel (max 10 Mo).

## Workflow de travail avec l'utilisateur (2026-08-11)

- On ne travaille jamais en local uniquement : chaque groupe de tâches se termine par une
  publication (push GitHub + déploiement Netlify vérifié en ligne), puis un message à
  l'utilisateur, puis on enchaîne sur le groupe suivant sans attendre de confirmation.
- Commit après chaque étape terminée (voir mémoire globale `git-deploy-workflow-habits`).
- Toujours donner l'URL Netlify après un déploiement qui la déclenche.

## État actuel

Tous les groupes fonctionnels (1 à 7) terminés et validés en production :

- Arbre de décision complet (94 actes, 138 nœuds) + fil d'Ariane vertical cliquable/corrigeable
- Pilotage automatique par Opus 5 depuis le texte, arrêt propre + question au médecin quand le
  texte ne tranche pas (testé : genou/LCA entièrement auto → RIC 8.08 ; épaule ambiguë → arrêt
  correct)
- Upload photo/PDF (drag&drop ou sélection) → transcription → pipeline complet automatique
- Sessions sauvegardées, nom du patient + prescription en opt-in (case à cocher), liste/archivage/
  suppression, patient affiché sous le titre dans la barre latérale quand enregistré
- Coût réel affiché en $ à chaque session (pas de mention "IA" dans l'UI — voix à la première
  personne, « je », pour les messages de statut/arrêt)
- Cartouche de résultat avec en-tête (date ordonnance, médecin, patient, prescription) +
  bouton « copier les résultats »
- Fil d'Ariane : connecteurs visuels entre étapes, clic sur une étape passée = « Modifier le
  choix » et **rejoue cette étape** (pas la suivante)

Polish continu au fil des retours utilisateur (2026-08-11, après-midi) : voir git log pour le détail.

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
