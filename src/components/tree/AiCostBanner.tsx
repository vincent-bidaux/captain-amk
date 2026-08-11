import { formatEuros } from "@/lib/ngap/tree";

export default function AiCostBanner({ costEuros = 0 }: { costEuros?: number }) {
  return (
    <div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted">
      <span>Coût IA de cette session</span>
      <span className="font-mono font-medium text-foreground">
        {formatEuros(costEuros)}
      </span>
    </div>
  );
}
