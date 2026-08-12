"use client";

import { Archive, ArchiveRestore, ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Logo from "@/components/Logo";
import { SESSIONS_CHANGED_EVENT, notifySessionsChanged } from "@/lib/session/events";
import { deleteSession, listSessions, patchSession } from "@/lib/session/localStore";
import { APP_VERSION } from "@/lib/version";
import { useWorkState } from "@/lib/ui/workState";
import type { SavedSessionSummary } from "@/lib/session/types";

const DESCRIPTION =
  "Cotation NGAP en 1 clic pour kinésithérapeutes — AMK, AMS, AMC, majorations et indemnités";

export default function SessionsSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { expanded } = useWorkState();
  const [sessions, setSessions] = useState<SavedSessionSummary[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setSessions(listSessions());
    setLoading(false);
  }, []);

  useEffect(() => {
    // localStorage n'existe pas côté serveur — cette lecture ne peut se faire qu'après montage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [pathname, refresh]);

  useEffect(() => {
    // Also re-fetch on same-page mutations (e.g. archiving from the detail page).
    window.addEventListener(SESSIONS_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(SESSIONS_CHANGED_EVENT, refresh);
  }, [refresh]);

  function handleArchive(e: React.MouseEvent, id: string, archived: boolean) {
    e.preventDefault();
    e.stopPropagation();
    patchSession(id, { archived: !archived });
    notifySessionsChanged();
    refresh();
  }

  function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Supprimer définitivement cette session ?")) return;
    deleteSession(id);
    notifySessionsChanged();
    if (pathname === `/sessions/${id}`) router.push("/");
    refresh();
  }

  const visible = sessions.filter((s) => s.archived === showArchived);

  return (
    <div className="flex h-full flex-col">
      <Link
        href="/"
        onClick={onNavigate}
        className="flex flex-col items-center gap-2 border-b border-border px-4 py-5 text-center transition-colors hover:bg-background"
      >
        {/* Le logo n'apparaît ici qu'une fois le travail démarré : sur l'accueil replié,
            il est déjà affiché en grand au centre — jamais les deux à la fois. */}
        {expanded && (
          <div className="mx-auto w-[calc(100%/1.75)]">
            <Logo size="full" className="rounded-md" />
          </div>
        )}
        <div>
          <p className="text-lg font-semibold tracking-tight">Captain AMK</p>
          <p className="text-xs text-muted">{DESCRIPTION}</p>
        </div>
      </Link>

      <div className="px-3 py-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="block w-full rounded-lg bg-accent px-3 py-2 text-center text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          + Nouvelle session
        </Link>
      </div>

      <nav className="min-h-[5.625rem] flex-1 overflow-y-auto px-3 py-1">
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
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{s.title}</span>
                    {s.patientDisplay && (
                      <span className="block truncate text-xs text-muted">
                        {s.patientDisplay}
                      </span>
                    )}
                  </span>
                  <span className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      type="button"
                      title={s.archived ? "Désarchiver" : "Archiver"}
                      onClick={(e) => handleArchive(e, s.id, s.archived)}
                      className="rounded p-1 text-muted hover:text-foreground"
                    >
                      {s.archived ? (
                        <ArchiveRestore className="h-3.5 w-3.5" />
                      ) : (
                        <Archive className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      title="Supprimer"
                      onClick={(e) => handleDelete(e, s.id)}
                      className="rounded p-1 text-muted hover:text-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {(showArchived || sessions.some((s) => s.archived)) && (
          <button
            type="button"
            onClick={() => setShowArchived((v) => !v)}
            className="mt-2 flex w-full items-center justify-center gap-1 px-1 py-1 text-center text-xs text-muted hover:text-foreground"
          >
            {showArchived && <ArrowLeft className="h-3.5 w-3.5" />}
            {showArchived ? "Sessions actives" : "Voir les archivées"}
          </button>
        )}
      </nav>

      <div className="border-t border-border px-4 py-3">
        <p className="text-[11px] leading-snug text-muted">
          Version bêta : les sessions sont enregistrées uniquement sur cet
          appareil (pas de compte, pas de serveur central), et aucune donnée
          patient n&apos;est conservée. La cotation reste sous la
          responsabilité du praticien.
        </p>
        <div className="mt-2 flex items-center gap-3 text-[11px] text-muted">
          <Link href="/aide" onClick={onNavigate} className="hover:text-foreground hover:underline">
            Aide
          </Link>
          <Link href="/sources" onClick={onNavigate} className="hover:text-foreground hover:underline">
            Sources
          </Link>
        </div>
        <p className="mt-2 text-[11px] text-muted">
          <Link href="/changelog" onClick={onNavigate} className="hover:text-foreground hover:underline">
            v{APP_VERSION}
          </Link>{" "}
          — Par Vincent Bidaux, La Rochelle
        </p>
      </div>
    </div>
  );
}
