/**
 * Best-effort removal of a detected patient name from free text before it is
 * persisted. This is NOT a guarantee of anonymization: other identifying
 * details (date of birth, address, social security number...) may still be
 * present in the text and are not detected or removed. The UI must make this
 * limitation visible to the practitioner before they save a session.
 */
export function redactPatientName(
  text: string,
  patientName: { prenom: string | null; nom: string | null } | null,
): string {
  if (!patientName) return text;

  let redacted = text;
  for (const part of [patientName.prenom, patientName.nom]) {
    if (!part || part.trim().length < 2) continue;
    const escaped = part.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    redacted = redacted.replace(new RegExp(`\\b${escaped}\\b`, "gi"), "[patient]");
  }
  return redacted;
}
