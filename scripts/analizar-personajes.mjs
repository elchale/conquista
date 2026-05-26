// Análisis de huecos en la lista de personajes.
// 1) Slugs de personaje que existen.
// 2) Referencias a personajes (personajes_relacionados) en TODO el contenido
//    que NO tienen ficha -> candidatos fuertes.
// 3) Autores de fuentes.json que podrían merecer ficha de personaje.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const CONTENT = path.join(ROOT, "content");

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith(".md")) out.push(p);
  }
  return out;
}

const personajeFiles = fs.existsSync(path.join(CONTENT, "personajes"))
  ? fs.readdirSync(path.join(CONTENT, "personajes")).filter((f) => f.endsWith(".md"))
  : [];
const personajeSlugs = new Set(personajeFiles.map((f) => f.replace(/\.md$/, "")));

// Recolectar todas las referencias personajes_relacionados y de dónde vienen.
const refs = new Map(); // slug -> Set(origen)
for (const file of walk(CONTENT)) {
  const raw = fs.readFileSync(file, "utf8");
  let data;
  try { ({ data } = matter(raw)); } catch { continue; }
  const rel = data.personajes_relacionados;
  if (Array.isArray(rel)) {
    for (const r of rel) {
      if (!refs.has(r)) refs.set(r, new Set());
      refs.get(r).add(path.relative(CONTENT, file));
    }
  }
}

console.log(`=== Personajes existentes: ${personajeSlugs.size} ===\n`);

const huecos = [...refs.entries()]
  .filter(([slug]) => !personajeSlugs.has(slug))
  .sort((a, b) => b[1].size - a[1].size);

console.log(`=== Referidos en 'personajes_relacionados' SIN ficha: ${huecos.length} ===`);
for (const [slug, origenes] of huecos) {
  console.log(`  ${slug.padEnd(34)} (${origenes.size} refs)  ej: ${[...origenes].slice(0, 3).join(", ")}`);
}

// Autores de fuentes como posibles personajes.
const fuentes = JSON.parse(fs.readFileSync(path.join(CONTENT, "data", "fuentes.json"), "utf8"));
const arr = Array.isArray(fuentes.fuentes) ? fuentes.fuentes : Object.values(fuentes.fuentes);
console.log(`\n=== Autores de fuentes primarias (posibles personajes-cronistas) ===`);
for (const f of arr) {
  if (f.tipo !== "primaria") continue;
  console.log(`  [${f.id.padEnd(24)}] ${f.autor}`);
}
