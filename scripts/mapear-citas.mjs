// Reemplaza los placeholders titu-1570-c-XXX en los MDs por los cite-keys reales c01-c60.
// Solo reemplaza los casos con mapeo claro al contexto de la cita; deja como PENDIENTE
// los que no tienen un match obvio en las 60 citas extraídas.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// Mapping informed by reading the 60 citas contexts.
// Format: placeholder → real cite-key (or null to leave as PENDIENTE for manual review).
const MAPPING = {
  "titu-1570-c-arrojo": "titu-1570-c04",
  "titu-1570-c-arrojo-quillca": "titu-1570-c04",
  "titu-1570-c-cerco": "titu-1570-c22",
  "titu-1570-c-cerco-cuzco": "titu-1570-c22",
  "titu-1570-c-cura-asaetada": "titu-1570-c41",
  "titu-1570-c-discurso-disimulo": "titu-1570-c30",
  "titu-1570-c-discurso-final": "titu-1570-c45",
  "titu-1570-c-emisarios": "titu-1570-c08",
  "titu-1570-c-guarivilca": "titu-1570-c38",
  "titu-1570-c-legitimidad": "titu-1570-c59",
  "titu-1570-c-machu-capitu": "titu-1570-c09",
  "titu-1570-c-momias-vitcos": "titu-1570-c36",
  "titu-1570-c-oroncoy": "titu-1570-c37",
  "titu-1570-c-pascac": "titu-1570-c21",
  "titu-1570-c-posta": "titu-1570-c31",
  "titu-1570-c-posta-lima": "titu-1570-c31",
  "titu-1570-c-primera-prision": "titu-1570-c10",
  "titu-1570-c-quillca": "titu-1570-c04",
  "titu-1570-c-segunda-prision": "titu-1570-c13",
  "titu-1570-c-titu-lanza": "titu-1570-c43",
  "titu-1570-c-vacaroc": "titu-1570-c20",
  "titu-1570-c-vila-orna-confronta": "titu-1570-c17",
  "titu-1570-c-vitcos": "titu-1570-c35",
  "titu-1570-c-vitcos-fiesta": "titu-1570-c35",
};

// Cite-keys placeholders we WANT TO LEAVE flagged (no good match in current 60 citas).
// Becomes: [^titu-1570-c-XXX] → "[PENDIENTE: cita c-XXX]" plain text marker.
const NO_MATCH = [
  "titu-1570-c-antonico",
  "titu-1570-c-buba",
  "titu-1570-c-captura-titu",
  "titu-1570-c-challcochima",
  "titu-1570-c-entrada-cuzco",
  "titu-1570-c-juan-agita",
  "titu-1570-c-muerte-huascar",
  "titu-1570-c-quisquis-muerte",
  "titu-1570-c-sayri-muerte",
  "titu-1570-c-soto-capi",
  "titu-1570-c-vila-orna-muerte",
];

// Special placeholder we used (not titu-): leave/flag
const SPECIAL_PLACEHOLDERS = ["titu-1570-personalidad-PENDIENTE"];

function walkMd(dir) {
  const out = [];
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) out.push(...walkMd(p));
    else if (f.name.endsWith(".md")) out.push(p);
  }
  return out;
}

const files = walkMd(path.join(ROOT, "content"));
let changed = 0;
let totalReplacements = 0;
let totalFlagged = 0;

for (const file of files) {
  let text = fs.readFileSync(file, "utf8");
  let originalText = text;
  for (const [placeholder, real] of Object.entries(MAPPING)) {
    const re = new RegExp(`\\[\\^${placeholder}\\]`, "g");
    text = text.replace(re, (m) => {
      totalReplacements++;
      return `[^${real}]`;
    });
  }
  // Convert no-match placeholders into a visible PENDIENTE flag (not a footnote anymore).
  for (const placeholder of [...NO_MATCH, ...SPECIAL_PLACEHOLDERS]) {
    const re = new RegExp(`\\[\\^${placeholder}\\]`, "g");
    text = text.replace(re, () => {
      totalFlagged++;
      return ` [PENDIENTE: cita no resuelta en índice — ${placeholder}]`;
    });
  }
  if (text !== originalText) {
    fs.writeFileSync(file, text, "utf8");
    changed++;
  }
}

console.log(
  `archivos modificados: ${changed}, reemplazos: ${totalReplacements}, marcadas como pendientes: ${totalFlagged}`
);
