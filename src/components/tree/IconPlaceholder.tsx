export default function IconPlaceholder({ description }: { description: string }) {
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-surface p-1 text-center text-[7px] leading-tight text-muted"
      title={`icone de ${description}`}
    >
      icone de {description}
    </div>
  );
}
