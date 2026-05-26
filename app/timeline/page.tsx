import Link from "next/link";
import timelineData from "@/content/data/timeline.json";

interface Acto {
  id: string;
  nombre: string;
  rango: string;
  descripcion?: string;
}

interface Evento {
  id: string;
  acto: string;
  fecha: string;
  lugar?: string;
  titulo: string;
  participantes?: string[];
  resumen: string;
  fuentes: string[];
  citas?: string[];
  tags?: string[];
}

interface Data {
  meta: { descripcion: string; convencion_fechas: string; estado: string };
  actos: Acto[];
  eventos: Evento[];
}

export default function TimelinePage() {
  const data = timelineData as unknown as Data;
  const eventosByActo = new Map<string, Evento[]>();
  for (const e of data.eventos) {
    if (!eventosByActo.has(e.acto)) eventosByActo.set(e.acto, []);
    eventosByActo.get(e.acto)!.push(e);
  }

  return (
    <div className="px-10 py-8 max-w-4xl">
      <h1 className="font-serif text-3xl font-semibold text-ink-900 mb-1">
        Timeline · Conquista 1527–1572
      </h1>
      <p className="text-xs text-ink-500 italic mb-2">{data.meta.estado}</p>
      <p className="text-sm text-ink-600 mb-6">{data.meta.descripcion}</p>

      <div className="space-y-10">
        {data.actos.map((acto) => {
          const eventos = eventosByActo.get(acto.id) ?? [];
          return (
            <section key={acto.id}>
              <header className="mb-4 border-b border-ink-200 pb-2">
                <div className="text-xs uppercase tracking-wider text-ink-500">
                  {acto.rango}
                </div>
                <h2 className="font-serif text-2xl font-semibold text-ink-900">
                  {acto.nombre}
                </h2>
                {acto.descripcion ? (
                  <p className="text-sm text-ink-600 mt-1">{acto.descripcion}</p>
                ) : null}
              </header>

              <ol className="relative border-l-2 border-ink-200 ml-3 space-y-5">
                {eventos.map((e) => (
                  <li key={e.id} className="ml-5 relative">
                    <div className="absolute -left-[26px] top-1.5 w-3 h-3 rounded-full bg-accent-rust border-2 border-ink-50" />
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-1">
                      <span className="font-mono text-xs bg-ink-100 px-2 py-0.5 rounded text-ink-700">
                        {e.fecha}
                      </span>
                      {e.lugar ? (
                        <Link
                          href={`/lugares/${e.lugar}`}
                          className="text-xs text-accent-rust underline decoration-accent-rust/30 underline-offset-2"
                        >
                          {e.lugar}
                        </Link>
                      ) : null}
                      {(e.tags ?? []).map((t) => (
                        <span
                          key={t}
                          className="text-xs text-ink-400"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-ink-900">
                      <Link href={`/eventos/${e.id}`} className="hover:underline">
                        {e.titulo}
                      </Link>
                    </h3>
                    <p className="text-sm text-ink-700 mt-1 leading-relaxed">
                      {e.resumen}
                    </p>
                    <div className="text-xs text-ink-500 mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                      <span>
                        Participantes:{" "}
                        {(e.participantes ?? []).length > 0 ? (
                          (e.participantes ?? []).map((p, i) => (
                            <span key={p}>
                              {i > 0 ? ", " : ""}
                              <Link
                                href={`/personajes/${p}`}
                                className="hover:underline text-ink-700"
                              >
                                {p}
                              </Link>
                            </span>
                          ))
                        ) : (
                          <span className="italic">—</span>
                        )}
                      </span>
                      <span>
                        Fuentes:{" "}
                        {(e.fuentes ?? []).map((f, i) => (
                          <span key={f}>
                            {i > 0 ? ", " : ""}
                            <Link
                              href={`/fuentes#${f}`}
                              className="font-mono hover:underline"
                            >
                              {f}
                            </Link>
                          </span>
                        ))}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}
