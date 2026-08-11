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
  /**
   * Reserved for a future opt-in "save the ordonnance text too" feature — see
   * redact.ts. The MVP never sends this from the client: only the decision
   * path (questions/answers/justifications) and the result are persisted,
   * never the raw prescription text nor the patient's name.
   */
  ordonnanceTextRedacted: string | null;
}

/** Shape returned by the list endpoint — no need to ship the full path/text for the sidebar. */
export interface SavedSessionSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}
