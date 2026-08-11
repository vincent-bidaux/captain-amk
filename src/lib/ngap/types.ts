export interface Referentiel {
  soumis: boolean;
  traitementHabituel?: string;
  accordPrealable?: string;
}

export interface IfsInfo {
  eligible: boolean | "conditionnel";
  condition?: string;
}

export interface Acte {
  id: string;
  chapitre: string;
  article?: number;
  paragraphe?: string;
  section?: string;
  type?: string;
  libelle: string;
  condition?: string;
  exclusions?: string[];
  lettreCle: string;
  coefficient: number;
  referentiel?: Referentiel;
  note?: string;
  ifs?: IfsInfo;
  nonIndications?: string[];
  contreIndications?: string[];
}

export interface ActesData {
  meta: {
    source: string;
    sourceUrl: string;
    perimetre: string;
    dateExtraction: string;
    avertissement: string;
    valeurLettreCle: {
      metropole: number;
      outreMer: number;
      dateApplication: string;
      remarque: string;
    };
    deplacements: {
      IFD: { montant: number; libelle: string };
      IFS: { montant: number; libelle: string };
      IK: { plaine: number; montagne: number; piedOuSki: number };
    };
    majorations: { nuit: number; dimancheEtJoursFeries: number };
  };
  lettresCles: Record<string, string>;
  actes: Acte[];
}

export interface ArbreOption {
  label: string;
  next: string;
  article?: number;
  aide?: string;
}

export interface QuestionNoeud {
  question: string;
  aide?: string;
  options: ArbreOption[];
}

export interface FeuilleNoeud {
  acte: string;
}

export type Noeud = QuestionNoeud | FeuilleNoeud;

export interface ArbreDecision {
  meta: Record<string, unknown>;
  racine: string;
  noeuds: Record<string, Noeud>;
}

export function isFeuille(node: Noeud): node is FeuilleNoeud {
  return "acte" in node;
}

export function isQuestion(node: Noeud): node is QuestionNoeud {
  return "options" in node;
}

export type Region = "metropole" | "outreMer";

/** One completed step in the decision path: the question that was asked and the option chosen. */
export interface PathStep {
  nodeId: string;
  question: string;
  chosenLabel: string;
  chosenAide?: string;
  nextNodeId: string;
  /** Whether this step was decided automatically from the ordonnance text, or answered manually. */
  source: "auto" | "manuel";
}

/** Header info shown at the top of a cotation result — extracted from the ordonnance. */
export interface OrdonnanceHeaderData {
  patientName: { prenom: string | null; nom: string | null } | null;
  medecinNom: string | null;
  dateOrdonnance: string | null;
  prescription: string | null;
}

/** Result of asking the AI to decide a single tree question from the ordonnance text. */
export interface DecideResult {
  answered: boolean;
  optionIndex: number;
  justification: string;
  patientName?: { prenom: string | null; nom: string | null };
  medecinNom?: string | null;
  dateOrdonnance?: string | null;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}
