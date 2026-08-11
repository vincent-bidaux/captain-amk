import { AI_MODEL_NAME, formatUsd } from "@/lib/ngap/pricing";

export default function AiCostBanner({
  costUsd = 0,
  usage,
}: {
  costUsd?: number;
  usage?: { inputTokens: number; outputTokens: number };
}) {
  const totalTokens = usage ? usage.inputTokens + usage.outputTokens : 0;

  return (
    <div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted">
      <span>
        Coût de cette session — {AI_MODEL_NAME}
        {totalTokens > 0 && ` — ${totalTokens.toLocaleString("fr-FR")} tokens`}
      </span>
      <span className="font-mono font-medium text-foreground">
        {formatUsd(costUsd)}
      </span>
    </div>
  );
}
