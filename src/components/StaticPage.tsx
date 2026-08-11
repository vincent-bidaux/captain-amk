import Link from "next/link";
import type { ReactNode } from "react";

export default function StaticPage({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
      <Link href="/" className="mb-4 text-sm text-muted hover:text-foreground hover:underline">
        ← Retour à Captain AMK
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      <div className="mt-6 flex flex-col gap-6 text-sm leading-relaxed text-foreground">
        {children}
      </div>
    </div>
  );
}
