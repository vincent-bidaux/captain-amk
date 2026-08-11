import { formatUsd } from "@/lib/ngap/pricing";

export default function AiCostBanner({ costUsd = 0 }: { costUsd?: number }) {
  return (
    <div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted">
      <span>Coût de cette session</span>
      <span className="font-mono font-medium text-foreground">
        {formatUsd(costUsd)}
      </span>
    </div>
  );
}
