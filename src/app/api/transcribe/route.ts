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

const SYSTEM_PROMPT = `Tu transcris le texte d'une ordonnance médicale de kinésithérapie française à partir d'une image ou d'un PDF, en ne gardant QUE l'essentiel. Ce document contient des données personnelles et parfois sensibles (numéro de sécurité sociale), donc chaque ligne que tu produis doit se justifier par son utilité pour la cotation NGAP ou pour identifier le dossier. Par défaut, exclus plutôt que d'inclure en cas de doute.

À INCLURE, chacun UNE SEULE FOIS (si l'information apparaît plusieurs fois dans le document — ex. une fois près de l'en-tête, une fois dans une phrase de consentement — ne la transcris qu'une seule fois, sous sa forme la plus claire et la plus courte) :
- Patient : nom, prénom, date de naissance.
- Médecin : nom, prénom, numéro de téléphone.
- Date de l'ordonnance.
- La prescription clinique elle-même : indication médicale, localisation, contexte chirurgical éventuel, nombre de séances, toute précision donnée par le médecin sur le traitement.

À EXCLURE SYSTÉMATIQUEMENT (ne transcris jamais ces éléments même s'ils sont présents) :
- Sexe du patient, numéro INS/NIR (identifiant de sécurité sociale) ou tout autre identifiant administratif du patient.
- Adresse du médecin, sa spécialité/titre (ex. "Médecin généraliste"), numéro AM, numéro RPPS.
- Titre générique du document (ex. "Ordonnance de kinésithérapie").
- Mentions administratives du cabinet (association de gestion agréée, moyens de paiement acceptés, numéro d'urgence, horaires...).
- Bloc de signature et tout ce qui concerne la plateforme de signature électronique (ex. "Signé via Doctolib le ...", identifiant "e-prescription N°...", nom du médecin répété en signature).
- Mentions de consentement, mentions légales ou RGPD (ex. autorisation de consultation par le patient, notice sur le traitement des données par l'assurance maladie, renvoi vers un site comme ameli.fr).
- Numérotation de page (ex. "1/1").
- Éléments purement décoratifs (logo, tampon vide, ligne de séparation).

Exemple du niveau d'exigence attendu — à partir d'une ordonnance source contenant l'en-tête complet du cabinet, un rappel d'identité du patient dans une phrase de consentement, un identifiant de télétransmission, une notice CNAM et une mention "Membre d'une association agréée...", la transcription correcte ne conserve que : le nom et le téléphone du médecin, le nom et la date de naissance du patient, et la phrase clinique de prescription (ex. "Séances de kinésithérapie du rachis complet des 4 membres."). Tout le reste est exclu.

Transcris les informations conservées telles quelles, sans reformuler ni interpréter. N'invente rien : si un passage est illisible ou incertain, indique-le entre crochets plutôt que de deviner.`;

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
      return NextResponse.json({ error: "Réponse non structurée" }, { status: 502 });
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
