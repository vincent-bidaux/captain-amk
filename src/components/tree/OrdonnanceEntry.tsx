"use client";

import { useState } from "react";

export default function OrdonnanceEntry({
  onAnalyze,
  onSkip,
  disabled,
}: {
  onAnalyze: (text: string) => void;
  onSkip: () => void;
  disabled: boolean;
}) {
  const [text, setText] = useState("");

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-lg font-semibold">Texte de l&apos;ordonnance</p>
      <p className="mt-1 text-sm text-muted">
        Collez le texte de la prescription. L&apos;IA propose une cotation en
        suivant l&apos;arbre de décision et s&apos;arrête pour vous demander
        dès qu&apos;une information manque.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        rows={6}
        placeholder="Ex. : Rééducation du genou droit après reconstruction du ligament croisé antérieur, 30 séances..."
        className="mt-3 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled || text.trim().length === 0}
          onClick={() => onAnalyze(text.trim())}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Analyser l&apos;ordonnance
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onSkip}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
        >
          Remplir manuellement
        </button>
      </div>
    </div>
  );
}
