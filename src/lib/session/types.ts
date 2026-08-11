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
}

/** Shape returned by the list endpoint — no need to ship the full path/text for the sidebar. */
export interface SavedSessionSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}
