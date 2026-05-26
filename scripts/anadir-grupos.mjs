// Añade el campo `grupo` al frontmatter de cada personaje según un mapa fijo.
// Solo modifica el campo `grupo` — todo lo demás se preserva.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const PERSONAJES_GRUPO = {
  // Sapas Incas pre-conquista (la dinastía gobernante 1532)
  "manco-inca": "dinastia-inca",
  "atahualpa": "dinastia-inca",
  "huascar": "dinastia-inca",
  // Neoincas en Vilcabamba (1539-1572)
  "titu-cusi": "neoincas-vilcabamba",
  "sayri-tupac": "neoincas-vilcabamba",
  "tupac-amaru-i": "neoincas-vilcabamba",
  // Capitanes y nobles incas
  "vila-orna": "capitanes-incas",
  "challcochima": "capitanes-incas",
  "quisquis": "capitanes-incas",
  // Mujeres incas (coyas, hijas, mestizas con apellido inca)
  "cura-ocllo": "mujeres-incas",
  "ines-huaylas-yupanqui": "mujeres-incas",
  "angelina-yupanqui": "mujeres-incas",
  "francisca-pizarro-yupanqui": "mujeres-incas",
  // Incas que colaboran con o se vuelven contra Manco
  "paullu-inca": "incas-colaboradores",
  "pascac": "incas-colaboradores",
  // Hermanos Pizarro
  "francisco-pizarro": "hermanos-pizarro",
  "hernando-pizarro": "hermanos-pizarro",
  "gonzalo-pizarro": "hermanos-pizarro",
  "juan-pizarro": "hermanos-pizarro",
  // Otros conquistadores
  "hernando-de-soto": "conquistadores",
  "diego-de-almagro": "conquistadores",
  "alonso-de-alvarado": "conquistadores",
  // Religiosos
  "fray-vicente-de-valverde": "religiosos",
  "fray-marcos-garcia": "religiosos",
  "fray-diego-ortiz": "religiosos",
  // Intérpretes y escribanos mestizos
  "felipillo": "interpretes-escribas",
  "martinillo": "interpretes-escribas",
  "martin-de-pando": "interpretes-escribas",
  // Mujeres adicionales
  "buba": "mujeres-incas",
  "ynguill": "mujeres-incas",
  "contarguacho": "mujeres-incas",
  "rahua-ocllo": "mujeres-incas",
  "beatriz-clara-coya": "mujeres-incas",
  "maria-cusi-huarcay": "mujeres-incas",
  "isabel-chimpu-ocllo": "mujeres-incas",
  "ines-munoz": "mujeres-espanolas",
  // Dinastía
  "huayna-capac": "dinastia-inca",
};

let cambiados = 0;
let saltados = 0;

for (const [slug, grupo] of Object.entries(PERSONAJES_GRUPO)) {
  const file = path.join(ROOT, "content", "personajes", `${slug}.md`);
  if (!fs.existsSync(file)) {
    console.log(`  ✗ no existe: ${slug}`);
    continue;
  }
  let text = fs.readFileSync(file, "utf8");
  if (/^grupo:\s*/m.test(text)) {
    // Replace existing grupo line
    const updated = text.replace(/^grupo:\s*.*$/m, `grupo: ${grupo}`);
    if (updated !== text) {
      fs.writeFileSync(file, updated, "utf8");
      cambiados++;
    } else {
      saltados++;
    }
  } else {
    // Insert grupo after the `tipo:` line within frontmatter
    const lines = text.split("\n");
    if (lines[0] !== "---") {
      console.log(`  ✗ sin frontmatter válido: ${slug}`);
      continue;
    }
    const tipoIdx = lines.findIndex(
      (l, i) => i > 0 && i < 30 && l.startsWith("tipo:")
    );
    if (tipoIdx < 0) {
      console.log(`  ✗ sin línea tipo: ${slug}`);
      continue;
    }
    lines.splice(tipoIdx + 1, 0, `grupo: ${grupo}`);
    fs.writeFileSync(file, lines.join("\n"), "utf8");
    cambiados++;
  }
}

console.log(`\nCambiados: ${cambiados}, saltados (igual): ${saltados}`);
