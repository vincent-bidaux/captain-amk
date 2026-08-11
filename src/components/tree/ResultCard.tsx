import {
  formatEuros,
  ifsMontant,
  lettreCleDescription,
  tarifActe,
} from "@/lib/ngap/tree";
import type { Acte } from "@/lib/ngap/types";

function InfoBlock({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        {title}
      </p>
      <ul className="mt-1 list-inside list-disc space-y-0.5 text-sm text-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function ResultCard({
  acte,
  onReset,
}: {
  acte: Acte;
  onReset: () => void;
}) {
  const tarif = tarifActe(acte);
  const ifsEligible = acte.ifs?.eligible === true || acte.ifs?.eligible === "conditionnel";

  return (
    <div className="rounded-xl border-2 border-accent bg-surface p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">
        Cotation proposée
      </p>
      <p className="mt-1 text-lg font-semibold">{acte.libelle}</p>

      <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
        <div>
          <p className="text-xs text-muted">Lettre-clé / coefficient</p>
          <p className="font-mono text-2xl font-semibold">
            {acte.lettreCle} {acte.coefficient}
          </p>
          {lettreCleDescription(acte.lettreCle) && (
            <p className="text-xs text-muted">{lettreCleDescription(acte.lettreCle)}</p>
          )}
        </div>
        <div>
          <p className="text-xs text-muted">Tarif (métropole)</p>
          <p className="text-2xl font-semibold">{formatEuros(tarif)}</p>
        </div>
        {ifsEligible && (
          <div>
            <p className="text-xs text-muted">+ IFS</p>
            <p className="text-2xl font-semibold text-gold">
              {formatEuros(ifsMontant())}
            </p>
          </div>
        )}
      </div>

      {acte.ifs?.condition && (
        <p className="mt-2 text-xs text-muted">
          IFS : {acte.ifs.condition}
        </p>
      )}

      {acte.referentiel?.soumis && (
        <div className="mt-3 rounded-md border border-gold/40 bg-gold/10 px-3 py-2 text-sm">
          <p className="font-medium text-gold">Acte soumis à référentiel HAS</p>
          {acte.referentiel.traitementHabituel && (
            <p className="text-xs text-foreground">
              Traitement habituel : {acte.referentiel.traitementHabituel}
            </p>
          )}
          {acte.referentiel.accordPrealable && (
            <p className="text-xs text-foreground">
              Accord préalable : {acte.referentiel.accordPrealable}
            </p>
          )}
        </div>
      )}

      {acte.condition && <p className="mt-3 text-sm text-foreground">{acte.condition}</p>}
      {acte.note && <p className="mt-2 text-sm text-muted">{acte.note}</p>}

      <InfoBlock title="Exclusions" items={acte.exclusions ?? []} />
      <InfoBlock title="Non-indications" items={acte.nonIndications ?? []} />
      <InfoBlock title="Contre-indications" items={acte.contreIndications ?? []} />

      <p className="mt-4 text-xs text-muted">
        Cette proposition reste sous la responsabilité du praticien — à
        vérifier avant facturation.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
      >
        Nouvelle cotation
      </button>
    </div>
  );
}
