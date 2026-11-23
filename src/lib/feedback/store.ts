import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { FeedbackEntry } from "./types";

// Stockage des retours bêta : namespace Cloudflare KV `captain-amk-feedback`,
// lié au Worker sous le nom FEEDBACK_KV (voir wrangler.jsonc). Une clé par retour
// (id UUID), valeur = FeedbackEntry sérialisée en JSON.
async function feedbackStore(): Promise<FeedbackKVNamespace> {
  const { env } = await getCloudflareContext({ async: true });
  return env.FEEDBACK_KV;
}

export async function listFeedback(): Promise<FeedbackEntry[]> {
  const store = await feedbackStore();
  const keys: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await store.list(cursor ? { cursor } : undefined);
    keys.push(...page.keys.map((k) => k.name));
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  const entries = await Promise.all(keys.map((key) => store.get<FeedbackEntry>(key, "json")));
  return entries
    .filter((e): e is FeedbackEntry => e !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addFeedback(entry: FeedbackEntry): Promise<void> {
  const store = await feedbackStore();
  await store.put(entry.id, JSON.stringify(entry));
}
