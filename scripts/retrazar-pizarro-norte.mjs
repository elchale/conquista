// Re-traza GRANULARMENTE el tramo Tumbes -> Cajamarca de la marcha de Pizarro (1532),
// usando los waypoints documentados (Xerez 1534 + reconstrucción de Vargas Ugarte / Busto).
// Reemplaza el único segmento OSRM gigante (Tangarará -> Cajamarca, ~400 km, que producía
// curvas raras) por una secuencia de anclas reales densificadas por tramos cortos.
// Conserva intacto el sur (Cajamarca -> Cuzco).
//
//   node scripts/retrazar-pizarro-norte.mjs            # ejecuta
//   node scripts/retrazar-pizarro-norte.mjs --dry-run  # solo muestra el plan
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const LUGARES = path.join(ROOT, "content", "data", "lugares.json");
const dryRun = process.argv.includes("--dry-run");
const epsilon = 0.0006;     // ~60 m Douglas-Peucker
const sleepMs = 250;
const OSRM = "https://router.project-osrm.org/route/v1/driving";

// --- Nuevas paradas (coords geocodificadas en OpenStreetMap) ---
const NUEVOS_LUGARES = [
  { id: "tambo-grande", nombre: "Tambo Grande", lat: -4.9150, lng: -80.3562, etnia: "tallanes" },
  { id: "chulucanas",   nombre: "Chulucanas",   lat: -5.1288, lng: -80.1974, etnia: "tallanes" },
  { id: "pabur",        nombre: "Pabur",        lat: -5.1718, lng: -80.0894, etnia: "tallanes",
    notas2: "Pabur Viejo, distrito de La Matanza (Morropón). El usuario lo conocía como 'Pabur o La Matanza': La Matanza es el distrito moderno; Pabur la parada documentada." },
  { id: "morropon",     nombre: "Morropón",     lat: -5.2500, lng: -80.0000, etnia: "tallanes" },
  { id: "serran",       nombre: "Serrán (Zaran)", lat: -5.4328, lng: -79.7770, etnia: "tallanes",
    fuentes: ["xerez-1534"],
    notas2: "El 'Zaran' de las crónicas. Parada documentada por Xerez (1534): aquí Pizarro se detuvo varios días y envió a Hernando de Soto a reconocer la guarnición inca de Caxas, en la sierra." },
  { id: "motupe",       nombre: "Motupe",       lat: -6.1544, lng: -79.7171, etnia: "lambayeque" },
  { id: "jayanca",      nombre: "Jayanca",      lat: -6.2981, lng: -79.8705, etnia: "lambayeque" },
  { id: "tucume",       nombre: "Túcume",       lat: -6.5031, lng: -79.8754, etnia: "lambayeque",
    notas2: "Gran centro Sicán/Lambayeque (Valle de las Pirámides)." },
  { id: "cinto",        nombre: "Cinto",        lat: -6.7800, lng: -79.7508, etnia: "lambayeque",
    notas2: "Antiguo curacazgo de Cinto, en el área de la actual Chiclayo/Pomalca. Coordenada aproximada." },
  { id: "sana",         nombre: "Valle de Saña (Zaña)", lat: -6.8865, lng: -79.6807, etnia: "lambayeque",
    notas2: "Llegada el 6 nov 1532; parada de ~2 días al saber que Atahualpa había vuelto de Huamachuco a Cajamarca. Aquí la hueste deja la costa y emprende el ascenso a la sierra." },
  { id: "chongoyape",   nombre: "Chongoyape",   lat: -6.6327, lng: -79.4708, etnia: "lambayeque",
    notas2: "Boca del ascenso: desde aquí la columna sube por el valle del río Chancay (Lambayeque) hacia la sierra." },
  { id: "santa-cruz-cajamarca", nombre: "Santa Cruz (de Succhabamba)", lat: -6.6942, lng: -78.9753,
    notas2: "Punto alto del ascenso por el valle del Chancay; desde aquí la ruta tuerce al sur hacia el valle de Cajamarca." },
];

const NOTA_BASE =
  "Parada de la marcha de Pizarro de la costa a Cajamarca (sep–nov 1532). Coordenada del pueblo moderno usada como referencia del lugar histórico (precisión aproximada). Secuencia documentada en Xerez (1534) y reconstruida por R. Vargas Ugarte y J. A. del Busto.";

// Orden topográfico del tramo norte (de Tangarará a Cajamarca, ambos ya existentes):
const ANCLAS_NORTE = [
  "tangarara", "tambo-grande", "chulucanas", "pabur", "morropon", "serran",
  "motupe", "jayanca", "tucume", "cinto", "sana", "chongoyape",
  "santa-cruz-cajamarca", "cajamarca",
];

// ---------- helpers de geometría (de densificar-osrm.mjs) ----------
function perpDistance(p, a, b) {
  const [py, px] = p, [ay, ax] = a, [by, bx] = b;
  const dx = bx - ax, dy = by - ay;
  if (dx === 0 && dy === 0) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
function douglasPeucker(points, eps) {
  if (points.length < 3) return points;
  let maxD = 0, idx = 0;
  const first = points[0], last = points[points.length - 1];
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpDistance(points[i], first, last);
    if (d > maxD) { maxD = d; idx = i; }
  }
  if (maxD > eps) {
    const left = douglasPeucker(points.slice(0, idx + 1), eps);
    const right = douglasPeucker(points.slice(idx), eps);
    return [...left.slice(0, -1), ...right];
  }
  return [first, last];
}
function removeSpikes(points, cosThreshold = -0.3) {
  if (points.length < 3) return points;
  let result = points.slice(), changed = true, it = 0;
  while (changed && it < 5) {
    changed = false; it++;
    const next = [result[0]];
    for (let i = 1; i < result.length - 1; i++) {
      const a = result[i - 1], p = result[i], b = result[i + 1];
      const v1x = p[1] - a[1], v1y = p[0] - a[0], v2x = b[1] - p[1], v2y = b[0] - p[0];
      const m1 = Math.hypot(v1x, v1y), m2 = Math.hypot(v2x, v2y);
      if (m1 === 0 || m2 === 0) { changed = true; continue; }
      const cos = (v1x * v2x + v1y * v2y) / (m1 * m2);
      if (cos < cosThreshold) { changed = true; continue; }
      next.push(p);
    }
    next.push(result[result.length - 1]);
    result = next;
  }
  return result;
}
async function osrmRoute(from, to) {
  const url = `${OSRM}/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
  const res = await fetch(url, { headers: { "User-Agent": "ConquistaArchive/0.3 (research)" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json.routes?.[0]?.geometry?.coordinates) return null;
  return json.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
}
function haversine(a, b) {
  const R = 6371, dLat = ((b[0]-a[0])*Math.PI)/180, dLng = ((b[1]-a[1])*Math.PI)/180;
  const x = Math.sin(dLat/2)**2 + Math.cos(a[0]*Math.PI/180)*Math.cos(b[0]*Math.PI/180)*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(x));
}

// ---------- main ----------
const data = JSON.parse(fs.readFileSync(LUGARES, "utf8"));
const byId = new Map(data.lugares.map((l) => [l.id, l]));

// 1) Insertar nuevas paradas
for (const n of NUEVOS_LUGARES) {
  if (byId.has(n.id)) { console.log(`  lugar ya existe: ${n.id}`); continue; }
  const lugar = {
    id: n.id, nombre: n.nombre, tipo: "parada-marcha-1532",
    lat: n.lat, lng: n.lng, precision: "aproximada",
    etnia: n.etnia ?? "andino",
    notas: (n.notas2 ? n.notas2 + " " : "") + NOTA_BASE,
    fuentes: n.fuentes ?? [],
  };
  data.lugares.push(lugar);
  byId.set(n.id, lugar);
  console.log(`  + lugar: ${n.id} (${n.lat}, ${n.lng})`);
}

const coords = (id) => { const l = byId.get(id); return [l.lat, l.lng]; };

const ruta = data.rutas.find((r) => r.id === "pizarro-1532-1533");
const idxTangarara = ruta.puntos.findIndex((p) => p.lugar_id === "tangarara");
const idxCajamarca = ruta.puntos.findIndex((p, i) => i > idxTangarara && p.lugar_id === "cajamarca");
console.log(`\nSplice: tangarara@${idxTangarara}  cajamarca@${idxCajamarca}  (total ${ruta.puntos.length})`);
console.log(`Tramo norte: ${ANCLAS_NORTE.join(" -> ")}`);

if (dryRun) { console.log("\n(dry-run, sin cambios)"); process.exit(0); }

// 2) Densificar el tramo norte por pares de anclas
const middle = [];
let added = 0;
for (let i = 1; i < ANCLAS_NORTE.length; i++) {
  const prev = ANCLAS_NORTE[i - 1], cur = ANCLAS_NORTE[i];
  const a = coords(prev), b = coords(cur);
  const km = haversine(a, b).toFixed(0);
  let geomN = 0;
  try {
    const geom = await osrmRoute(a, b);
    if (geom && geom.length >= 3) {
      let g = douglasPeucker(geom, epsilon);
      g = removeSpikes(g, -0.3);
      for (let j = 1; j < g.length - 1; j++) {
        middle.push({ lat: Number(g[j][0].toFixed(5)), lng: Number(g[j][1].toFixed(5)), via: "osrm" });
        geomN++; added++;
      }
    }
  } catch (e) { console.log(`    OSRM ${prev}->${cur}: ${e.message}`); }
  // la ancla de destino, salvo cajamarca (que se conserva del tramo sur)
  if (cur !== "cajamarca") middle.push({ lugar_id: cur });
  console.log(`  ${prev} -> ${cur}  (${km} km, +${geomN} osrm)`);
  await new Promise((r) => setTimeout(r, sleepMs));
}

// 3) Reensamblar: [0..tangarara] + middle + [cajamarca..fin]
const nuevo = [
  ...ruta.puntos.slice(0, idxTangarara + 1),
  ...middle,
  ...ruta.puntos.slice(idxCajamarca),
];
console.log(`\npuntos: ${ruta.puntos.length} -> ${nuevo.length}  (osrm norte añadidos: ${added})`);
ruta.puntos = nuevo;

// backup + escribir
const backup = path.join(ROOT, "content", "data", `lugares.backup-${Date.now()}.json`);
fs.writeFileSync(backup, JSON.stringify(JSON.parse(fs.readFileSync(LUGARES, "utf8")), null, 2));
fs.writeFileSync(LUGARES, JSON.stringify(data, null, 2), "utf8");
console.log(`Backup: ${path.basename(backup)}\nListo.`);
