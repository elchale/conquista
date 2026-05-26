import Link from "next/link";
import { loadFuentes, type Fuente } from "@/lib/fuentes";

const TIPO_LABEL: Record<string, string> = {
  primaria: "Fuentes primarias",
  secundaria: "Estudios modernos",
  visita: "Visitas administrativas",
  "ed-critica": "Ediciones críticas",
  otros: "Otros",
};

export default async function FuentesPage() {
  const catalog = await loadFuentes();
  const fuentes = Object.values(catalog.fuentes);
  const grouped = fuentes.reduce<Record<string, Fuente[]>>((acc, f) => {
    (acc[f.tipo] ??= []).push(f);
    return acc;
  }, {});

  return (
    <div className="px-10 py-8 max-w-4xl">
      <h1 className="font-serif text-3xl font-semibold text-ink-900 mb-1">
        Fuentes
      </h1>
      <p className="text-sm text-ink-600 italic mb-4">
        Catálogo central. {fuentes.length} fuentes ·{" "}
        {Object.keys(catalog.citas).length} citas indexadas.
      </p>
      <p className="text-sm text-ink-700 mb-8">
        Si necesitas añadir una fuente, edita{" "}
        <code>content/data/fuentes.json</code>. El PDF descargado debería ir a{" "}
        <code>/docs/&lt;subdir&gt;/</code> y enlazarse en el campo{" "}
        <code>pdf_local</code>.
      </p>

      {fuentes.length === 0 ? (
        <div className="border border-ink-200 rounded p-4 bg-ink-100/50 text-ink-700 text-sm">
          <p className="font-semibold mb-1">Catálogo aún vacío.</p>
          <p>
            Un agente está investigando URLs de descarga de las crónicas
            primarias y poblará este archivo. Mientras tanto, puedes inspeccionar{" "}
            <code>content/data/fuentes.json</code>.
          </p>
        </div>
      ) : (
        Object.entries(grouped).map(([tipo, items]) => (
          <section key={tipo} className="mb-8">
            <h2 className="font-serif text-xl font-semibold text-ink-800 mt-6 mb-3 border-b border-ink-200 pb-1">
              {TIPO_LABEL[tipo] ?? tipo}{" "}
              <span className="text-ink-400 text-sm font-normal">
                ({items.length})
              </span>
            </h2>
            <ul className="space-y-3">
              {items
                .sort((a, b) =>
                  String(a.fecha_original ?? "").localeCompare(
                    String(b.fecha_original ?? "")
                  )
                )
                .map((f) => (
                  <li
                    key={f.id}
                    id={f.id}
                    className="border-l-2 border-ink-200 pl-3 hover:border-accent-gold"
                  >
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-mono text-xs bg-ink-100 px-1.5 py-0.5 rounded">
                        {f.id}
                      </span>
                      <span className="text-xs text-ink-400">
                        {f.fecha_original ?? "s.f."}
                      </span>
                    </div>
                    <div className="font-serif">
                      <span className="font-semibold">{f.autor}</span> ·{" "}
                      <span className="italic">{f.titulo}</span>
                    </div>
                    {f.edicion_recomendada ? (
                      <div className="text-xs text-ink-600 mt-0.5">
                        Edición: {f.edicion_recomendada}
                      </div>
                    ) : null}
                    {f.relevancia ? (
                      <p className="text-sm text-ink-700 mt-1">
                        {f.relevancia}
                      </p>
                    ) : null}
                    <div className="text-xs text-ink-500 mt-1 flex flex-wrap gap-x-3">
                      {f.pdf_local ? (
                        <span>
                          📄{" "}
                          <Link
                            href={`/${f.pdf_local.replace(/\\/g, "/")}`}
                            className="underline"
                          >
                            {f.pdf_local}
                          </Link>
                        </span>
                      ) : (
                        <span className="text-accent-rust italic">
                          PDF no descargado
                        </span>
                      )}
                      {(f.urls ?? []).map((u, i) => (
                        <Link
                          key={i}
                          href={u.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-ink-700"
                        >
                          {u.plataforma}
                          {u.verificado ? " ✓" : " ?"}
                        </Link>
                      ))}
                    </div>
                  </li>
                ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
