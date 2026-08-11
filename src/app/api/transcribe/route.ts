import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

export const runtime = "nodejs";

const ALLOWED_MEDIA_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const TranscribeSchema = z.object({
  transcription: z
    .string()
    .describe(
      "Transcription fidèle du texte de l'ordonnance. Passages illisibles entre crochets [illisible] ou [incertain: ...].",
    ),
});

const SYSTEM_PROMPT = `Tu transcris fidèlement le texte d'une ordonnance médicale de kinésithérapie française à partir d'une image ou d'un PDF.

Retranscris tout le texte pertinent à la prescription (indication médicale, localisation, contexte chirurgical éventuel, nombre de séances, toute précision du médecin) tel qu'il apparaît, sans reformuler ni interpréter. N'invente rien : si un passage est illisible ou incertain, indique-le entre crochets plutôt que de deviner. Ignore l'en-tête administratif (coordonnées du cabinet, logo) sauf s'il contient une information médicale utile.`;

interface TranscribeRequestBody {
  mediaType?: string;
  dataBase64?: string;
}

export async function POST(req: NextRequest) {
  let body: TranscribeRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const { mediaType, dataBase64 } = body;
  if (!mediaType || !dataBase64 || !ALLOWED_MEDIA_TYPES.has(mediaType)) {
    return NextResponse.json(
      { error: "Fichier manquant ou type non supporté (image JPEG/PNG/WebP ou PDF)." },
      { status: 400 },
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY n'est pas configurée côté serveur." },
      { status: 500 },
    );
  }

  const client = new Anthropic();

  const fileBlock =
    mediaType === "application/pdf"
      ? ({
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: dataBase64 },
        } as const)
      : ({
          type: "image",
          source: {
            type: "base64",
            media_type: mediaType as "image/jpeg" | "image/png" | "image/webp",
            data: dataBase64,
          },
        } as const);

  try {
    const response = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 2000,
      thinking: { type: "disabled" },
      output_config: {
        effort: "medium",
        format: zodOutputFormat(TranscribeSchema),
      },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            fileBlock,
            { type: "text", text: "Transcris le texte de cette ordonnance." },
          ],
        },
      ],
    });

    const parsed = response.parsed_output;
    if (!parsed) {
      return NextResponse.json({ error: "Réponse IA non structurée" }, { status: 502 });
    }

    return NextResponse.json({
      transcription: parsed.transcription,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    });
  } catch (err) {
    console.error("Erreur appel Opus 5 (/api/transcribe)", err);
    return NextResponse.json(
      { error: "Erreur lors de la transcription par le modèle." },
      { status: 502 },
    );
  }
}
