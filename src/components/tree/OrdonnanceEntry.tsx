"use client";

import { Paperclip } from "lucide-react";
import { useRef, useState } from "react";
import { prepareUpload } from "@/lib/image/prepareUpload";

export default function OrdonnanceEntry({
  onAnalyze,
  onSkip,
  onTranscribeUsage,
  disabled,
}: {
  onAnalyze: (text: string) => void;
  onSkip: () => void;
  onTranscribeUsage: (usage: { inputTokens: number; outputTokens: number }) => void;
  disabled: boolean;
}) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const { mediaType, dataBase64 } = await prepareUpload(file);
      const res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaType, dataBase64 }),
      });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error ?? "Erreur lors de la transcription.");
        return;
      }
      onTranscribeUsage(data.usage);
      setText(data.transcription);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erreur inattendue.");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (file) void handleFile(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled && !uploading) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`rounded-xl border p-5 transition-colors ${
        dragging ? "border-accent bg-accent/10" : "border-border bg-surface"
      }`}
    >
      <p className="text-lg font-semibold">Texte de l&apos;ordonnance</p>
      <p className="mt-1 text-sm text-muted">
        Collez le texte de la prescription, ou importez / glissez-déposez une
        photo ou un PDF. Captain AMK propose une cotation en suivant l&apos;arbre
        de décision et s&apos;arrête pour vous demander dès qu&apos;une
        information manque.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleFileChange}
          disabled={disabled || uploading}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
        >
          {uploading ? (
            "Transcription en cours…"
          ) : (
            <>
              <Paperclip className="h-4 w-4" />
              Importer une photo / un PDF (ou glissez-déposez)
            </>
          )}
        </button>
      </div>
      {uploadError && <p className="mt-2 text-xs text-danger">{uploadError}</p>}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled || uploading}
        rows={6}
        placeholder="Ex. : Rééducation du genou droit après reconstruction du ligament croisé antérieur, 30 séances..."
        className="mt-3 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent disabled:opacity-60"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled || uploading || text.trim().length === 0}
          onClick={() => onAnalyze(text.trim())}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Analyser l&apos;ordonnance
        </button>
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={onSkip}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
        >
          Remplir manuellement
        </button>
      </div>
    </div>
  );
}
