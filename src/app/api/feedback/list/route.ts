import { NextRequest, NextResponse } from "next/server";
import { listFeedback } from "@/lib/feedback/store";

export const runtime = "nodejs";

// Gate informelle pour la bêta — pas un vrai contrôle d'accès, juste un frein.
const FEEDBACK_PASSWORD = "amk-feedback";

interface ListBody {
  password?: string;
}

export async function POST(req: NextRequest) {
  let body: ListBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  if (body.password !== FEEDBACK_PASSWORD) {
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }

  try {
    const feedback = await listFeedback();
    return NextResponse.json({ feedback });
  } catch (err) {
    console.error("Erreur POST /api/feedback/list", err);
    return NextResponse.json({ error: "Erreur de lecture" }, { status: 500 });
  }
}
