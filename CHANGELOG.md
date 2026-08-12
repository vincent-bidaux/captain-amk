# Changelog

Toutes les versions notables de Captain AMK. Le détail lisible par les praticiens est sur
[captain-amk.netlify.app/changelog](https://captain-amk.netlify.app/changelog).

## 1.2.0 — 2026-08-12

Préparation de la bêta publique.

- **Confidentialité renforcée pour la bêta** : les sessions sont désormais sauvegardées en
  `localStorage`, uniquement sur l'appareil du praticien — plus aucun stockage central partagé.
  La case « Enregistrer aussi le nom du patient et la prescription » est désactivée : une session
  sauvegardée ne contient plus jamais de donnée patient, quoi qu'il arrive.
- **Mode test** : 6 ordonnances de démonstration (couvrant rachis, membre inférieur, membre
  supérieur, neurologique, respiratoire), dont deux volontairement pièges pour montrer comment
  l'app gère les cas ambigus, accessibles depuis la page d'accueil sans donnée réelle.
- **Feedback bêta** : un bouton « Laisser des commentaires » à la fin de chaque cotation permet
  de remonter un avis (nom, email, commentaire — tout facultatif), consultable par l'équipe sur
  une page dédiée protégée par mot de passe.

## 1.1.0 — 2026-08-11

- Choix du modèle IA avant l'analyse : **Sonnet 5 par défaut** (rapide, moins cher), Opus 5
  disponible en option pour les cas où le praticien préfère plus de prudence. S'applique à toute
  la session (transcription + décisions d'arbre). Modèle et nombre de tokens affichés dans le
  bandeau de coût.
- Coût de la session désormais **persisté** avec la session sauvegardée (retrouvé tel quel à la
  réouverture, plus recalculé à zéro).
- En-tête « Dossier » (patient, médecin **+ téléphone**, date, prescription) affiché dès le
  lancement de l'analyse, pas seulement sur le résultat final ; ordre Dossier puis Cheminement
  sur la page d'une session sauvegardée (avant : inversé).
- Nom du patient affiché sous le titre sur la page d'une session sauvegardée, comme dans la
  barre latérale.
- Tous les emoji de l'interface remplacés par des icônes `lucide-react` cohérentes (trait fin).
- Barre latérale desktop fixe (`position: sticky`, hauteur verrouillée sur le viewport) : elle ne
  scrolle plus avec la page.
- Logo de la barre latérale réduit, label « Modifier le choix » discret au survol d'une étape du
  fil d'Ariane (texte seul, ne recouvre plus le contenu de la carte).

## 1.0.0 — 2026-08-11

Première version complète et publique.

- Arbre de décision NGAP complet (94 actes, 138 nœuds, 90 feuilles) couvrant le titre XIV,
  chapitre II (traitements individuels, articles 1 à 11), validé par script de cohérence
  (aucune référence cassée, aucun nœud orphelin).
- Pilotage automatique de l'arbre par IA (`claude-opus-5`, structured outputs) à partir du texte
  de l'ordonnance, avec arrêt et question au praticien dès qu'une information manque.
- Fil d'Ariane vertical, cliquable à n'importe quelle étape pour corriger une réponse et rejouer
  l'arbre à partir de là.
- Upload photo ou PDF de l'ordonnance (vision), transcription purgée du bruit administratif et
  légal (identifiants de sécurité sociale, mentions RGPD, blocs de signature électronique,
  coordonnées du cabinet…).
- Sessions persistées (Netlify Blobs), listées/archivables/supprimables depuis une barre
  latérale ; conservation du nom du patient et de la prescription en opt-in explicite
  (case à cocher), jamais par défaut.
- Cartouche de résultat (date, médecin, patient, prescription) + bouton de copie des résultats.
- Coût réel de chaque session (tokens input/output × tarif Opus 5) affiché en dollars US.
- Barre latérale repliée à l'arrivée sur le site, dépliée seulement une fois le travail démarré ;
  logo affiché une seule fois à l'écran (accueil ou barre latérale, jamais les deux).
- Pages Aide et Sources (spécification NGAP, liens vers les textes officiels, limites connues).
