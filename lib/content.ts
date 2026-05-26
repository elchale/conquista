import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export const CONTENT_ROOT = path.join(process.cwd(), "content");

export const CONTENT_TYPES = [
  "personajes",
  "culturas",
  "eventos",
  "lugares",
  "temas",
  "indices",
  "notas",
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

export interface ContentFrontmatter {
  tipo?: ContentType | string;
  grupo?: string;
  bando?: string;
  genero?: "m" | "f" | string;
  nombre?: string;
  slug?: string;
  tags?: string[];
  fechas?: Record<string, string | number | undefined>;
  ubicaciones_relacionadas?: string[];
  personajes_relacionados?: string[];
  fuentes_principales?: string[];
  estado?: "stub" | "en-progreso" | "revisado";
  ultima_revision?: string;
  [key: string]: unknown;
}

export interface ContentDoc {
  tipo: ContentType;
  slug: string;
  frontmatter: ContentFrontmatter;
  body: string;
  filePath: string;
}

export interface ContentIndexEntry {
  tipo: ContentType;
  slug: string;
  nombre: string;
  estado: string;
  tags: string[];
  grupo?: string;
  bando?: string;
  genero?: string;
  fechas?: Record<string, string | number | undefined>;
}

async function safeReaddir(dir: string): Promise<string[]> {
  try {
    return await fs.readdir(dir);
  } catch {
    return [];
  }
}

export async function listContent(
  tipo: ContentType
): Promise<ContentIndexEntry[]> {
  const dir = path.join(CONTENT_ROOT, tipo);
  const files = await safeReaddir(dir);
  const entries: ContentIndexEntry[] = [];

  for (const file of files) {
    if (!file.endsWith(".md")) continue;
    const filePath = path.join(dir, file);
    const raw = await fs.readFile(filePath, "utf8");
    const { data } = matter(raw);
    const slug = file.replace(/\.md$/, "");
    entries.push({
      tipo,
      slug,
      nombre: (data.nombre as string) || slug,
      estado: (data.estado as string) || "stub",
      tags: (data.tags as string[]) || [],
      grupo: (data.grupo as string) || undefined,
      bando: (data.bando as string) || undefined,
      genero: (data.genero as string) || undefined,
      fechas: (data.fechas as Record<string, string | number | undefined>) || undefined,
    });
  }

  entries.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  return entries;
}

export async function getContent(
  tipo: ContentType,
  slug: string
): Promise<ContentDoc | null> {
  const filePath = path.join(CONTENT_ROOT, tipo, `${slug}.md`);
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(raw);
    return {
      tipo,
      slug,
      frontmatter: data as ContentFrontmatter,
      body: content,
      filePath,
    };
  } catch {
    return null;
  }
}

export async function saveContent(
  tipo: ContentType,
  slug: string,
  frontmatter: ContentFrontmatter,
  body: string
): Promise<void> {
  const dir = path.join(CONTENT_ROOT, tipo);
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${slug}.md`);
  const file = matter.stringify(body, frontmatter);
  await fs.writeFile(filePath, file, "utf8");
}

export async function getAllContentByType(): Promise<
  Record<ContentType, ContentIndexEntry[]>
> {
  const out = {} as Record<ContentType, ContentIndexEntry[]>;
  for (const tipo of CONTENT_TYPES) {
    out[tipo] = await listContent(tipo);
  }
  return out;
}
