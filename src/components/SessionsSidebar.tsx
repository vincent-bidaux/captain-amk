"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { SavedSessionSummary } from "@/lib/session/types";

export default function SessionsSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sessions, setSessions] = useState<SavedSessionSummary[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/sessions");
      const data = await res.json();
      setSessions(res.ok ? (data.sessions ?? []) : []);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    // Re-fetch whenever we navigate — catches sessions saved/renamed elsewhere.
  }, [pathname, refresh]);

  async function handleArchive(e: React.MouseEvent, id: string, archived: boolean) {
    e.preventDefault();
    e.stopPropagation();
    await fetch(`/api/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: !archived }),
    });
    void refresh();
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Supprimer définitivement cette session ?")) return;
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    if (pathname === `/sessions/${id}`) router.push("/");
    void refresh();
  }

  const visible = sessions.filter((s) => s.archived === showArchived);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-5">
        <p className="text-lg font-semibold tracking-tight">Captain AMK</p>
        <p className="text-xs text-muted">Cotation NGAP kinésithérapie</p>
      </div>

      <div className="px-3 py-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="block w-full rounded-lg bg-accent px-3 py-2 text-center text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          + Nouvelle session
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-1">
        {loading ? (
          <p className="px-1 py-6 text-center text-xs text-muted">Chargement…</p>
        ) : visible.length === 0 ? (
          <p className="px-1 py-6 text-center text-xs text-muted">
            {showArchived ? "Aucune session archivée." : "Aucune session pour l'instant."}
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {visible.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/sessions/${s.id}`}
                  onClick={onNavigate}
                  className={`group flex items-center justify-between gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-background ${
                    pathname === `/sessions/${s.id}` ? "bg-background" : ""
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate">{s.title}</span>
                  <span className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      type="button"
                      title={s.archived ? "Désarchiver" : "Archiver"}
                      onClick={(e) => handleArchive(e, s.id, s.archived)}
                      className="rounded p-1 text-xs text-muted hover:text-foreground"
                    >
                      {s.archived ? "📤" : "📦"}
                    </button>
                    <button
                      type="button"
                      title="Supprimer"
                      onClick={(e) => handleDelete(e, s.id)}
                      className="rounded p-1 text-xs text-muted hover:text-danger"
                    >
                      🗑
                    </button>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {sessions.some((s) => s.archived) && (
          <button
            type="button"
            onClick={() => setShowArchived((v) => !v)}
            className="mt-2 w-full px-1 py-1 text-center text-xs text-muted hover:text-foreground"
          >
            {showArchived ? "← Sessions actives" : "Voir les archivées"}
          </button>
        )}
      </nav>

      <div className="border-t border-border px-4 py-3">
        <p className="text-[11px] leading-snug text-muted">
          Aucune donnée personnelle patient n&apos;est conservée. La cotation
          reste sous la responsabilité du praticien.
        </p>
      </div>
    </div>
  );
}
