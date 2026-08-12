export interface DemoOrdonnance {
  id: string;
  title: string;
  note?: string;
  text: string;
}

/**
 * Six ordonnances fictives pour le mode test de la bêta. Choisies pour couvrir des branches
 * variées de l'arbre (rachis, membre inférieur, membre supérieur, neurologique, respiratoire),
 * dont deux volontairement difficiles à coter :
 * - "genou-cheville" piège la règle « 2 territoires du même membre » (art. 1 B/C), qui ne doit
 *   PAS être cotée comme "plusieurs membres" (art. 1 D / TER) — voir CLAUDE.md.
 * - "epaule-ambigue" ne précise jamais le contexte chirurgical : Captain AMK doit s'arrêter et
 *   poser la question plutôt que deviner.
 * Noms, médecins et téléphones sont entièrement fictifs.
 */
export const DEMO_ORDONNANCES: DemoOrdonnance[] = [
  {
    id: "genou-lca",
    title: "Genou opéré (LCA)",
    text: `Dr Nathalie ROUSSEAU
Tel : 04 78 22 15 63

Le 22/07/2026

M. BENAÏSSA Karim

Rééducation du genou droit après reconstruction du ligament croisé antérieur (intervention du 15/07/2026). 20 séances de kinésithérapie.`,
  },
  {
    id: "lombalgie",
    title: "Lombalgie commune",
    text: `Dr Michel PASCAL
Tel : 02 40 55 12 08

Le 25/07/2026

Mme MARCHAND Sylvie

Kinésithérapie pour lombalgie commune chronique, sans signe de gravité. 15 séances.`,
  },
  {
    id: "hemiplegie",
    title: "Hémiplégie post-AVC",
    text: `Dr Amandine LEFORT
Tel : 05 61 33 44 09

Le 28/07/2026

M. DUCHEMIN Robert

Rééducation d'une hémiplégie gauche suite à un accident vasculaire cérébral ischémique (mars 2026). 30 séances de kinésithérapie.`,
  },
  {
    id: "mucoviscidose",
    title: "Mucoviscidose (enfant)",
    text: `Dr Julien FABRE
Tel : 03 88 24 17 50

Le 30/07/2026

Mlle VASSEUR Léa

Kinésithérapie respiratoire dans le cadre du suivi d'une mucoviscidose. Séances bi-hebdomadaires, 20 séances.`,
  },
  {
    id: "genou-cheville",
    title: "Genou + cheville (piège)",
    note: "Cas complexe : deux articulations de la même jambe.",
    text: `Dr Corinne ANTOINE
Tel : 01 42 67 88 21

Le 01/08/2026

M. OLLIVIER Patrick

Douleurs chroniques du genou droit et de la cheville droite, sans antécédent chirurgical. Kinésithérapie pour rééducation des deux articulations. 20 séances.`,
  },
  {
    id: "epaule-ambigue",
    title: "Épaule ambiguë (piège)",
    note: "Cas ambigu : contexte chirurgical non précisé.",
    text: `Dr Vincent MERCIER
Tel : 04 91 12 33 47

Le 04/08/2026

Mme GUILLOT Sophie

Douleur de l'épaule gauche suite à un traumatisme, suspicion d'atteinte de la coiffe des rotateurs, bilan complémentaire en cours. Kinésithérapie de l'épaule, 15 séances.`,
  },
];
