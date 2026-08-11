"use client";

import { useState } from "react";
import type { ReactNode } from "react";

function SidebarContent() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-5">
        <p className="text-lg font-semibold tracking-tight">Captain AMK</p>
        <p className="text-xs text-muted">Cotation NGAP kinésithérapie</p>
      </div>

      <div className="px-3 py-3">
        <button
          type="button"
          className="w-full rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
        >
          + Nouvelle session
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-1">
        <p className="px-1 py-6 text-center text-xs text-muted">
          Aucune session pour l&apos;instant.
        </p>
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

export default function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-full flex-1">
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 border-r border-border bg-surface md:block">
        <SidebarContent />
      </aside>

      {/* Mobile off-canvas sidebar */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-border bg-surface shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex min-h-full flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3 md:hidden">
          <button
            type="button"
            aria-label="Ouvrir le menu"
            onClick={() => setOpen(true)}
            className="rounded-md border border-border px-2 py-1 text-sm"
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
