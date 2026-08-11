"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import BreadcrumbStep from "@/components/tree/BreadcrumbStep";
import ResultCard from "@/components/tree/ResultCard";
import { notifySessionsChanged } from "@/lib/session/events";
import { getActeForNode, getNode } from "@/lib/ngap/tree";
import { isFeuille } from "@/lib/ngap/types";
import type { SavedSession } from "@/lib/session/types";

export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [session, setSession] = useState<SavedSession | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/sessions/${id}`)
      .then((res) => (res.ok ? res.json() : Promise.resolve({ session: null })))
      .then((data) => {
        if (!cancelled) setSession(data.session ?? null);
      })
      .catch(() => {
        if (!cancelled) setSession(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleArchive() {
    if (!session) return;
    await fetch(`/api/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: !session.archived }),
    });
    setSession({ ...session, archived: !session.archived });
    notifySessionsChanged();
  }

  async function handleDelete() {
    if (!window.confirm("Supprimer définitivement cette session ?")) return;
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    notifySessionsChanged();
    router.push("/");
  }

  if (session === undefined) {
    return (
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 text-sm text-muted">
        Chargement…
      </div>
    );
  }

  if (session === null) {
    return (
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 text-sm text-muted">
        Session introuvable ou supprimée.
      </div>
    );
  }

  const node = getNode(session.currentNodeId);
  const leaf = isFeuille(node);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">{session.title}</p>
          <p className="text-xs text-muted">
            {new Date(session.createdAt).toLocaleString("fr-FR")}
            {session.archived && " · archivée"}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={handleArchive}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface"
          >
            {session.archived ? "Désarchiver" : "Archiver"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10"
          >
            Supprimer
          </button>
        </div>
      </div>

      {session.path.length > 0 && (
        <div className="mb-4 flex flex-col gap-0 border-b border-border pb-2">
          {session.path.map((step, i) => (
            <BreadcrumbStep
              key={`${step.nodeId}-${i}`}
              step={step}
              readOnly
              showConnector={i > 0}
            />
          ))}
        </div>
      )}

      {leaf ? (
        <ResultCard
          acte={getActeForNode(session.currentNodeId)}
          path={session.path}
          currentNodeId={session.currentNodeId}
          readOnly
          ordonnanceHeader={{
            patientName: session.patientName ?? null,
            medecinNom: session.medecinNom ?? null,
            medecinTelephone: session.medecinTelephone ?? null,
            dateOrdonnance: session.dateOrdonnance ?? null,
            prescription: session.prescription ?? null,
          }}
        />
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-surface p-5">
          <p className="text-sm font-medium">Session incomplète</p>
          <p className="mt-1 text-sm text-muted">
            Cette session s&apos;est arrêtée à la question :{" "}
            <span className="font-medium text-foreground">
              {"question" in node ? node.question : ""}
            </span>
            . Elle n&apos;a pas été poursuivie jusqu&apos;à une cotation.
          </p>
        </div>
      )}
    </div>
  );
}
