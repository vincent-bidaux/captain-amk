"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { notifySessionsChanged } from "@/lib/session/events";
import type { OrdonnanceHeaderData, PathStep } from "@/lib/ngap/types";

export default function SaveSessionBox({
  defaultTitle,
  path,
  currentNodeId,
  usage,
  ordonnanceHeader,
}: {
  defaultTitle: string;
  path: PathStep[];
  currentNodeId: string;
  usage?: { inputTokens: number; outputTokens: number };
  ordonnanceHeader?: OrdonnanceHeaderData;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(defaultTitle);
  const [includePatientData, setIncludePatientData] = useState(false);
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
          ...(usage ? { usage } : {}),
          ...(includePatientData && ordonnanceHeader
            ? {
                patientName: ordonnanceHeader.patientName,
                medecinNom: ordonnanceHeader.medecinNom,
                medecinTelephone: ordonnanceHeader.medecinTelephone,
                dateOrdonnance: ordonnanceHeader.dateOrdonnance,
                prescription: ordonnanceHeader.prescription,
              }
            : {}),
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
        patient, sauf si vous cochez la case ci-dessous.
      </p>

      <label className="mt-2 flex items-start gap-2 text-xs text-foreground">
        <input
          type="checkbox"
          checked={includePatientData}
          onChange={(e) => setIncludePatientData(e.target.checked)}
          className="mt-0.5"
        />
        Enregistrer aussi le nom du patient et la prescription avec cette
        session
      </label>

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
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : "Enregistrer la session"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
