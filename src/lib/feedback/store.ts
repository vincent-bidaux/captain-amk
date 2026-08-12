import { getStore } from "@netlify/blobs";
import type { FeedbackEntry } from "./types";

function feedbackStore() {
  return getStore("captain-amk-feedback");
}

export async function listFeedback(): Promise<FeedbackEntry[]> {
  const store = feedbackStore();
  const { blobs } = await store.list();
  const entries = await Promise.all(
    blobs.map(async (b) => (await store.get(b.key, { type: "json" })) as FeedbackEntry | null),
  );
  return entries
    .filter((e): e is FeedbackEntry => e !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addFeedback(entry: FeedbackEntry): Promise<void> {
  const store = feedbackStore();
  await store.setJSON(entry.id, entry);
}
