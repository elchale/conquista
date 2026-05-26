import Link from "next/link";
import { getAllContentByType } from "@/lib/content";

const SECTION_LABELS: Record<string, string> = {
  personajes: "Personajes",
  culturas: "Culturas",
  eventos: "Eventos",
  lugares: "Lugares",
  temas: "Temas",
  indices: "Índices de fuentes",
  notas: "Notas",
};

export default async function Home() {
  const grouped = await getAllContentByType();
  const totals = Object.entries(grouped).reduce<Record<string, number>>(
    (acc, [k, v]) => ((acc[k] = v.length), acc),
    {}
  );

  return (
    <div className="px-10 py-8 prose-archivo">
      <h1>Conquista del Tahuantinsuyu</h1>
      <p className="text-ink-600 italic -mt-2">
        Archivo de investigación auditable · 1527 – 1572
      </p>

      <p>
        Esta es una base de conocimiento operable, no un libro de divulgación.
        Cada afirmación que vive aquí rastrea a una fuente catalogada en{" "}
        <Link href="/fuentes">/fuentes</Link>, y cada fuente está descargada en{" "}
        <code>/docs</code> o tiene URL verificable. Lo que no está sourced se
        marca <code>[PENDIENTE: fuente]</code>.
      </p>

      <h2>Empezar por aquí</h2>
      <ul>
        <li>
          <Link href="/mapa">Mapa</Link> — Pueblos del Tahuantinsuyu, travesías
          de los españoles, fronteras étnicas.
        </li>
        <li>
          <Link href="/timeline">Timeline</Link> — Cronología interactiva 1527 –
          1572, cada evento con fuentes citadas.
        </li>
        <li>
          <Link href="/fuentes">Fuentes</Link> — Catálogo de crónicas, visitas y
          estudios. Cada una con autor, fecha y enlace al PDF.
        </li>
        <li>
          <Link href="/indices/titu-cusi-1570">Índice Titu Cusi 1570</Link> —
          Concordancia exhaustiva de personas, lugares y citas del manuscrito.
        </li>
      </ul>

      <h2>Estado actual</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 not-prose">
        {Object.entries(SECTION_LABELS).map(([tipo, label]) => (
          <Link
            key={tipo}
            href={`#${tipo}`}
            className="block border border-ink-200 bg-ink-50 rounded p-3 hover:bg-ink-100 transition"
          >
            <div className="text-xs uppercase tracking-wider text-ink-500">
              {label}
            </div>
            <div className="text-2xl font-serif text-ink-900 mt-1">
              {totals[tipo] ?? 0}
            </div>
          </Link>
        ))}
      </div>

      {Object.entries(grouped).map(([tipo, entries]) =>
        entries.length === 0 ? null : (
          <section key={tipo} id={tipo} className="mt-8">
            <h2>{SECTION_LABELS[tipo] ?? tipo}</h2>
            <ul>
              {entries.map((e) => (
                <li key={`${e.tipo}-${e.slug}`}>
                  <Link href={`/${e.tipo}/${e.slug}`}>{e.nombre}</Link>{" "}
                  <span className="text-xs text-ink-400">[{e.estado}]</span>
                </li>
              ))}
            </ul>
          </section>
        )
      )}

      <hr />
      <p className="text-sm text-ink-500">
        Convenciones, sistema de citas y reglas de trabajo en{" "}
        <code>README.md</code> en la raíz del proyecto.
      </p>
    </div>
  );
}
