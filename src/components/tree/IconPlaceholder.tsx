export default function IconPlaceholder({ description }: { description: string }) {
  return (
    <div
      className="flex h-[100px] w-[100px] shrink-0 items-center justify-center rounded-md border border-border bg-surface p-2 text-center text-xs leading-tight text-muted"
      title={`icone de ${description}`}
    >
      icone de {description}
    </div>
  );
}
