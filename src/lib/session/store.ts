import { getStore } from "@netlify/blobs";
import type { SavedSession, SavedSessionSummary } from "./types";

function sessionsStore() {
  return getStore("captain-amk-sessions");
}

export async function listSessions(): Promise<SavedSessionSummary[]> {
  const store = sessionsStore();
  const { blobs } = await store.list();
  const sessions = await Promise.all(
    blobs.map(async (b) => {
      const session = await store.get(b.key, { type: "json" });
      return session as SavedSession | null;
    }),
  );
  return sessions
    .filter((s): s is SavedSession => s !== null)
    .map((s) => ({
      id: s.id,
      title: s.title,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      archived: s.archived,
      patientDisplay: s.patientName
        ? [s.patientName.prenom, s.patientName.nom].filter(Boolean).join(" ") || null
        : null,
    }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getSession(id: string): Promise<SavedSession | null> {
  const store = sessionsStore();
  const session = await store.get(id, { type: "json" });
  return (session as SavedSession | null) ?? null;
}

export async function putSession(session: SavedSession): Promise<void> {
  const store = sessionsStore();
  await store.setJSON(session.id, session);
}

export async function deleteSession(id: string): Promise<void> {
  const store = sessionsStore();
  await store.delete(id);
}
