import type { OrdonnanceHeaderData } from "@/lib/ngap/types";

export default function OrdonnanceHeaderCard({ header }: { header: OrdonnanceHeaderData }) {
  const patient = header.patientName
    ? [header.patientName.prenom, header.patientName.nom].filter(Boolean).join(" ")
    : null;
  const medecin = [header.medecinNom, header.medecinTelephone]
    .filter(Boolean)
    .join(" — ");
  const hasAnyField = patient || medecin || header.dateOrdonnance || header.prescription;
  if (!hasAnyField) return null;

  return (
    <div className="mb-4 rounded-xl border border-border bg-surface p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">
        📄 Dossier
      </p>
      <div className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {header.dateOrdonnance && (
          <div>
            <p className="text-xs text-muted">Date de l&apos;ordonnance</p>
            <p className="text-sm font-medium text-foreground">{header.dateOrdonnance}</p>
          </div>
        )}
        {medecin && (
          <div>
            <p className="text-xs text-muted">Médecin</p>
            <p className="text-sm font-medium text-foreground">{medecin}</p>
          </div>
        )}
        {patient && (
          <div>
            <p className="text-xs text-muted">Patient</p>
            <p className="text-sm font-medium text-foreground">{patient}</p>
          </div>
        )}
        {header.prescription && (
          <div className="sm:col-span-2">
            <p className="text-xs text-muted">Prescription</p>
            <p className="whitespace-pre-wrap text-sm text-foreground">{header.prescription}</p>
          </div>
        )}
      </div>
    </div>
  );
}
