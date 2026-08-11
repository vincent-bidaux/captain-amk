import IconPlaceholder from "./IconPlaceholder";
import type { PathStep } from "@/lib/ngap/types";

export default function BreadcrumbStep({
  step,
  onRewind,
}: {
  step: PathStep;
  onRewind: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRewind}
      className="group flex w-full items-start gap-3 rounded-lg border border-transparent px-2 py-2 text-left transition-colors hover:border-border hover:bg-surface"
      title="Reprendre l'arbre à partir de cette étape"
    >
      <IconPlaceholder description={step.chosenLabel} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted">
          {step.question}
          {step.source === "ia" && (
            <span className="rounded-sm bg-accent/20 px-1 py-0.5 text-[9px] font-semibold normal-case tracking-normal text-accent">
              IA
            </span>
          )}
        </p>
        <p className="text-sm font-medium text-foreground">{step.chosenLabel}</p>
        {step.chosenAide && (
          <p className="mt-0.5 text-xs text-muted">{step.chosenAide}</p>
        )}
      </div>
      <span className="mt-1 shrink-0 text-xs text-muted opacity-0 transition-opacity group-hover:opacity-100">
        reprendre ici →
      </span>
    </button>
  );
}
