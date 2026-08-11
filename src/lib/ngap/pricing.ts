/** Tarification Opus 5 (claude-opus-5) — $5 / MTok input, $25 / MTok output. */
const INPUT_PER_MTOK_USD = 5;
const OUTPUT_PER_MTOK_USD = 25;
const CACHE_READ_MULTIPLIER = 0.1;
const CACHE_WRITE_MULTIPLIER = 1.25;

export interface Usage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens?: number;
  cacheCreationTokens?: number;
}

export function costUsd(usage: Usage): number {
  const input = (usage.inputTokens * INPUT_PER_MTOK_USD) / 1_000_000;
  const output = (usage.outputTokens * OUTPUT_PER_MTOK_USD) / 1_000_000;
  const cacheRead =
    ((usage.cacheReadTokens ?? 0) * INPUT_PER_MTOK_USD * CACHE_READ_MULTIPLIER) /
    1_000_000;
  const cacheWrite =
    ((usage.cacheCreationTokens ?? 0) * INPUT_PER_MTOK_USD * CACHE_WRITE_MULTIPLIER) /
    1_000_000;
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
