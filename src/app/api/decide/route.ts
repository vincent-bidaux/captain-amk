import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { getNode } from "@/lib/ngap/tree";
import { isQuestion } from "@/lib/ngap/types";
import { DEFAULT_AI_MODEL, isAiModel } from "@/lib/ngap/pricing";
import type { AiModel } from "@/lib/ngap/pricing";

export const runtime = "nodejs";

const DecideSchema = z.object({
  answered: z
    .boolean()
    .describe(
      "true si le texte de l'ordonnance permet de répondre avec confiance à la question, false sinon.",
    ),
  optionIndex: z
    .number()
    .int()
    .min(0)
    .describe(
      "Index (0-based) de l'option choisie dans la liste fournie. Sans importance si answered=false, mettre 0.",
    ),
  justification: z
    .string()
    .describe(
      "1 à 2 phrases en français expliquant la décision, en citant si possible les mots de l'ordonnance. Si answered=false, explique quelle information manque.",
    ),
  patientPrenom: z
    .string()
    .nullable()
    .describe(
      "Prénom du patient détecté dans le texte, ou null si absent ou si l'extraction n'est pas demandée.",
    ),
  patientNom: z
    .string()
    .nullable()
    .describe(
      "Nom de famille du patient détecté dans le texte, ou null si absent ou si l'extraction n'est pas demandée.",
    ),
  medecinNom: z
    .string()
    .nullable()
    .describe(
      "Nom (et prénom si présent) du médecin prescripteur détecté dans le texte, ou null si absent ou si l'extraction n'est pas demandée.",
    ),
  medecinTelephone: z
    .string()
    .nullable()
    .describe(
      "Numéro de téléphone du médecin prescripteur détecté dans le texte, ou null si absent ou si l'extraction n'est pas demandée.",
    ),
  dateOrdonnance: z
    .string()
    .nullable()
    .describe(
      "Date de l'ordonnance telle qu'écrite dans le texte, ou null si absente ou si l'extraction n'est pas demandée.",
    ),
});

const SYSTEM_PROMPT = `Tu aides à naviguer un arbre de décision de cotation NGAP (nomenclature des actes de kinésithérapie en France) à partir du texte d'une ordonnance médicale rédigée par un médecin.

On te donne une question de l'arbre avec ses options possibles, et le texte complet de l'ordonnance. Réponds uniquement à partir de ce qui est écrit ou clairement impliqué dans le texte — ne devine jamais une information qui n'y figure pas explicitement ou implicitement de façon non ambiguë. Si l'ordonnance ne permet pas de trancher avec confiance entre les options, réponds answered=false plutôt que de choisir au hasard : une mauvaise cotation a des conséquences réelles (tarif, remboursement, responsabilité) pour le kinésithérapeute qui l'utilise.`;

interface DecideRequestBody {
  ordonnanceText?: string;
  nodeId?: string;
  extractHeader?: boolean;
  model?: AiModel;
}

export async function POST(req: NextRequest) {
  let body: DecideRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const { ordonnanceText, nodeId, extractHeader } = body;
  if (!ordonnanceText || typeof ordonnanceText !== "string" || !nodeId) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }
  const model = isAiModel(body.model) ? body.model : DEFAULT_AI_MODEL;

  let node;
  try {
    node = getNode(nodeId);
  } catch {
    return NextResponse.json({ error: "Nœud d'arbre inconnu" }, { status: 400 });
  }
  if (!isQuestion(node)) {
    return NextResponse.json(
      { error: "Ce nœud n'a pas de question (c'est déjà une feuille)" },
      { status: 400 },
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        error:
          "ANTHROPIC_API_KEY n'est pas configurée côté serveur. Voir CLAUDE.md pour la procédure.",
      },
      { status: 500 },
    );
  }

  const client = new Anthropic();

  const userMessage = [
    `Question : ${node.question}`,
    node.aide ? `Contexte : ${node.aide}` : null,
    "",
    "Options :",
    ...node.options.map(
      (o, i) => `${i}. ${o.label}${o.aide ? ` — ${o.aide}` : ""}`,
    ),
    "",
    "Texte de l'ordonnance :",
    '"""',
    ordonnanceText,
    '"""',
    "",
    extractHeader
      ? "Détecte aussi, si présents dans le texte : le prénom et le nom du patient (patientPrenom / patientNom), le nom du médecin prescripteur (medecinNom), son numéro de téléphone (medecinTelephone), et la date de l'ordonnance (dateOrdonnance). Ne les invente pas — laisse à null ce qui n'apparaît pas clairement."
      : "Ne cherche pas à détecter le patient, le médecin ou la date (laisse ces champs à null).",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  try {
    const response = await client.messages.parse({
      model,
      max_tokens: 1024,
      thinking: { type: "disabled" },
      output_config: {
        effort: "medium",
        format: zodOutputFormat(DecideSchema),
      },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const parsed = response.parsed_output;
    if (!parsed) {
      return NextResponse.json({ error: "Réponse non structurée" }, { status: 502 });
    }

    return NextResponse.json({
      answered: parsed.answered,
      optionIndex: parsed.optionIndex,
      justification: parsed.justification,
      patientName:
        parsed.patientPrenom || parsed.patientNom
          ? { prenom: parsed.patientPrenom, nom: parsed.patientNom }
          : null,
      medecinNom: parsed.medecinNom,
      medecinTelephone: parsed.medecinTelephone,
      dateOrdonnance: parsed.dateOrdonnance,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    });
  } catch (err) {
    console.error(`Erreur appel ${model} (/api/decide)`, err);
    return NextResponse.json(
      { error: "Erreur lors de l'appel au modèle" },
      { status: 502 },
    );
  }
}
