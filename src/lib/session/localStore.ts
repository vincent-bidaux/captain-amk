"use client";

import type { SavedSession, SavedSessionSummary } from "./types";

const STORAGE_KEY = "captain-amk-sessions";

function readAll(): SavedSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedSession[]) : [];
  } catch {
    return [];
  }
}

function writeAll(sessions: SavedSession[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function listSessions(): SavedSessionSummary[] {
  return readAll()
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

export function getSession(id: string): SavedSession | null {
  return readAll().find((s) => s.id === id) ?? null;
}

export function putSession(session: SavedSession): void {
  const all = readAll();
  const idx = all.findIndex((s) => s.id === session.id);
  if (idx >= 0) all[idx] = session;
  else all.push(session);
  writeAll(all);
}

export function patchSession(id: string, patch: Partial<SavedSession>): void {
  const all = readAll();
  const idx = all.findIndex((s) => s.id === id);
  if (idx === -1) return;
  all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
  writeAll(all);
}

export function deleteSession(id: string): void {
  writeAll(readAll().filter((s) => s.id !== id));
}
