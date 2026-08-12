"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import {
  formatEuros,
  ifsMontant,
  lettreCleDescription,
  tarifActe,
} from "@/lib/ngap/tree";
import OrdonnanceHeaderCard from "./OrdonnanceHeaderCard";
import SaveSessionBox from "./SaveSessionBox";
import type { AiModel } from "@/lib/ngap/pricing";
import type { Acte, OrdonnanceHeaderData, PathStep } from "@/lib/ngap/types";

function InfoBlock({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {title}
      </p>
      <ul className="mt-1 list-inside list-disc space-y-0.5 text-sm text-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function ResultCard({
  acte,
  path,
  currentNodeId,
  onReset,
  readOnly = false,
  showHeader = true,
  usage,
  aiModel,
  ordonnanceHeader,
}: {
  acte: Acte;
  path: PathStep[];
  currentNodeId: string;
  onReset?: () => void;
  readOnly?: boolean;
  /** Set to false when the ordonnance header is already shown elsewhere on the page. */
  showHeader?: boolean;
  usage?: { inputTokens: number; outputTokens: number };
  aiModel?: AiModel;
  ordonnanceHeader?: OrdonnanceHeaderData;
}) {
  const [resultsCopied, setResultsCopied] = useState(false);
  const tarif = tarifActe(acte);
  const ifsEligible = acte.ifs?.eligible === true || acte.ifs?.eligible === "conditionnel";

  async function handleCopyResults() {
    const lines = [
      acte.libelle,
      `Lettre-clé / coefficient : ${acte.lettreCle} ${acte.coefficient}`,
      `Tarif (métropole) : ${formatEuros(tarif)}`,
      ifsEligible ? `+ IFS : ${formatEuros(ifsMontant())}` : null,
      acte.referentiel?.soumis ? "Acte soumis à référentiel HAS" : null,
      acte.referentiel?.traitementHabituel
        ? `Traitement habituel : ${acte.referentiel.traitementHabituel}`
        : null,
      acte.referentiel?.accordPrealable
        ? `Accord préalable : ${acte.referentiel.accordPrealable}`
        : null,
    ].filter((line): line is string => line !== null);

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setResultsCopied(true);
      setTimeout(() => setResultsCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — nothing else to do here.
    }
  }

  return (
    <div className="rounded-xl border-2 border-accent bg-surface p-5">
      {showHeader && ordonnanceHeader && <OrdonnanceHeaderCard header={ordonnanceHeader} />}

      <p className="text-xs font-semibold uppercase tracking-wide text-accent">
        Cotation proposée
      </p>
      <p className="mt-1 text-lg font-semibold">{acte.libelle}</p>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
        <div>
          <p className="text-xs text-muted">Lettre-clé / coefficient</p>
          <p className="font-mono text-2xl font-semibold">
            {acte.lettreCle} {acte.coefficient}
          </p>
          {lettreCleDescription(acte.lettreCle) && (
            <p className="text-xs text-muted">{lettreCleDescription(acte.lettreCle)}</p>
          )}
        </div>
        <div>
          <p className="text-xs text-muted">Tarif (métropole)</p>
          <p className="text-2xl font-semibold">{formatEuros(tarif)}</p>
        </div>
        {ifsEligible && (
          <div>
            <p className="text-xs text-muted">+ IFS</p>
            <p className="text-2xl font-semibold text-gold">
              {formatEuros(ifsMontant())}
            </p>
          </div>
        )}
      </div>

      {acte.ifs?.condition && (
        <p className="mt-2 text-xs text-muted">
          IFS : {acte.ifs.condition}
        </p>
      )}

      {acte.referentiel?.soumis && (
        <div className="mt-3 rounded-md border border-gold/40 bg-gold/10 px-3 py-2 text-sm">
          <p className="font-medium text-gold">Acte soumis à référentiel HAS</p>
          {acte.referentiel.traitementHabituel && (
            <p className="text-xs text-foreground">
              Traitement habituel : {acte.referentiel.traitementHabituel}
            </p>
          )}
          {acte.referentiel.accordPrealable && (
            <p className="text-xs text-foreground">
              Accord préalable : {acte.referentiel.accordPrealable}
            </p>
          )}
        </div>
      )}

      {acte.condition && <p className="mt-3 text-sm text-foreground">{acte.condition}</p>}
      {acte.note && <p className="mt-2 text-sm text-muted">{acte.note}</p>}

      <InfoBlock title="Exclusions" items={acte.exclusions ?? []} />
      <InfoBlock title="Non-indications" items={acte.nonIndications ?? []} />
      <InfoBlock title="Contre-indications" items={acte.contreIndications ?? []} />

      <p className="mt-4 text-xs text-muted">
        Cette proposition reste sous la responsabilité du praticien — à
        vérifier avant facturation.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleCopyResults}
          className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-neutral-100 dark:text-neutral-900"
        >
          {resultsCopied ? (
            <>
              <Check className="h-4 w-4" />
              Copié
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copier les résultats
            </>
          )}
        </button>
        {!readOnly && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
          >
            Nouvelle cotation
          </button>
        )}
      </div>

      {!readOnly && (
        <SaveSessionBox
          defaultTitle={`${acte.lettreCle} ${acte.coefficient} — ${new Date().toLocaleDateString("fr-FR")}`}
          path={path}
          currentNodeId={currentNodeId}
          usage={usage}
          aiModel={aiModel}
        />
      )}
    </div>
  );
}
