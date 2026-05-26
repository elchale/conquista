import Link from "next/link";
import { getAllContentByType } from "@/lib/content";
import { groupBy } from "@/lib/grupos";
import SidebarNav, {
  type NavSection,
  type ToolLink,
} from "@/components/SidebarNav";

const SECTION_LABELS: Record<string, string> = {
  personajes: "Personajes",
  culturas: "Culturas",
  eventos: "Eventos",
  lugares: "Lugares",
  temas: "Temas",
  indices: "Índices de fuentes",
  notas: "Notas",
};

const TOOL_LINKS: ToolLink[] = [
  { href: "/", label: "Inicio" },
  { href: "/mapa", label: "Mapa" },
  { href: "/timeline", label: "Timeline" },
  { href: "/timeline-comparativo", label: "Timeline comparativo" },
  { href: "/docs", label: "Biblioteca" },
  { href: "/fuentes", label: "Fuentes" },
];

export default async function Sidebar() {
  const grouped = await getAllContentByType();

  const sections: NavSection[] = Object.entries(grouped).map(([tipo, entries]) => {
    const base = {
      tipo,
      label: SECTION_LABELS[tipo] ?? tipo,
      count: entries.length,
    };
    // Personajes are sub-grouped by `grupo`; everything else is a flat list.
    if (tipo === "personajes" && entries.length > 0) {
      return {
        ...base,
        subgroups: groupBy(entries).map((g) => ({
          key: g.key,
          label: g.label,
          items: g.items,
        })),
      };
    }
    return { ...base, items: entries };
  });

  return (
    <aside className="w-72 shrink-0 h-screen sticky top-0 overflow-y-auto bg-ink-100/70 px-4 py-5">
      <div className="mb-5">
        <Link href="/" className="block">
          <h1 className="font-serif text-xl font-semibold text-ink-900 leading-tight">
            Conquista
          </h1>
          <p className="text-xs text-ink-500 mt-0.5">Archivo del Tahuantinsuyu</p>
        </Link>
      </div>

      <SidebarNav toolLinks={TOOL_LINKS} sections={sections} />
    </aside>
  );
}
