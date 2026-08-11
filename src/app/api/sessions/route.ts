import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { listSessions, putSession } from "@/lib/session/store";
import type { SavedSession } from "@/lib/session/types";
import type { PathStep } from "@/lib/ngap/types";

export const runtime = "nodejs";

export async function GET() {
  try {
    const sessions = await listSessions();
    return NextResponse.json({ sessions });
  } catch (err) {
    console.error("Erreur GET /api/sessions", err);
    return NextResponse.json({ error: "Erreur de lecture du stockage" }, { status: 500 });
  }
}

interface CreateSessionBody {
  title?: string;
  path?: PathStep[];
  currentNodeId?: string;
}

export async function POST(req: NextRequest) {
  let body: CreateSessionBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  if (!body.title || !body.currentNodeId || !Array.isArray(body.path)) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const session: SavedSession = {
    id: randomUUID(),
    title: body.title,
    createdAt: now,
    updatedAt: now,
    archived: false,
    path: body.path,
    currentNodeId: body.currentNodeId,
  };

  try {
    await putSession(session);
    return NextResponse.json({ id: session.id });
  } catch (err) {
    console.error("Erreur POST /api/sessions", err);
    return NextResponse.json({ error: "Erreur d'écriture du stockage" }, { status: 500 });
  }
}
