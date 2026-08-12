import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { addFeedback } from "@/lib/feedback/store";
import type { FeedbackEntry } from "@/lib/feedback/types";

export const runtime = "nodejs";

const MAX_FIELD_LEN = 200;
const MAX_COMMENT_LEN = 4000;

interface FeedbackBody {
  nom?: string;
  email?: string;
  commentaire?: string;
}

export async function POST(req: NextRequest) {
  let body: FeedbackBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  const nom = typeof body.nom === "string" ? body.nom.trim().slice(0, MAX_FIELD_LEN) : "";
  const email = typeof body.email === "string" ? body.email.trim().slice(0, MAX_FIELD_LEN) : "";
  const commentaire =
    typeof body.commentaire === "string" ? body.commentaire.trim().slice(0, MAX_COMMENT_LEN) : "";

  if (!nom && !email && !commentaire) {
    return NextResponse.json({ error: "Le formulaire est vide" }, { status: 400 });
  }

  const entry: FeedbackEntry = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...(nom ? { nom } : {}),
    ...(email ? { email } : {}),
    ...(commentaire ? { commentaire } : {}),
  };

  try {
    await addFeedback(entry);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erreur POST /api/feedback", err);
    return NextResponse.json({ error: "Erreur lors de l'enregistrement" }, { status: 500 });
  }
}
