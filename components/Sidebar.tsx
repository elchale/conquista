import Link from "next/link";
import { getAllContentByType, type ContentIndexEntry } from "@/lib/content";
import { groupBy } from "@/lib/grupos";

const SECTION_LABELS: Record<string, string> = {
  personajes: "Personajes",
  culturas: "Culturas",
  eventos: "Eventos",
  lugares: "Lugares",
  temas: "Temas",
  indices: "Índices de fuentes",
  notas: "Notas",
};

const TOOL_LINKS: { href: string; label: string }[] = [
  { href: "/", label: "Inicio" },
  { href: "/mapa", label: "Mapa" },
  { href: "/timeline", label: "Timeline" },
  { href: "/timeline-comparativo", label: "Timeline comparativo" },
  { href: "/docs", label: "Biblioteca" },
  { href: "/fuentes", label: "Fuentes" },
];

function StatusDot({ estado }: { estado: string }) {
  if (estado === "stub")
    return <span className="text-ink-400 mr-1">○</span>;
  if (estado === "en-progreso")
    return <span className="text-accent-gold mr-1">◐</span>;
  return <span className="text-accent-jade mr-1">●</span>;
}

function EntryLink({ entry }: { entry: ContentIndexEntry }) {
  return (
    <Link
      href={`/${entry.tipo}/${entry.slug}`}
      className="tree-item block truncate"
      title={entry.nombre}
    >
      <StatusDot estado={entry.estado} />
      {entry.nombre}
    </Link>
  );
}

export default async function Sidebar() {
  const grouped = await getAllContentByType();

  return (
    <aside className="w-72 shrink-0 h-screen sticky top-0 overflow-y-auto bg-ink-100/70 px-4 py-5">
      <div className="mb-6">
        <Link href="/" className="block">
          <h1 className="font-serif text-xl font-semibold text-ink-900 leading-tight">
            Conquista
          </h1>
          <p className="text-xs text-ink-500 mt-0.5">Archivo del Tahuantinsuyu</p>
        </Link>
      </div>

      <nav className="space-y-0.5 mb-6">
        {TOOL_LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="tree-item block">
            {l.label}
          </Link>
        ))}
      </nav>

      {Object.entries(grouped).map(([tipo, entries]) => {
        const tipoLabel = SECTION_LABELS[tipo] ?? tipo;
        // For personajes, group by `grupo` from frontmatter
        if (tipo === "personajes" && entries.length > 0) {
          const groups = groupBy(entries);
          return (
            <div key={tipo} className="mb-4">
              <div className="tree-folder">
                {tipoLabel}{" "}
                <span className="text-ink-400 font-normal normal-case tracking-normal">
                  ({entries.length})
                </span>
              </div>
              {groups.map((g) => (
                <div key={g.key} className="mt-1.5">
                  <div className="text-[10px] uppercase tracking-wider text-ink-500 px-1.5 mb-0.5">
                    {g.label}
                  </div>
                  {g.items.map((e) => (
                    <EntryLink key={`${e.tipo}-${e.slug}`} entry={e} />
                  ))}
                </div>
              ))}
            </div>
          );
        }
        // Default: flat list
        return (
          <div key={tipo} className="mb-4">
            <div className="tree-folder">
              {tipoLabel}{" "}
              <span className="text-ink-400 font-normal normal-case tracking-normal">
                ({entries.length})
              </span>
            </div>
            {entries.length === 0 ? (
              <div className="text-xs text-ink-400 italic px-1.5">vacío</div>
            ) : (
              entries.map((e) => (
                <EntryLink key={`${e.tipo}-${e.slug}`} entry={e} />
              ))
            )}
          </div>
        );
      })}
    </aside>
  );
}
