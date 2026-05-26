"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

interface CharEvent {
  year: number;
  yearPrecision: "exact" | "approx";
  label: string;
  kind: "birth" | "death" | "event";
  eventoId?: string;
}

interface CharRow {
  slug: string;
  nombre: string;
  bando: string;
  genero: string;
  grupo: string;
  nacimiento?: number;
  muerte?: number;
  events: CharEvent[];
}

interface Props {
  chars: CharRow[];
  yearMin: number;
  yearMax: number;
}

const BANDO_COLOR: Record<string, string> = {
  inca: "#8b3a1f",
  "inca-mestiza": "#a8895a",
  "inca-colaborador": "#cdb88a",
  "inca-traidor": "#54422a",
  "inca-aliada-espanoles": "#cdb88a",
  espanol: "#1a1a1a",
  religioso: "#3a2d1d",
  interprete: "#3e6b5a",
  mestiza: "#a8895a",
  desconocido: "#888",
};

const BANDO_LABEL: Record<string, string> = {
  inca: "Inca",
  "inca-mestiza": "Inca/mestiza",
  "inca-colaborador": "Inca colab.",
  "inca-traidor": "Inca traidor",
  "inca-aliada-espanoles": "Inca pro-esp.",
  espanol: "Español",
  religioso: "Religioso",
  interprete: "Intérprete",
  mestiza: "Mestiza",
  desconocido: "?",
};

const COL_WIDTH = 220; // px per character column
const YEAR_COL_WIDTH = 70;

export default function TimelineComparativo({
  chars: charsAll,
  yearMin,
  yearMax,
}: Props) {
  const [filterBando, setFilterBando] = useState<string[]>([]);
  const [filterGenero, setFilterGenero] = useState<"all" | "m" | "f">("all");
  const [sortBy, setSortBy] = useState<"bando" | "nombre" | "nacimiento">(
    "bando"
  );
  const [hideEmptyYears, setHideEmptyYears] = useState(true);
  const [highlightedChar, setHighlightedChar] = useState<string | null>(null);

  const allBandos = useMemo(() => {
    const s = new Set<string>();
    for (const c of charsAll) s.add(c.bando);
    return Array.from(s);
  }, [charsAll]);

  const chars = useMemo(() => {
    let out = charsAll.slice();
    if (filterBando.length > 0) {
      out = out.filter((c) => filterBando.includes(c.bando));
    }
    if (filterGenero !== "all") {
      out = out.filter((c) => c.genero === filterGenero);
    }
    if (sortBy === "nombre") {
      out.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    } else if (sortBy === "nacimiento") {
      out.sort(
        (a, b) =>
          (a.nacimiento ?? yearMax + 1) - (b.nacimiento ?? yearMax + 1)
      );
    } else {
      out.sort((a, b) => {
        if (a.bando !== b.bando) return a.bando.localeCompare(b.bando);
        return (
          (a.nacimiento ?? yearMax + 1) - (b.nacimiento ?? yearMax + 1)
        );
      });
    }
    return out;
  }, [charsAll, filterBando, filterGenero, sortBy, yearMax]);

  // Group events by character and year
  const eventsByCharYear = useMemo(() => {
    const grid = new Map<string, Map<number, CharEvent[]>>();
    for (const c of chars) {
      const m = new Map<number, CharEvent[]>();
      for (const e of c.events) {
        const list = m.get(e.year) ?? [];
        list.push(e);
        m.set(e.year, list);
      }
      grid.set(c.slug, m);
    }
    return grid;
  }, [chars]);

  // Which years to show
  const years = useMemo(() => {
    if (!hideEmptyYears) {
      const out: number[] = [];
      for (let y = yearMin; y <= yearMax; y++) out.push(y);
      return out;
    }
    const set = new Set<number>();
    for (const c of chars) for (const e of c.events) set.add(e.year);
    return Array.from(set).sort((a, b) => a - b);
  }, [chars, hideEmptyYears, yearMin, yearMax]);

  return (
    <div className="h-screen flex flex-col bg-ink-50">
      {/* Toolbar */}
      <div className="px-4 py-2.5 border-b border-ink-200 bg-ink-100/70 shrink-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <h1 className="font-serif text-xl font-semibold text-ink-900 mr-2">
            Sucesos comparados
          </h1>
          <span className="text-xs text-ink-500">
            {chars.length}/{charsAll.length} personajes · {years.length} años
          </span>
          <div className="flex-1" />

          <label className="text-xs text-ink-700 flex items-center gap-1">
            <input
              type="checkbox"
              checked={hideEmptyYears}
              onChange={(e) => setHideEmptyYears(e.target.checked)}
              className="rounded"
            />
            ocultar años vacíos
          </label>

          <label className="text-xs text-ink-700">
            Ordenar:&nbsp;
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "bando" | "nombre" | "nacimiento")
              }
              className="border border-ink-300 rounded px-1 py-0.5 bg-white text-xs"
            >
              <option value="bando">bando + nacimiento</option>
              <option value="nacimiento">nacimiento</option>
              <option value="nombre">alfabético</option>
            </select>
          </label>

          <label className="text-xs text-ink-700">
            Género:&nbsp;
            <select
              value={filterGenero}
              onChange={(e) =>
                setFilterGenero(e.target.value as "all" | "m" | "f")
              }
              className="border border-ink-300 rounded px-1 py-0.5 bg-white text-xs"
            >
              <option value="all">todos</option>
              <option value="f">solo mujeres</option>
              <option value="m">solo hombres</option>
            </select>
          </label>
        </div>

        <div className="mt-1.5 flex flex-wrap gap-1">
          <button
            onClick={() => setFilterBando([])}
            className={`text-xs px-2 py-0.5 rounded border ${
              filterBando.length === 0
                ? "bg-ink-800 text-ink-50 border-ink-800"
                : "bg-white border-ink-300 hover:bg-ink-100"
            }`}
          >
            todos los bandos
          </button>
          {allBandos.map((b) => {
            const active = filterBando.includes(b);
            return (
              <button
                key={b}
                onClick={() =>
                  setFilterBando((prev) =>
                    active ? prev.filter((x) => x !== b) : [...prev, b]
                  )
                }
                className={`text-xs px-2 py-0.5 rounded border flex items-center gap-1 ${
                  active
                    ? "bg-ink-800 text-ink-50 border-ink-800"
                    : "bg-white border-ink-300 hover:bg-ink-100"
                }`}
              >
                <span
                  className="inline-block w-2 h-2 rounded-sm"
                  style={{ background: BANDO_COLOR[b] ?? "#888" }}
                />
                {BANDO_LABEL[b] ?? b}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <table className="border-collapse" style={{ tableLayout: "fixed" }}>
          <thead className="bg-ink-100">
            <tr>
              <th
                className="sticky top-0 left-0 z-40 bg-ink-100 border-b-2 border-r-2 border-ink-300 font-mono text-xs text-ink-700"
                style={{ width: YEAR_COL_WIDTH, minWidth: YEAR_COL_WIDTH }}
              >
                Año
              </th>
              {chars.map((c) => (
                <th
                  key={c.slug}
                  onMouseEnter={() => setHighlightedChar(c.slug)}
                  onMouseLeave={() => setHighlightedChar(null)}
                  className={`sticky top-0 z-30 border-b-2 border-r border-ink-300 px-2 py-2 text-left align-top ${
                    highlightedChar === c.slug ? "bg-ink-200" : "bg-ink-100"
                  }`}
                  style={{ width: COL_WIDTH, minWidth: COL_WIDTH }}
                >
                  <Link
                    href={`/personajes/${c.slug}`}
                    className="font-serif text-sm font-semibold text-ink-900 hover:text-accent-rust block leading-tight"
                  >
                    {c.nombre}
                  </Link>
                  <div className="flex items-center gap-1 mt-0.5 text-[10px] text-ink-500">
                    <span
                      className="inline-block w-2 h-2 rounded-sm shrink-0"
                      style={{
                        background: BANDO_COLOR[c.bando] ?? "#888",
                      }}
                    />
                    <span className="truncate">
                      {BANDO_LABEL[c.bando] ?? c.bando} ·{" "}
                      {c.genero === "f" ? "♀" : "♂"}
                    </span>
                  </div>
                  {(c.nacimiento || c.muerte) && (
                    <div className="text-[10px] text-ink-400 mt-0.5">
                      {c.nacimiento ?? "?"}–{c.muerte ?? "?"}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {years.map((y, yi) => {
              const prevYear = years[yi - 1];
              const showDecadeBand = prevYear == null || Math.floor(prevYear / 10) !== Math.floor(y / 10);
              return (
                <tr
                  key={y}
                  className={showDecadeBand ? "border-t-2 border-ink-300" : ""}
                >
                  <th
                    className={`sticky left-0 z-20 border-r-2 border-b border-ink-300 px-2 align-top text-right font-mono text-[11px] py-1 ${
                      y % 10 === 0
                        ? "bg-ink-200 text-ink-900 font-bold"
                        : "bg-ink-100 text-ink-700"
                    }`}
                    style={{ width: YEAR_COL_WIDTH, minWidth: YEAR_COL_WIDTH }}
                  >
                    {y}
                  </th>
                  {chars.map((c) => {
                    const events = eventsByCharYear.get(c.slug)?.get(y) ?? [];
                    const isAlive =
                      c.nacimiento != null &&
                      y >= c.nacimiento &&
                      (c.muerte == null || y <= c.muerte);
                    const isHighlight = highlightedChar === c.slug;
                    return (
                      <td
                        key={c.slug}
                        onMouseEnter={() => setHighlightedChar(c.slug)}
                        onMouseLeave={() => setHighlightedChar(null)}
                        className={`border-r border-b border-ink-200 align-top px-2 py-1 ${
                          isHighlight
                            ? "bg-ink-100"
                            : isAlive
                            ? "bg-white"
                            : "bg-ink-50/40"
                        }`}
                        style={{
                          width: COL_WIDTH,
                          minWidth: COL_WIDTH,
                          maxWidth: COL_WIDTH,
                        }}
                      >
                        {events.length === 0 ? (
                          <span className="text-ink-300 text-[10px]">
                            {isAlive ? "·" : ""}
                          </span>
                        ) : (
                          <div className="space-y-1">
                            {events.map((e, i) => (
                              <EventLine key={i} event={e} />
                            ))}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EventLine({ event }: { event: CharEvent }) {
  const colorClass =
    event.kind === "birth"
      ? "text-accent-jade"
      : event.kind === "death"
      ? "text-accent-rust"
      : "text-ink-800";
  const prefix =
    event.kind === "birth" ? "✦ " : event.kind === "death" ? "† " : "";
  const content = (
    <span
      className={`text-[11px] leading-snug ${colorClass} ${
        event.yearPrecision === "approx" ? "italic" : ""
      }`}
    >
      <span className={event.kind === "event" ? "" : "font-semibold"}>
        {prefix}
      </span>
      {event.label}
    </span>
  );
  if (event.eventoId) {
    return (
      <Link
        href={`/eventos/${event.eventoId}`}
        className="block hover:bg-ink-100/60 rounded -mx-1 px-1"
      >
        {content}
      </Link>
    );
  }
  return <div className="-mx-1 px-1">{content}</div>;
}
