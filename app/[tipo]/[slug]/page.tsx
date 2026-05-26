import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CONTENT_TYPES,
  getContent,
  listContent,
  type ContentType,
} from "@/lib/content";
import { loadFuentes, resolveCite } from "@/lib/fuentes";
import Editor from "@/components/Editor";

function isContentType(x: string): x is ContentType {
  return (CONTENT_TYPES as readonly string[]).includes(x);
}

export async function generateStaticParams() {
  const params: { tipo: string; slug: string }[] = [];
  for (const tipo of CONTENT_TYPES) {
    const entries = await listContent(tipo);
    for (const e of entries) params.push({ tipo, slug: e.slug });
  }
  return params;
}

const CITE_RE = /\[\^([a-z0-9-]+)\]/gi;

export default async function ContentPage({
  params,
}: {
  params: Promise<{ tipo: string; slug: string }>;
}) {
  const { tipo, slug } = await params;
  if (!isContentType(tipo)) notFound();
  const doc = await getContent(tipo, slug);
  if (!doc) notFound();

  const catalog = await loadFuentes();
  const lookup: Record<string, string> = {};
  const matches = doc.body.match(CITE_RE) ?? [];
  for (const m of matches) {
    const key = m.slice(2, -1);
    const { fuente, cita } = resolveCite(key, catalog);
    if (cita && fuente) {
      lookup[key] = `${fuente.autor}, ${fuente.titulo} (${fuente.fecha_original ?? "s.f."})${
        cita.pagina_pdf ? ` p. ${cita.pagina_pdf}` : ""
      }${cita.folio_ms ? ` fol. ${cita.folio_ms}` : ""} — ${cita.texto.slice(0, 140)}`;
    } else if (fuente) {
      lookup[key] = `${fuente.autor}, ${fuente.titulo} (${fuente.fecha_original ?? "s.f."})`;
    } else {
      lookup[key] = "fuente no resuelta — añadir en fuentes.json";
    }
  }

  const fm = doc.frontmatter;

  return (
    <div className="px-10 py-8 max-w-4xl">
      <div className="text-xs uppercase tracking-wider text-ink-500 mb-1">
        {tipo} ·{" "}
        <Link href={`/${tipo}`} className="hover:underline">
          ver todos
        </Link>
      </div>
      <h1 className="font-serif text-3xl font-semibold text-ink-900 mb-1">
        {fm.nombre ?? slug}
      </h1>
      <div className="text-xs text-ink-500 mb-4">
        estado: {fm.estado ?? "stub"}
        {fm.ultima_revision ? ` · revisado ${fm.ultima_revision}` : ""}
      </div>

      {Array.isArray(fm.tags) && fm.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {fm.tags.map((t) => (
            <span
              key={t}
              className="text-xs bg-ink-100 text-ink-600 px-2 py-0.5 rounded"
            >
              #{t}
            </span>
          ))}
        </div>
      ) : null}

      <Editor
        tipo={tipo}
        slug={slug}
        initialFrontmatter={fm as Record<string, unknown>}
        initialBody={doc.body}
        citationLookup={lookup}
      />
    </div>
  );
}
