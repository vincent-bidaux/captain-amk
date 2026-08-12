export interface FeedbackEntry {
  id: string;
  createdAt: string;
  /** Nom et fonction du praticien — facultatif. */
  nom?: string;
  email?: string;
  commentaire?: string;
}
