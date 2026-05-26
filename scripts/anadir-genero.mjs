// Añade el campo `genero` y `bando` al frontmatter de cada personaje según un mapa fijo.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const PERSONAJES_META = {
  // hombres incas
  "manco-inca":            { genero: "m", bando: "inca" },
  "atahualpa":             { genero: "m", bando: "inca" },
  "huascar":               { genero: "m", bando: "inca" },
  "titu-cusi":             { genero: "m", bando: "inca" },
  "sayri-tupac":           { genero: "m", bando: "inca" },
  "tupac-amaru-i":         { genero: "m", bando: "inca" },
  "vila-orna":             { genero: "m", bando: "inca" },
  "challcochima":          { genero: "m", bando: "inca" },
  "quisquis":              { genero: "m", bando: "inca" },
  "paullu-inca":           { genero: "m", bando: "inca-colaborador" },
  "pascac":                { genero: "m", bando: "inca-traidor" },
  // mujeres incas
  "cura-ocllo":            { genero: "f", bando: "inca" },
  "ines-huaylas-yupanqui": { genero: "f", bando: "inca-mestiza" },
  "angelina-yupanqui":     { genero: "f", bando: "inca-mestiza" },
  "francisca-pizarro-yupanqui": { genero: "f", bando: "mestiza" },
  // hombres españoles
  "francisco-pizarro":     { genero: "m", bando: "espanol" },
  "hernando-pizarro":      { genero: "m", bando: "espanol" },
  "gonzalo-pizarro":       { genero: "m", bando: "espanol" },
  "juan-pizarro":          { genero: "m", bando: "espanol" },
  "hernando-de-soto":      { genero: "m", bando: "espanol" },
  "diego-de-almagro":      { genero: "m", bando: "espanol" },
  "alonso-de-alvarado":    { genero: "m", bando: "espanol" },
  "fray-vicente-de-valverde": { genero: "m", bando: "religioso" },
  "fray-marcos-garcia":    { genero: "m", bando: "religioso" },
  "fray-diego-ortiz":      { genero: "m", bando: "religioso" },
  // interpretes / mestizos
  "felipillo":             { genero: "m", bando: "interprete" },
  "martinillo":            { genero: "m", bando: "interprete" },
  "martin-de-pando":       { genero: "m", bando: "interprete" },
};

function ensureField(text, key, value) {
  const re = new RegExp(`^${key}:\\s*.*$`, "m");
  if (re.test(text)) {
    return text.replace(re, `${key}: ${value}`);
  }
  // Insert after `tipo:` line
  const lines = text.split("\n");
  const tipoIdx = lines.findIndex(
    (l, i) => i > 0 && i < 30 && l.startsWith("tipo:")
  );
  if (tipoIdx < 0) return text;
  lines.splice(tipoIdx + 1, 0, `${key}: ${value}`);
  return lines.join("\n");
}

let changed = 0;
for (const [slug, meta] of Object.entries(PERSONAJES_META)) {
  const file = path.join(ROOT, "content", "personajes", `${slug}.md`);
  if (!fs.existsSync(file)) {
    console.log(`  missing: ${slug}`);
    continue;
  }
  let text = fs.readFileSync(file, "utf8");
  let updated = text;
  for (const [k, v] of Object.entries(meta)) {
    updated = ensureField(updated, k, v);
  }
  if (updated !== text) {
    fs.writeFileSync(file, updated, "utf8");
    changed++;
  }
}
console.log(`actualizados: ${changed}/${Object.keys(PERSONAJES_META).length}`);
