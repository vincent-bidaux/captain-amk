# Captain AMK

Aide à la cotation NGAP pour les masseurs-kinésithérapeutes libéraux.

À partir du texte d'une ordonnance médicale (bientôt : une photo ou un PDF), l'app propose la
cotation NGAP (lettre-clé + coefficient) et **montre son raisonnement** sous forme de fil d'Ariane,
corrigeable à n'importe quelle étape. La cotation reste sous la responsabilité du praticien : l'app
aide à la décision, elle ne la remplace pas.

## Principe

Un LLM extrait des informations du texte de l'ordonnance et fait des déductions au maximum, mais
s'arrête pour poser une question quand une information manque. C'est un **arbre de décision
déterministe**, basé sur le titre XIV de la [NGAP](docs/SPEC-NGAP.md), qui produit la cotation —
jamais le LLM directement. Voir [CLAUDE.md](CLAUDE.md) pour le détail des décisions d'architecture.

## Développement

```bash
npm install
npm run dev
```

## Déploiement

Déployé automatiquement sur Netlify à chaque push sur `main` : https://captain-amk.netlify.app

## Licence

MIT — voir [LICENSE](LICENSE).
