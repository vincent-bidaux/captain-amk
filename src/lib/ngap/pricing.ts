export type AiModel = "claude-sonnet-5" | "claude-opus-5";

/** Sonnet 5 par défaut : moins cher, largement suffisant pour une classification bornée par
 *  question. Opus 5 reste proposé au praticien pour les cas où il préfère plus de prudence. */
export const DEFAULT_AI_MODEL: AiModel = "claude-sonnet-5";

export const AI_MODELS: { value: AiModel; label: string; description: string }[] = [
  { value: "claude-sonnet-5", label: "Sonnet 5", description: "Par défaut — rapide et moins cher" },
  { value: "claude-opus-5", label: "Opus 5", description: "Plus prudent sur les cas complexes, plus cher" },
];

export function isAiModel(value: unknown): value is AiModel {
  return value === "claude-sonnet-5" || value === "claude-opus-5";
}

/** Tarifs officiels par MTok (prix catalogue, pas le tarif d'introduction Sonnet qui expire le
 *  31/08/2026 — un prix affiché à l'utilisateur ne doit pas devenir silencieusement faux). */
const PRICING: Record<AiModel, { inputPerMtok: number; outputPerMtok: number }> = {
  "claude-sonnet-5": { inputPerMtok: 3, outputPerMtok: 15 },
  "claude-opus-5": { inputPerMtok: 5, outputPerMtok: 25 },
};
const CACHE_READ_MULTIPLIER = 0.1;
const CACHE_WRITE_MULTIPLIER = 1.25;

export interface Usage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens?: number;
  cacheCreationTokens?: number;
}

export function costUsd(usage: Usage, model: AiModel = DEFAULT_AI_MODEL): number {
  const { inputPerMtok, outputPerMtok } = PRICING[model];
  const input = (usage.inputTokens * inputPerMtok) / 1_000_000;
  const output = (usage.outputTokens * outputPerMtok) / 1_000_000;
  const cacheRead =
    ((usage.cacheReadTokens ?? 0) * inputPerMtok * CACHE_READ_MULTIPLIER) / 1_000_000;
  const cacheWrite =
    ((usage.cacheCreationTokens ?? 0) * inputPerMtok * CACHE_WRITE_MULTIPLIER) / 1_000_000;
  return input + output + cacheRead + cacheWrite;
}

export function formatUsd(n: number): string {
  const decimals = n > 0 && n < 0.01 ? 4 : 2;
  return (
    n.toLocaleString("fr-FR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) + " $"
  );
}
