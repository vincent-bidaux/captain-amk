"use client";

import { useState } from "react";
import AskDoctorBox from "./AskDoctorBox";
import type { ArbreOption, QuestionNoeud } from "@/lib/ngap/types";

export default function QuestionCard({
  node,
  onChoose,
}: {
  node: QuestionNoeud;
  onChoose: (option: ArbreOption) => void;
}) {
  const [dontKnow, setDontKnow] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-lg font-semibold">{node.question}</p>
      {node.aide && <p className="mt-1 text-sm text-muted">{node.aide}</p>}

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {node.options.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => onChoose(option)}
            className="rounded-lg border border-border bg-background px-4 py-3 text-left text-sm font-medium transition-colors hover:border-accent hover:bg-accent/10"
          >
            {option.label}
            {option.aide && (
              <span className="mt-1 block text-xs font-normal text-muted">
                {option.aide}
              </span>
            )}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setDontKnow((v) => !v)}
        className="mt-3 w-full rounded-lg border border-dashed border-border px-4 py-2.5 text-sm text-muted transition-colors hover:border-muted hover:text-foreground"
      >
        Je ne sais pas répondre
      </button>

      {dontKnow && (
        <AskDoctorBox
          question={node.question}
          optionLabels={node.options.map((o) => o.label)}
          onClose={() => setDontKnow(false)}
        />
      )}
    </div>
  );
}
