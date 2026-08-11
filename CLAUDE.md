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

## Confidentialité — donnée sensible, lire avant de toucher au stockage

Directive du user, formulée de façon apparemment contradictoire : « Aucune donnée personnelle
n'est autorisée, ou capturée, mais on essaye de choper le nom et prénom quand même. »

**Interprétation retenue et implémentée** : le nom/prénom du patient est extrait par l'IA et
affiché de façon **éphémère, côté client uniquement** (état React, jamais envoyé à une route de
sauvegarde) — utile pour pré-remplir le texte à envoyer au médecin. Une session sauvegardée
(`POST /api/sessions`) ne contient **que** `title`, `path` (questions/réponses/justifications IA)
et `currentNodeId`. **Ni le texte de l'ordonnance, ni le nom du patient ne sont jamais envoyés au
serveur pour être stockés** — c'est plus strict que ce qui avait été envisagé au départ (stocker
le texte redigé n'était pas fiable : une redaction "best effort" du nom ne garantit rien sur les
autres identifiants — date de naissance, adresse... — pouvant apparaître dans le texte).

**Pourquoi c'est important** : c'est une donnée de santé, hébergée sur Netlify (pas
d'hébergement de données de santé certifié HDS), dans un repo **public**. Ne pas réintroduire de
persistance de texte brut ou d'identifiant patient sans en reparler explicitement avec
l'utilisateur.

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
- Upload photo/PDF → transcription → pipeline complet automatique (testé : PDF entorse cheville
  → RIM 8.10, bout en bout, nom patient détecté puis non conservé)
- Sessions sauvegardées (cheminement seul, jamais texte/nom), liste/archivage/suppression
- Coût IA réel affiché en $ à chaque session

Groupe 8 (polish) en cours : nettoyage code mort, relecture responsive/copie finale.

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
