import type { AiModel } from "@/lib/ngap/pricing";
import type { PathStep } from "@/lib/ngap/types";

export interface SavedSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  path: PathStep[];
  /** Node id where the session ended: a leaf (result) or a question still pending. */
  currentNodeId: string;
  /** Cumulative token usage across every AI call in the session — feeds the cost banner. */
  usage?: { inputTokens: number; outputTokens: number };
  /** Modèle utilisé pour cette session. Absent sur les sessions créées avant l'introduction du
   *  choix de modèle (2026-08-11) : elles étaient toutes en `claude-opus-5`, seul modèle
   *  disponible à l'époque — ne pas retomber sur DEFAULT_AI_MODEL pour celles-là. */
  aiModel?: AiModel;
  /**
   * Patient name, doctor name, ordonnance date and prescription text — only
   * present when the practitioner explicitly opted in at save time (checkbox
   * in SaveSessionBox). Absent by default: see CLAUDE.md § Confidentialité.
   */
  patientName?: { prenom: string | null; nom: string | null } | null;
  medecinNom?: string | null;
  medecinTelephone?: string | null;
  dateOrdonnance?: string | null;
  prescription?: string | null;
}

/** Shape returned by the list endpoint — no need to ship the full path/text for the sidebar. */
export interface SavedSessionSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  /** Formatted "Prénom Nom", only present when opted in at save time. */
  patientDisplay?: string | null;
}
