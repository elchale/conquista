import { listContent, type ContentIndexEntry } from "./content";
import timelineData from "@/content/data/timeline.json";

export interface CharEvent {
  year: number;
  yearPrecision: "exact" | "approx";
  label: string;
  kind: "birth" | "death" | "event";
  /** event slug for linking, if applicable */
  eventoId?: string;
}

export interface CharRow {
  slug: string;
  nombre: string;
  bando: string;
  genero: string;
  grupo: string;
  nacimiento?: number;
  muerte?: number;
  events: CharEvent[];
}

interface TimelineEventRaw {
  id: string;
  fecha: string;
  titulo: string;
  participantes?: string[];
}

// Parse a date string like "1532-11-16", "~1545", "1565-1566" into a year.
function parseYear(s: string | number | undefined): { year: number; precision: "exact" | "approx" } | null {
  if (s == null) return null;
  const str = String(s).trim();
  const approx = str.startsWith("~");
  const cleaned = str.replace(/^~/, "");
  // ISO date "1532-11-16"
  const isoMatch = cleaned.match(/^(\d{4})/);
  if (isoMatch) return { year: Number(isoMatch[1]), precision: approx ? "approx" : "exact" };
  // Range "1565-1566" — use first
  const rangeMatch = cleaned.match(/(\d{4})\s*[-–]\s*(\d{4})/);
  if (rangeMatch) return { year: Number(rangeMatch[1]), precision: "approx" };
  return null;
}

export async function buildComparativeTimeline(): Promise<{
  chars: CharRow[];
  yearMin: number;
  yearMax: number;
}> {
  const personajes = await listContent("personajes");
  const eventos = (timelineData as { eventos: TimelineEventRaw[] }).eventos;

  const eventsByChar = new Map<string, CharEvent[]>();
  for (const evt of eventos) {
    const parsed = parseYear(evt.fecha);
    if (!parsed) continue;
    for (const p of evt.participantes ?? []) {
      const list = eventsByChar.get(p) ?? [];
      list.push({
        year: parsed.year,
        yearPrecision: parsed.precision,
        label: evt.titulo,
        kind: "event",
        eventoId: evt.id,
      });
      eventsByChar.set(p, list);
    }
  }

  const chars: CharRow[] = [];
  for (const p of personajes) {
    const events: CharEvent[] = [];
    // Birth / death from frontmatter
    const fechas = p.fechas ?? {};
    const nacParsed = parseYear(fechas.nacimiento);
    const muerteParsed = parseYear(fechas.muerte);
    if (nacParsed) {
      events.push({
        year: nacParsed.year,
        yearPrecision: nacParsed.precision,
        label: `nace ${p.nombre}`,
        kind: "birth",
      });
    }
    if (muerteParsed) {
      events.push({
        year: muerteParsed.year,
        yearPrecision: muerteParsed.precision,
        label: `muere ${p.nombre}`,
        kind: "death",
      });
    }
    // Events from timeline.json
    const tlEvents = eventsByChar.get(p.slug) ?? [];
    events.push(...tlEvents);

    // Sort by year ascending
    events.sort((a, b) => a.year - b.year);

    chars.push({
      slug: p.slug,
      nombre: p.nombre,
      bando: p.bando ?? "desconocido",
      genero: p.genero ?? "m",
      grupo: p.grupo ?? "sin-grupo",
      nacimiento: nacParsed?.year,
      muerte: muerteParsed?.year,
      events,
    });
  }

  // Determine year range — clamp to reasonable bounds
  let yMin = 1600;
  let yMax = 1500;
  for (const c of chars) {
    for (const e of c.events) {
      if (e.year < yMin) yMin = e.year;
      if (e.year > yMax) yMax = e.year;
    }
  }
  yMin = Math.max(1450, Math.min(yMin - 5, 1500));
  yMax = Math.min(1620, Math.max(yMax + 5, 1580));

  return { chars, yearMin: yMin, yearMax: yMax };
}
