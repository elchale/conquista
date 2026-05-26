import { NextRequest, NextResponse } from "next/server";
import { CONTENT_TYPES, getContent, saveContent, type ContentType } from "@/lib/content";

function isContentType(x: string): x is ContentType {
  return (CONTENT_TYPES as readonly string[]).includes(x);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tipo: string; slug: string }> }
) {
  const { tipo, slug } = await params;
  if (!isContentType(tipo)) {
    return NextResponse.json({ error: "tipo desconocido" }, { status: 400 });
  }
  const doc = await getContent(tipo, slug);
  if (!doc) return NextResponse.json({ error: "no encontrado" }, { status: 404 });
  return NextResponse.json(doc);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ tipo: string; slug: string }> }
) {
  const { tipo, slug } = await params;
  if (!isContentType(tipo)) {
    return NextResponse.json({ error: "tipo desconocido" }, { status: 400 });
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: "slug inválido" }, { status: 400 });
  }
  const { frontmatter, body } = (await req.json()) as {
    frontmatter: Record<string, unknown>;
    body: string;
  };
  if (typeof body !== "string") {
    return NextResponse.json({ error: "body requerido" }, { status: 400 });
  }
  await saveContent(tipo, slug, frontmatter ?? {}, body);
  return NextResponse.json({ ok: true });
}
