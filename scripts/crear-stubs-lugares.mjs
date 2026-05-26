// Crea stubs MD mínimos para lugares definidos en lugares.json que no tengan MD aún.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const LUGARES_DIR = path.join(ROOT, "content", "lugares");
const DATA = JSON.parse(
  fs.readFileSync(path.join(ROOT, "content", "data", "lugares.json"), "utf8")
);

let creados = 0, existentes = 0;

for (const lugar of DATA.lugares) {
  const slug = lugar.id;
  const file = path.join(LUGARES_DIR, `${slug}.md`);
  if (fs.existsSync(file)) {
    existentes++;
    continue;
  }
  const tags = [
    lugar.tipo?.replace(/-/g, "-"),
    lugar.etnia?.replace(/-/g, "-"),
  ].filter(Boolean);

  const body = `---
tipo: lugar
nombre: ${JSON.stringify(lugar.nombre)}
slug: ${slug}
tags: [${tags.map((t) => JSON.stringify(t)).join(", ")}]
ubicacion: { lat: ${lugar.lat}, lng: ${lugar.lng}${
    lugar.altitud_m ? ", altitud_m: " + lugar.altitud_m : ""
  }, precision: ${lugar.precision || "desconocida"} }
etnia: ${lugar.etnia || ""}
fuentes_principales: [${(lugar.fuentes || []).map((f) => JSON.stringify(f)).join(", ")}]
estado: stub
ultima_revision: 2026-05-19
---

# ${lugar.nombre}

## Identificación

Tipo: **${lugar.tipo}**. ${
    lugar.altitud_m ? `Altitud: ${lugar.altitud_m} m. ` : ""
  }Coordenadas: ${lugar.lat}, ${lugar.lng} (precisión: ${
    lugar.precision || "desconocida"
  }).

${lugar.notas || ""}

## Eventos asociados

[PENDIENTE: vincular eventos del timeline que ocurren aquí]

## Fuentes principales

${(lugar.fuentes || []).map((f) => `- ${f}`).join("\n") || "[PENDIENTE]"}

## Ver también

- [[mapa]] — ubicación geográfica.
`;
  fs.writeFileSync(file, body, "utf8");
  creados++;
}

console.log(`stubs creados: ${creados}, ya existentes: ${existentes}`);
