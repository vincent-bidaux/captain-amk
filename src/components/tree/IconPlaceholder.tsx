export default function IconPlaceholder({ description }: { description: string }) {
  return (
    <div
      className="flex h-[100px] w-[100px] shrink-0 items-center justify-center overflow-hidden rounded-md bg-blue-900 p-3"
      title={description}
    >
      <span className="text-balance text-center font-condensed text-base font-semibold uppercase leading-tight tracking-wide text-blue-50">
        {description}
      </span>
    </div>
  );
}
