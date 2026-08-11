# Spécification : cotation NGAP des actes de masso-kinésithérapie

État au 11 août 2026. Source normative : **NGAP, version en vigueur du 21/06/2026** (PDF officiel ameli, copié dans `data/sources/NGAP-21062026.pdf`).

---

## 1. De quoi on parle exactement

La « cotation » d'un kiné, c'est l'affectation d'une séance à un **acte du titre XIV de la NGAP** (Nomenclature générale des actes professionnels). Le titre XIV s'appelle *Actes de rééducation et de réadaptation fonctionnelles* et se découpe ainsi :

| Chapitre | Contenu | Rôle dans l'app |
|---|---|---|
| I – Actes de diagnostic | Section 1 : bilans isolés. Section 2 : **bilan-diagnostic kinésithérapique (BDK)** | Cotations additionnelles / alternatives |
| **II – Traitements individuels** | **Articles 1 à 11** : le cœur de la cotation | Cible principale de l'arbre |
| III – Modalités particulières | Traitements de groupe, traitements en parallèle | Modificateurs (la cotation reste celle du chap. II) |
| IV – Divers | Suppléments kinébalnéothérapie | Supplément cumulable |
| V | **Abrogé** par décision UNCAM du 14/12/2023 | — |

### Le point contre-intuitif : le coefficient n'est pas un coefficient

Depuis la refonte issue de l'**avenant 7** à la convention nationale (entrée en vigueur le 22/02/2024), l'ancienne logique « AMS 7,5 / AMK 8 » a disparu au profit d'environ **80 actes redécrits**, identifiés chacun par un couple **(lettre-clé, coefficient)**.

- La **lettre-clé** encode la famille : `RAM` rachis médical, `RAO` rachis opéré, `VIM` membre inférieur hors référentiel non opéré, `TER` plusieurs territoires, `NMI` neuro/rhumatismal inflammatoire, etc.
- Le **coefficient** (8,07 / 8,08 / 8,09 / 8,10 …) sert d'**identifiant discriminant** autant que de base tarifaire. C'est pourquoi deux actes cliniquement très différents peuvent coûter 17,83 € et 17,86 € : les décimales distinguent l'acte, pas sa valeur.
- Le tarif se calcule : `coefficient × valeur de la lettre-clé`.

**Valeur de la lettre-clé** : 2,21 € en métropole, 2,43 € outre-mer (depuis le 22/02/2024). Elle est identique pour toutes les lettres-clés kiné du titre XIV.

Exemple du cas décrit par l'utilisateur : `TER 9,79` = 9,79 × 2,21 = **21,64 €**, + IFS 4,00 € si déplacement au domicile.

---

## 2. Règles transversales (à implémenter comme contraintes, pas comme nœuds d'arbre)

Ces règles figurent dans les dispositions liminaires du titre XIV et dans les dispositions générales de la NGAP.

1. **Une seule cotation par séance.** Les cotations du titre XIV ne sont pas cumulables entre elles, sauf exception explicite. À chaque séance s'applique une cotation, correspondant au traitement de la pathologie ou du territoire anatomique en cause.
2. **Deux séances le même jour** sont possibles à quatre conditions cumulatives : deux prescriptions distinctes, affections relevant d'articles NGAP différents, deux régions anatomiques distinctes, deux séances distinctes. Elles sont alors facturées à taux plein (dérogation à l'art. 11 B des dispositions générales).
3. **Prescription médicale obligatoire**, mentionnant l'indication médicale. Si le médecin précise sa prescription, elle **s'impose** au kiné. → Conséquence produit : l'app propose, le praticien tranche.
4. **Durée** : de l'ordre de 30 minutes, sauf exceptions prévues au texte (mucoviscidose, réadaptation respiratoire ~1h30, lymphœdème du sein ~60 min).
5. **BDK cumulable** : le bilan-diagnostic kinésithérapique se cote en plus de la rééducation (AMK 10,7, ou AMK 10,8 pour le neurologique), selon un rythme précis (séances 1 à 10, puis 30ᵉ, puis toutes les 20 ; version neuro : puis 60ᵉ, puis toutes les 50).
6. **Bilans isolés du chapitre I section 1** : facturables **uniquement** en l'absence de traitement de rééducation en cours ou prescrit concomitamment.
7. **Traitements de groupe** (chap. III art. 1) : réservés aux articles 1, 2, 3 et 4 ; 3 patients maximum ; durée = nombre de patients × 30 min ; la cotation reste celle du chapitre II.
8. **Accord préalable / référentiel HAS** : deux régimes, à afficher comme alerte sur la cotation obtenue.
   - *avant traitement* : uniquement la rééducation après libération du nerf médian au canal carpien ;
   - *en cours de traitement* : demande à faire lorsque le nombre d'actes du référentiel est dépassé (seuils propres à chaque acte, stockés dans `data/actes-ngap.json`).

### Indemnités de déplacement

| Code | Libellé | Montant | Condition |
|---|---|---|---|
| IFD | Indemnité forfaitaire de déplacement | 2,50 € | Même agglomération, ou < 2 km en plaine / < 1 km en montagne |
| **IFS** | Indemnité forfaitaire de déplacement **spécifique** aux kinés | **4,00 €** | Voir liste ci-dessous |
| IK / IKM / IKS | Indemnité kilométrique plaine / montagne / à pied ou ski | 0,38 € / 0,61 € / 3,35 € | Au-delà de 2 km (1 km en montagne), abattement de 2 km aller et retour |

Majorations : nuit 9,15 € (actes entre 20 h et 8 h, si l'appel a été fait entre 19 h et 7 h), dimanche et jours fériés 7,62 € — en cas d'urgence justifiée par l'état du malade.

**L'IFS ne s'applique qu'aux actes du chapitre II listés à l'article 13 E des dispositions générales** — c'est ce qui explique le `[IFS]` affiché à côté de `TER 9,79` :

- article 1 **D** (plusieurs membres, ou tronc et membres) : **toujours** ;
- article 1 **A, B, C, E, F** : **seulement** après intervention pour motif orthopédique ou traumatologique, de la sortie d'hospitalisation au **35ᵉ jour** suivant (la limite du 35ᵉ jour ne s'applique pas aux actes réalisés dans le cadre des programmes d'accompagnement du retour à domicile) ;
- article **2** (rhumatismal inflammatoire) : oui ;
- article **4** (neurologique et musculaire) : oui ;
- article **5** : seulement « maladies respiratoires obstructives, restrictives ou mixtes hors urgence » et « mucoviscidose » ;
- article **9** (déambulation du sujet âgé) : oui.

Autre forfait à connaître : FRD 100 € (retour rapide à domicile après AVC), FAD 20 € (accompagnement à domicile après chirurgie orthopédique).

---

## 3. L'arbre de décision

Il est modélisé dans `data/arbre-decision.json` : un graphe de nœuds, chaque nœud étant soit une **question** (liste d'options avec un `label` court, prêt pour le fil d'Ariane), soit une **feuille** pointant vers un acte de `data/actes-ngap.json`.

Chiffres actuels : **94 actes**, **138 nœuds**, **90 feuilles**. Validé par script : aucune référence cassée, aucun nœud orphelin. Les 4 actes non atteignables par l'arbre sont volontairement hors arbre : ce sont des suppléments (kinébalnéothérapie ×2, bandage multicouche ×2).

### Niveau 1 — article de la NGAP

Exactement les entrées que décrit l'utilisateur : orthopédique et rhumatologique (art. 1), rhumatisme inflammatoire (2), paroi abdominale (3), neurologique et musculaire (4), respiratoire (5), maxillo-facial et ORL (6), affections vasculaires (7), périnéosphinctérienne (8), sujet âgé (9), brûlures (10), soins palliatifs (11). Le nœud racine ajoute en amont le choix **traitement / BDK / bilan isolé** (la « case bilan » vue dans l'app concurrente).

### Article 1 — le plus profond

```
Article 1
└─ Localisation
   ├─ Uniquement le rachis
   │   └─ Segment : déviation <18 ans (→ 1 E) | lombo-sacré | dorsal | cervical | ≥2 segments
   │       └─ [situation clinique soumise à référentiel ?] → contexte chirurgical → RAM/RAO/DRA
   ├─ Membre supérieur → amputé ? → segment (épaule/coude/poignet/≥2) → situation → opéré ? → RSM/RSC/VSM/VSC
   ├─ Membre inférieur → amputé ? → segment (hanche/genou/cheville/≥2) → situation → opéré ? → RIM/RIC/VIM/VIC
   └─ Plusieurs membres, ou membre et tronc → amputé ?
       ├─ Non → contexte chirurgical → TER 9,79 [IFS] | TER 9,81 [IFS]
       └─ Oui → étendue → APM 8,11 | APM 8,10 | APM 9,80
```

Le libellé exact de l'article 1 D confirme la lecture de l'utilisateur : *« Rééducation secondaire à l'affection d'au moins 2 territoires lésés (hors 2 territoires ou plus du même membre ou 2 territoires ou plus du rachis) »*. Le « HORS » est bien une **exclusion de routage** : deux territoires du même membre relèvent de 1 B ou 1 C (`VSM/VSC` ou `VIM/VIC`), deux segments du rachis relèvent de 1 A (`RAM/RAO`). Sans cette règle, un patient avec cheville + genou du même côté serait coté TER à tort — c'est précisément le type d'erreur que l'app doit éviter.

### Distinction structurante à l'intérieur des articles 1 B et 1 C

Chaque segment se lit en deux temps :
1. **la situation est-elle nommée dans un référentiel HAS ?** (LCA, PTG, PTH, méniscectomie, entorse de cheville, coiffe des rotateurs, fracture du coude, fracture de l'avant-bras, humérus proximal, canal carpien) → lettres-clés `R**`, avec seuil d'accord préalable ;
2. sinon → acte « hors référentiel » → lettres-clés `V**`, sans seuil.

Puis le contexte chirurgical sélectionne la variante `*M` (médical) ou `*C` (chirurgical).

---

## 4. Ce que la NGAP ne dit pas, et qui reste à la charge de l'app

- **Aucun mapping officiel « texte de l'ordonnance → acte ».** Le médecin écrit en langage libre (« 15 séances de kiné pour gonalgie droite post-arthroscopie »). L'inférence est un problème de compréhension du texte, pas de règle juridique — d'où le choix d'un LLM en amont de l'arbre, et non de mots-clés seuls.
- **Certaines réponses ne figurent pas dans l'ordonnance** : contexte chirurgical, date de sortie d'hospitalisation (pour l'IFS), âge (art. 1 E < 18 ans), nombre de séances déjà réalisées dans les 12 mois (seuils d'accord préalable). L'app doit savoir dire « il me manque cette information » plutôt que de deviner.
- **La responsabilité de la cotation reste celle du praticien.** Prévoir une mention explicite dans l'UI et éviter toute formulation impérative.
- **Les tarifs changent souvent** : trois versions de la NGAP entre janvier et juin 2026 (01/01, 28/05, 21/06). Prévoir un champ « version de la NGAP » dans les données et un script de re-import.

---

## 5. Architecture proposée pour l'app

```
Texte d'ordonnance (saisi, plus tard OCR)
        │
        ▼
[Extraction LLM] ──► {article, localisation, situation clinique, chirurgie, âge, contexte}
        │                         + confiance par champ
        ▼
[Moteur d'arbre déterministe] ──► parcours de nœuds → acte
        │
        ▼
Résultat : lettre-clé + coefficient + tarif + [IFS] + alerte référentiel/accord préalable
        │
        ▼
Fil d'Ariane cliquable : Article 1 › Membre inférieur › Non amputé › Genou › Après LCA
                          ▲ clic sur n'importe quel maillon = on repart de là à la main
```

Point de conception important : **le LLM ne produit jamais la cotation**. Il produit un chemin dans l'arbre ; c'est l'arbre, déterministe et versionné, qui produit la cotation. Cela rend chaque résultat traçable, réparable au clic, et testable par un jeu de cas.

Quand un champ manque ou que la confiance est basse, l'app s'arrête au dernier nœud sûr et pose la question restante — le fil d'Ariane est alors partiel, ce qui est déjà utile.

---

## 6. Sources

- [NGAP – version du 21/06/2026 (PDF officiel, ameli.fr)](https://www.ameli.fr/sites/default/files/Documents/NGAP-21062026.pdf) — **source normative unique**, copie locale dans `data/sources/`
- [NGAP – version du 28/05/2026 (ameli.fr)](https://www.ameli.fr/sites/default/files/Documents/NGAP-28052026.pdf) — version précédente
- [La nomenclature des actes de kinésithérapie – ameli.fr](https://www.ameli.fr/masseur-kinesitherapeute/exercice-liberal/facturation-remuneration/nouvelle-nomenclature)
- [Les tarifs conventionnels – ameli.fr](https://www.ameli.fr/masseur-kinesitherapeute/exercice-liberal/facturation-remuneration/tarifs-conventionnels/tarifs) — valeurs des lettres-clés, IFD/IFS/IK, majorations
- [Avenant n° 7 à la convention nationale (livret, Ordre des MK)](https://gard.ordremk.fr/files/2024/11/CVL_Livret-avenant-7-kine-web_VF.pdf)
- [Guide pratique de la NGAP en masso-kinésithérapie (Assurance Maladie AURA)](https://actus-ps-74.cpam-haute-savoie.fr/sitepad-data/uploads/2025/01/GUIDE-PRATIQUE-DE-LA-NGAP-MASSO-KINESITHERAPIE_Assurance-Maladie-AURA_janvier-2025.pdf) — pédagogique, antérieur aux revalorisations 2026

### Fiabilité des données

| Donnée | Statut |
|---|---|
| Libellés, lettres-clés, coefficients, seuils de référentiel | **Vérifiés** ligne à ligne dans le PDF officiel du 21/06/2026 |
| Périmètre exact de l'IFS | **Vérifié** (art. 13 E des dispositions générales, même PDF) |
| Règles de cumul, deux séances/jour, groupes | **Vérifiées** (dispositions liminaires du titre XIV, chap. III) |
| Valeur de la lettre-clé (2,21 €) et montants IFD/IFS/IK/majorations | Issus de la page tarifs ameli.fr, **à reconfirmer** à la main avant mise en production — ce sont les seuls chiffres non lus dans le PDF normatif |
