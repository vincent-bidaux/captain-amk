# Changelog

Toutes les versions notables de Captain AMK. Le détail lisible par les praticiens est sur
[captain-amk.netlify.app/changelog](https://captain-amk.netlify.app/changelog).

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
