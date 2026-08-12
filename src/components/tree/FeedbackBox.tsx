"use client";

import { useState } from "react";

export default function FeedbackBox() {
  const [open, setOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, email, commentaire }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError("Impossible d'envoyer le commentaire, réessayez.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "rounded-md border border-border bg-white px-3 py-1.5 text-sm text-black outline-none focus:border-accent";

  return (
    <div className="mt-4 rounded-xl border border-accent/40 bg-accent/10 p-5">
      <p className="text-sm font-semibold text-accent">Version bêta</p>
      <p className="mt-1 text-sm text-foreground">
        Votre avis compte : dites-nous ce qui fonctionne, ce qui manque, ou ce
        qui vous a semblé faux.
      </p>

      {submitted ? (
        <p className="mt-3 text-sm text-accent">Merci pour votre retour !</p>
      ) : open ? (
        <div className="mt-3 flex flex-col gap-2">
          <input
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Nom et fonction (facultatif)"
            className={inputClass}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (facultatif)"
            className={inputClass}
          />
          <textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Votre commentaire (facultatif)"
            rows={4}
            className={inputClass}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Envoi…" : "Envoyer"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={submitting}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
            >
              Annuler
            </button>
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          Laisser des commentaires
        </button>
      )}
    </div>
  );
}
