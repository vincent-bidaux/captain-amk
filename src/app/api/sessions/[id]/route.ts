import { NextRequest, NextResponse } from "next/server";
import { deleteSession, getSession, putSession } from "@/lib/session/store";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const session = await getSession(id);
    if (!session) {
      return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
    }
    return NextResponse.json({ session });
  } catch (err) {
    console.error("Erreur GET /api/sessions/[id]", err);
    return NextResponse.json({ error: "Erreur de lecture du stockage" }, { status: 500 });
  }
}

interface PatchBody {
  archived?: boolean;
  title?: string;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body: PatchBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

  try {
    const session = await getSession(id);
    if (!session) {
      return NextResponse.json({ error: "Session introuvable" }, { status: 404 });
    }
    if (typeof body.archived === "boolean") session.archived = body.archived;
    if (typeof body.title === "string" && body.title.trim()) session.title = body.title.trim();
    session.updatedAt = new Date().toISOString();
    await putSession(session);
    return NextResponse.json({ session });
  } catch (err) {
    console.error("Erreur PATCH /api/sessions/[id]", err);
    return NextResponse.json({ error: "Erreur d'écriture du stockage" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await deleteSession(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Erreur DELETE /api/sessions/[id]", err);
    return NextResponse.json({ error: "Erreur de suppression" }, { status: 500 });
  }
}
