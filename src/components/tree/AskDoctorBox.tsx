"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export default function AskDoctorBox({
  question,
  optionLabels,
  patientName,
  onClose,
}: {
  question: string;
  optionLabels: string[];
  patientName?: { prenom: string | null; nom: string | null } | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const patientMention = patientName
    ? ` concernant ${[patientName.prenom, patientName.nom].filter(Boolean).join(" ")}`
    : "";

  const message = [
    "Bonjour Docteur,",
    "",
    `Pour coter précisément la séance de kinésithérapie prescrite${patientMention}, pourriez-vous préciser : ${question.replace(/\s*\?\s*$/, "")} ?`,
    optionLabels.length > 0
      ? `Éléments de réponse possibles : ${optionLabels.join(", ")}.`
      : null,
    "",
    "Merci d'avance,",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — the text remains selectable in the box.
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-border bg-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium">Texte à envoyer au médecin</p>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-muted hover:text-foreground"
        >
          Fermer
        </button>
      </div>
      <pre className="whitespace-pre-wrap rounded-md bg-background px-3 py-2 font-sans text-sm text-foreground">
        {message}
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        className="mt-3 flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-neutral-100 dark:text-neutral-900"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            Copié
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            Copier le courrier
          </>
        )}
      </button>
    </div>
  );
}
