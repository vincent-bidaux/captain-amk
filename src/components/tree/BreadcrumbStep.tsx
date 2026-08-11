import { Pencil } from "lucide-react";
import IconPlaceholder from "./IconPlaceholder";
import type { PathStep } from "@/lib/ngap/types";

/**
 * Réponses génériques qui ne veulent rien dire hors contexte (« Non » à quelle question ?) —
 * pour celles-ci l'icône doit représenter le sujet de la question, pas la réponse brute.
 * Les autres libellés (ex. « Hanche ou cuisse », « Après reconstruction du LCA ») sont déjà
 * suffisamment spécifiques pour servir directement de sujet d'icône.
 */
const GENERIC_ANSWER_LABELS = new Set([
  "Oui",
  "Non",
  "Sans chirurgie",
  "Avec chirurgie",
  "Opérée",
  "Non opérée",
  "Individuelle",
]);

function iconTopic(step: PathStep): string {
  return GENERIC_ANSWER_LABELS.has(step.chosenLabel) ? step.question : step.chosenLabel;
}

function Connector() {
  return (
    <div
      className="flex w-[108px] shrink-0 justify-center py-1 pl-2"
      aria-hidden="true"
    >
      <svg width="14" height="20" viewBox="0 0 14 20" fill="none" className="text-gold">
        <line x1="7" y1="0" x2="7" y2="13" stroke="currentColor" strokeWidth="2" />
        <path
          d="M2 12L7 19L12 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export default function BreadcrumbStep({
  step,
  onRewind,
  readOnly = false,
  showConnector = false,
}: {
  step: PathStep;
  onRewind?: () => void;
  readOnly?: boolean;
  showConnector?: boolean;
}) {
  const content = (
    <>
      <IconPlaceholder description={iconTopic(step)} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
          {step.question}
          {step.source === "auto" && (
            <span className="rounded-sm bg-accent/20 px-1 py-0.5 text-[9px] font-semibold normal-case tracking-normal text-accent">
              auto
            </span>
          )}
        </p>
        <p className="text-sm font-medium text-foreground">{step.chosenLabel}</p>
        {step.chosenAide && (
          <p className="mt-0.5 text-xs text-muted">{step.chosenAide}</p>
        )}
      </div>
    </>
  );

  if (readOnly) {
    return (
      <>
        {showConnector && <Connector />}
        <div className="flex w-full items-start gap-3 rounded-lg px-2 py-2">
          {content}
        </div>
      </>
    );
  }

  return (
    <>
      {showConnector && <Connector />}
      <button
        type="button"
        onClick={onRewind}
        className="group relative flex w-full cursor-pointer items-start gap-3 rounded-lg border border-transparent px-2 py-2 text-left transition-colors hover:border-accent/40 hover:bg-accent/5"
        title="Modifier le choix fait à cette étape"
      >
        {content}
        <span className="pointer-events-none absolute right-2 top-2 flex items-center gap-1 text-xs font-semibold text-accent opacity-0 transition-opacity group-hover:opacity-100">
          <Pencil className="h-3.5 w-3.5" />
          Modifier le choix
        </span>
      </button>
    </>
  );
}
