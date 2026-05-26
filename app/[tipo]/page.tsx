import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CONTENT_TYPES,
  listContent,
  type ContentType,
} from "@/lib/content";
import { groupBy } from "@/lib/grupos";

function isContentType(x: string): x is ContentType {
  return (CONTENT_TYPES as readonly string[]).includes(x);
}

const LABELS: Record<string, string> = {
  personajes: "Personajes",
  culturas: "Culturas",
  eventos: "Eventos",
  lugares: "Lugares",
  temas: "Temas",
  indices: "Índices",
  notas: "Notas",
};

export default async function TypeIndex({
  params,
}: {
  params: Promise<{ tipo: string }>;
}) {
  const { tipo } = await params;
  if (!isContentType(tipo)) notFound();
  const entries = await listContent(tipo);

  if (entries.length === 0) {
    return (
      <div className="px-10 py-8 prose-archivo max-w-4xl">
        <h1>{LABELS[tipo] ?? tipo}</h1>
        <p className="italic text-ink-500">
          Aún no hay entradas. Añade un archivo en{" "}
          <code>content/{tipo}/&lt;slug&gt;.md</code>.
        </p>
      </div>
    );
  }

  // Group personajes; everything else: flat
  if (tipo === "personajes") {
    const groups = groupBy(entries);
    return (
      <div className="px-10 py-8 max-w-4xl">
        <h1 className="font-serif text-3xl font-semibold text-ink-900 mb-1">
          {LABELS[tipo]}
        </h1>
        <p className="text-sm text-ink-500 italic mb-6">
          {entries.length} fichas, agrupadas por bando / función histórica.
        </p>
        {groups.map((g) => (
          <section key={g.key} className="mb-7">
            <h2 className="font-serif text-xl font-semibold text-ink-800 mb-2 border-b border-ink-200 pb-1">
              {g.label}{" "}
              <span className="text-ink-400 text-sm font-normal">
                ({g.items.length})
              </span>
            </h2>
            <ul className="space-y-1">
              {g.items.map((e) => (
                <li key={e.slug} className="text-base">
                  <Link
                    href={`/${tipo}/${e.slug}`}
                    className="text-accent-rust underline decoration-accent-rust/20 underline-offset-2 hover:decoration-accent-rust"
                  >
                    {e.nombre}
                  </Link>{" "}
                  <span className="text-xs text-ink-400">[{e.estado}]</span>
                  {e.tags.length > 0 && (
                    <span className="text-xs text-ink-500 ml-2">
                      {e.tags.slice(0, 4).map((t) => `#${t}`).join(" ")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="px-10 py-8 prose-archivo max-w-4xl">
      <h1>{LABELS[tipo] ?? tipo}</h1>
      <ul>
        {entries.map((e) => (
          <li key={e.slug}>
            <Link href={`/${tipo}/${e.slug}`}>{e.nombre}</Link>{" "}
            <span className="text-xs text-ink-400">[{e.estado}]</span>
            {e.tags.length > 0 && (
              <span className="text-xs text-ink-500 ml-2">
                {e.tags.map((t) => `#${t}`).join(" ")}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
