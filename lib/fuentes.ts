import fs from "node:fs/promises";
import path from "node:path";

const FUENTES_PATH = path.join(
  process.cwd(),
  "content",
  "data",
  "fuentes.json"
);

export interface FuenteUrl {
  plataforma: string;
  url: string;
  tipo?: "pdf" | "html" | "epub" | "facsimil" | "landing";
  edicion_tipo?: string;
  acceso?: "libre" | "borrow" | "restringido" | string;
  verificado?: boolean;
  nota?: string;
}

export interface Fuente {
  id: string;
  // tipo is open-ended in the catalog (e.g. "primaria", "secundaria_moderna").
  tipo: string;
  categoria?: string;
  autor: string;
  titulo: string;
  fecha_original?: number | string;
  lugar_original?: string;
  edicion_recomendada?: string;
  idioma?: string;
  pdf_local?: string;
  urls?: FuenteUrl[];
  relevancia?: string;
  notas?: string;
}

export interface Cita {
  fuente_id: string;
  pagina_pdf?: number;
  folio_ms?: string;
  texto: string;
  contexto?: string;
}

export interface FuentesFile {
  fuentes: Record<string, Fuente>;
  citas: Record<string, Cita>;
}

interface RawFuentesFile {
  fuentes: Fuente[] | Record<string, Fuente>;
  citas?: Record<string, Cita>;
}

export async function loadFuentes(): Promise<FuentesFile> {
  try {
    const raw = await fs.readFile(FUENTES_PATH, "utf8");
    const parsed = JSON.parse(raw) as RawFuentesFile;
    // Normalize: agents may write fuentes as an array; lib uses an object keyed by id.
    let fuentes: Record<string, Fuente>;
    if (Array.isArray(parsed.fuentes)) {
      fuentes = Object.fromEntries(parsed.fuentes.map((f) => [f.id, f]));
    } else {
      fuentes = parsed.fuentes ?? {};
    }
    return { fuentes, citas: parsed.citas ?? {} };
  } catch {
    return { fuentes: {}, citas: {} };
  }
}

export async function saveFuentes(data: FuentesFile): Promise<void> {
  await fs.mkdir(path.dirname(FUENTES_PATH), { recursive: true });
  // Round-trip: persist fuentes as an ARRAY for easier hand-editing.
  const out = {
    fuentes: Object.values(data.fuentes),
    citas: data.citas,
  };
  await fs.writeFile(FUENTES_PATH, JSON.stringify(out, null, 2), "utf8");
}

/**
 * Resolves a cite-key (e.g. `titu-1570-c03` or `xerez-1534`) against the fuentes catalog.
 * - If the key matches a fuente directly, returns the fuente.
 * - Otherwise treats it as a cita key and returns both the cita and its parent fuente.
 */
export function resolveCite(
  key: string,
  catalog: FuentesFile
): { fuente?: Fuente; cita?: Cita } {
  if (catalog.fuentes[key]) {
    return { fuente: catalog.fuentes[key] };
  }
  if (catalog.citas[key]) {
    const cita = catalog.citas[key];
    return { cita, fuente: catalog.fuentes[cita.fuente_id] };
  }
  return {};
}
