import type { ReactNode } from "react";

export default function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent">
      {children}
    </p>
  );
}
