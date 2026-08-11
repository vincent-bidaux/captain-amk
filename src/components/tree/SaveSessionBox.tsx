"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { notifySessionsChanged } from "@/lib/session/events";
import type { PathStep } from "@/lib/ngap/types";

export default function SaveSessionBox({
  defaultTitle,
  path,
  currentNodeId,
}: {
  defaultTitle: string;
  path: PathStep[];
  currentNodeId: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(defaultTitle);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || defaultTitle,
          path,
          currentNodeId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur lors de l'enregistrement.");
        return;
      }
      setSaved(true);
      notifySessionsChanged();
      router.push(`/sessions/${data.id}`);
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <p className="mt-4 text-sm text-accent">Session enregistrée ✓</p>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-border bg-background p-3">
      <p className="text-xs text-muted">
        Seul le cheminement (questions, réponses, justifications) est
        enregistré — jamais le texte de l&apos;ordonnance ni le nom du
        patient.
      </p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre de la session"
          className="flex-1 rounded-md border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : "Enregistrer la session"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
