"use client";

import dynamic from "next/dynamic";
import { useState, useMemo } from "react";

const MapaCliente = dynamic(() => import("./MapaCliente"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center text-ink-500">
      Cargando mapa…
    </div>
  ),
});

interface Lugar {
  id: string;
  nombre: string;
  tipo: string;
  lat: number;
  lng: number;
  precision?: string;
  etnia?: string;
  altitud_m?: number;
  notas?: string;
}

interface RutaPunto {
  lugar_id?: string;
  lat?: number;
  lng?: number;
  via?: string;
  fecha?: string;
  evento?: string;
}

interface Ruta {
  id: string;
  nombre: string;
  color?: string;
  fechas?: string;
  descripcion?: string;
  puntos: RutaPunto[];
}

interface MapData {
  lugares: Lugar[];
  rutas: Ruta[];
}

// Group rutas by semantic theme for the sidebar
const RUTA_GROUPS: { id: string; label: string; matcher: (r: Ruta) => boolean }[] = [
  {
    id: "capac-nan",
    label: "Capac Ñan (red imperial)",
    matcher: (r) => r.id.startsWith("capac-nan"),
  },
  {
    id: "pizarro",
    label: "Marchas de Pizarro",
    matcher: (r) => r.id.startsWith("pizarro-"),
  },
  {
    id: "cerco",
    label: "Cerco del Cuzco (1536) — convergencia de 4 suyos",
    matcher: (r) => r.id.startsWith("cerco-cuzco-"),
  },
  {
    id: "atahualpistas",
    label: "Atahualpistas y Huáscar (1532-34)",
    matcher: (r) =>
      r.id.startsWith("huascar-") ||
      r.id.startsWith("challcochima-") ||
      r.id.startsWith("quisquis-"),
  },
  {
    id: "socorro",
    label: "Columnas de socorro al Cuzco (1536-37)",
    matcher: (r) =>
      r.id.startsWith("socorro-") || r.id === "quizo-yupanqui-cuzco-yauyos-1536",
  },
  {
    id: "neoinca",
    label: "Resistencia neoinca",
    matcher: (r) => r.id.startsWith("retirada-manco"),
  },
];

function groupRutas(rutas: Ruta[]): {
  id: string;
  label: string;
  items: Ruta[];
}[] {
  const groups = RUTA_GROUPS.map((g) => ({
    id: g.id,
    label: g.label,
    items: rutas.filter(g.matcher),
  }));
  const claimed = new Set(groups.flatMap((g) => g.items.map((r) => r.id)));
  const remaining = rutas.filter((r) => !claimed.has(r.id));
  if (remaining.length > 0) {
    groups.push({ id: "otras", label: "Otras", items: remaining });
  }
  return groups.filter((g) => g.items.length > 0);
}

export default function MapaWrapper({ data }: { data: MapData }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const groups = useMemo(() => groupRutas(data.rutas), [data.rutas]);
  const selectedRuta = useMemo(
    () => data.rutas.find((r) => r.id === selectedId) ?? null,
    [data.rutas, selectedId]
  );

  return (
    <div className="flex h-full">
      <div className="flex-1 min-w-0 relative">
        <MapaCliente
          data={data}
          selectedRouteId={selectedId}
          onSelectRoute={setSelectedId}
        />
      </div>
      <aside className="w-80 shrink-0 border-l border-ink-200 bg-ink-50 overflow-y-auto">
        <div className="px-4 py-3 border-b border-ink-200 sticky top-0 bg-ink-50 z-10">
          <h2 className="font-serif text-lg font-semibold text-ink-900">
            Rutas
          </h2>
          <p className="text-xs text-ink-500 mt-0.5">
            {data.rutas.length} rutas históricas · click para enfocar
          </p>
          <button
            onClick={() => setSelectedId(null)}
            className={`mt-2 text-xs px-2 py-1 rounded ${
              selectedId === null
                ? "bg-ink-800 text-ink-50"
                : "bg-ink-100 text-ink-700 hover:bg-ink-200"
            }`}
          >
            Mostrar todas
          </button>
        </div>

        {groups.map((g) => (
          <div key={g.id} className="border-b border-ink-200">
            <div className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-wider text-ink-500 font-semibold">
              {g.label}
            </div>
            {g.items.map((r) => (
              <button
                key={r.id}
                onClick={() =>
                  setSelectedId((cur) => (cur === r.id ? null : r.id))
                }
                className={`w-full text-left px-4 py-2 text-sm border-l-4 hover:bg-ink-100 ${
                  selectedId === r.id
                    ? "bg-ink-100 font-semibold"
                    : ""
                }`}
                style={{ borderLeftColor: r.color ?? "#888" }}
              >
                {r.nombre}
                <div className="text-[10px] text-ink-500 font-normal mt-0.5">
                  {r.fechas ?? ""} · {r.puntos.length} vértices
                </div>
              </button>
            ))}
          </div>
        ))}

        {selectedRuta && (
          <div className="px-4 py-3 border-t border-ink-300 bg-ink-100/60">
            <h3 className="font-serif text-base font-semibold text-ink-900 mb-1">
              {selectedRuta.nombre}
            </h3>
            <div className="text-xs text-ink-500 mb-2">
              {selectedRuta.fechas}
            </div>
            {selectedRuta.descripcion && (
              <p className="text-xs text-ink-700 leading-relaxed mb-3">
                {selectedRuta.descripcion}
              </p>
            )}
            <div className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold mb-1">
              Paradas / hitos
            </div>
            <ol className="text-xs space-y-1">
              {selectedRuta.puntos
                .filter((p) => p.lugar_id || p.evento)
                .map((p, i) => (
                  <li key={i} className="leading-snug">
                    {p.fecha && (
                      <span className="font-mono text-[10px] text-ink-500 mr-1.5">
                        {p.fecha}
                      </span>
                    )}
                    {p.lugar_id ? (
                      <a
                        href={`/lugares/${p.lugar_id}`}
                        className="text-accent-rust underline decoration-accent-rust/30 underline-offset-2"
                      >
                        {p.lugar_id}
                      </a>
                    ) : (
                      <span className="italic text-ink-600">{p.via}</span>
                    )}
                    {p.evento && (
                      <div className="text-ink-600 ml-3">— {p.evento}</div>
                    )}
                  </li>
                ))}
            </ol>
          </div>
        )}
      </aside>
    </div>
  );
}
