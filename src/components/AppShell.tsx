"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import SessionsSidebar from "./SessionsSidebar";
import { WorkStateProvider, useWorkState } from "@/lib/ui/workState";

function AppShellInner({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { expanded } = useWorkState();

  return (
    <div className="flex min-h-full flex-1">
      {/* Desktop docked sidebar — seulement une fois le travail démarré */}
      {expanded && (
        <aside className="hidden w-72 shrink-0 border-r border-border bg-surface md:block">
          <SessionsSidebar />
        </aside>
      )}

      {/* Off-canvas sidebar : toujours sur mobile, et sur desktop tant que replié */}
      {open && (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            aria-label="Fermer le menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-border bg-surface shadow-xl">
            <SessionsSidebar onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-h-full flex-1 flex-col">
        <header
          className={`flex items-center gap-3 border-b border-border bg-surface px-4 py-3 ${
            expanded ? "md:hidden" : ""
          }`}
        >
          <button
            type="button"
            aria-label="Ouvrir le menu"
            onClick={() => setOpen(true)}
            className="cursor-pointer rounded-md border border-border px-2 py-1 text-sm"
          >
            ☰
          </button>
          <p className="text-sm font-semibold">Captain AMK</p>
        </header>

        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <WorkStateProvider>
      <AppShellInner>{children}</AppShellInner>
    </WorkStateProvider>
  );
}
