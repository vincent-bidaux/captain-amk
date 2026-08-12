"use client";

import { useState } from "react";
import StaticPage from "@/components/StaticPage";
import type { FeedbackEntry } from "@/lib/feedback/types";

export default function FeedbacksPage() {
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<FeedbackEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur");
        return;
      }
      setFeedback(data.feedback);
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <StaticPage title="Feedback" subtitle="Retours des praticiens sur la version bêta.">
      {feedback === null ? (
        <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-2">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="rounded-md border border-border bg-white px-3 py-1.5 text-sm text-black outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Vérification…" : "Voir les retours"}
          </button>
          {error && <p className="text-xs text-danger">{error}</p>}
        </form>
      ) : feedback.length === 0 ? (
        <p className="text-sm text-muted">Aucun retour pour l&apos;instant.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {feedback.map((f) => (
            <li key={f.id} className="rounded-lg border border-border bg-surface p-4">
              <p className="text-xs text-muted">
                {new Date(f.createdAt).toLocaleString("fr-FR")}
                {f.nom && ` — ${f.nom}`}
                {f.email && ` — ${f.email}`}
              </p>
              {f.commentaire && (
                <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                  {f.commentaire}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </StaticPage>
  );
}
