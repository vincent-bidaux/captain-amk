"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { notifySessionsChanged } from "@/lib/session/events";
import { putSession } from "@/lib/session/localStore";
import type { AiModel } from "@/lib/ngap/pricing";
import type { PathStep } from "@/lib/ngap/types";
import type { SavedSession } from "@/lib/session/types";

export default function SaveSessionBox({
  defaultTitle,
  path,
  currentNodeId,
  usage,
  aiModel,
}: {
  defaultTitle: string;
  path: PathStep[];
  currentNodeId: string;
  usage?: { inputTokens: number; outputTokens: number };
  aiModel?: AiModel;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(defaultTitle);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    const now = new Date().toISOString();
    const session: SavedSession = {
      id: crypto.randomUUID(),
      title: title.trim() || defaultTitle,
      createdAt: now,
      updatedAt: now,
      archived: false,
      path,
      currentNodeId,
      ...(usage ? { usage } : {}),
      ...(aiModel ? { aiModel } : {}),
    };
    putSession(session);
    setSaved(true);
    notifySessionsChanged();
    router.push(`/sessions/${session.id}`);
  }

  if (saved) {
    return (
      <p className="mt-4 flex items-center gap-1.5 text-sm text-accent">
        <Check className="h-4 w-4" />
        Session enregistrée
      </p>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-border bg-background p-3">
      <p className="text-xs text-muted">
        Seul le cheminement (questions, réponses, justifications) est
        enregistré, uniquement sur cet appareil (version bêta — aucun serveur
        central, aucun autre utilisateur ne peut le voir).
      </p>

      <label className="mt-2 flex items-start gap-2 text-xs text-muted opacity-50">
        <input type="checkbox" checked={false} disabled className="mt-0.5" />
        Enregistrer aussi le nom du patient et la prescription avec cette
        session <span className="italic">(désactivé pendant la bêta)</span>
      </label>

      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre de la session"
          className="flex-1 rounded-md border border-border bg-surface px-3 py-1.5 text-sm outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={handleSave}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          Enregistrer la session
        </button>
      </div>
    </div>
  );
}
