"use client";

import { ScanLine } from "lucide-react";
import { DEMO_ORDONNANCES } from "@/data/demoOrdonnances";
import type { DemoOrdonnance } from "@/data/demoOrdonnances";

export default function DemoSection({
  selectedDemo,
  onSelectDemo,
  onScan,
  disabled,
}: {
  selectedDemo: DemoOrdonnance | null;
  onSelectDemo: (demo: DemoOrdonnance) => void;
  onScan: () => void;
  disabled: boolean;
}) {
  return (
    <div className="mb-4 rounded-xl border border-accent/40 bg-accent/10 p-5">
      <p className="text-sm font-semibold text-accent">Mode test</p>
      <p className="mt-1 text-sm text-foreground">
        Vous découvrez Captain AMK ? Cliquez sur une ordonnance de démonstration pour voir
        l&apos;app en action, sans donnée réelle.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {DEMO_ORDONNANCES.map((demo) => (
          <button
            key={demo.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectDemo(demo)}
            className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              selectedDemo?.id === demo.id
                ? "border-accent bg-white text-black"
                : "border-transparent bg-white text-black hover:bg-neutral-100"
            }`}
          >
            <span className="font-medium">{demo.title}</span>
            {demo.note && (
              <span className="mt-0.5 block text-xs text-neutral-600">{demo.note}</span>
            )}
          </button>
        ))}
      </div>

      {selectedDemo && (
        <button
          type="button"
          onClick={onScan}
          disabled={disabled}
          className="mt-3 flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ScanLine className="h-4 w-4" />
          Scanner « {selectedDemo.title} »
        </button>
      )}
    </div>
  );
}
