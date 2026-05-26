// Densifica las rutas usando OSRM (Open Source Routing Machine).
// Para cada par de waypoints consecutivos en una ruta, consulta el API público
// de OSRM y reemplaza la línea recta por la geometría real de la carretera.
//
// Mejoras v2:
// - Pre-thinning: descarta waypoints sin lugar_id que estén muy cerca de otro (< 5km),
//   evita zigzags causados por OSRM tratando de conectar puntos casi-coincidentes.
// - Douglas-Peucker simplification del output (preserva curvas importantes, elimina ruido).
// - Soporte de profile "driving" (default) o "foot" si el servidor lo soporta.
//
// Uso:
//   node scripts/densificar-osrm.mjs                           # todas
//   node scripts/densificar-osrm.mjs --only=ruta-id            # una
//   node scripts/densificar-osrm.mjs --epsilon=0.0008          # toleranica D-P (~80m)
//   node scripts/densificar-osrm.mjs --min-anchor-km=5         # distancia mínima entre anchors

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const LUGARES_PATH = path.join(ROOT, "content", "data", "lugares.json");
const BACKUP_PATH = path.join(ROOT, "content", "data", `lugares.backup-${Date.now()}.json`);

function arg(name, def = null) {
  const m = process.argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!m) return def;
  return m.includes("=") ? m.split("=")[1] : true;
}
const onlyId = arg("only");
const maxSegKm = Number(arg("max-seg-km", 500));
const minAnchorKm = Number(arg("min-anchor-km", 4));
const epsilon = Number(arg("epsilon", 0.0008)); // ~80m on Earth surface for D-P
const sleepMs = Number(arg("sleep-ms", 200));
const profile = arg("profile", "driving");
const OSRM_BASE =
  arg("osrm", null) || `https://router.project-osrm.org/route/v1/${profile}`;

const data = JSON.parse(fs.readFileSync(LUGARES_PATH, "utf8"));
fs.writeFileSync(BACKUP_PATH, JSON.stringify(data, null, 2), "utf8");
console.log(`Backup: ${path.basename(BACKUP_PATH)}`);

const lugaresById = new Map(data.lugares.map((l) => [l.id, l]));

function pointCoords(p) {
  if (p.lugar_id) {
    const l = lugaresById.get(p.lugar_id);
    return l ? [l.lat, l.lng] : null;
  }
  if (typeof p.lat === "number" && typeof p.lng === "number") {
    return [p.lat, p.lng];
  }
  return null;
}

function haversine(a, b) {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const aa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(aa));
}

// Douglas-Peucker line simplification.
// Preserves first and last points; recursively keeps points whose perpendicular
// distance from the line segment exceeds epsilon (in degrees lat/lng approx).
function douglasPeucker(points, eps) {
  if (points.length < 3) return points;
  let maxD = 0;
  let idx = 0;
  const [first, last] = [points[0], points[points.length - 1]];
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpDistance(points[i], first, last);
    if (d > maxD) {
      maxD = d;
      idx = i;
    }
  }
  if (maxD > eps) {
    const left = douglasPeucker(points.slice(0, idx + 1), eps);
    const right = douglasPeucker(points.slice(idx), eps);
    return [...left.slice(0, -1), ...right];
  }
  return [first, last];
}

function perpDistance(p, a, b) {
  const [py, px] = p;
  const [ay, ax] = a;
  const [by, bx] = b;
  const dx = bx - ax;
  const dy = by - ay;
  if (dx === 0 && dy === 0) {
    return Math.hypot(px - ax, py - ay);
  }
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  const lx = ax + t * dx;
  const ly = ay + t * dy;
  return Math.hypot(px - lx, py - ly);
}

// Remove "spike" / backtrack vertices where the heading reverses sharply.
// At each interior point P between A and B, compute the cosine of the angle
// of the turn (1 = straight, -1 = U-turn). Drop P if cos < threshold.
function removeSpikes(points, cosThreshold = -0.5) {
  if (points.length < 3) return points;
  let result = points.slice();
  let changed = true;
  let iterations = 0;
  while (changed && iterations < 5) {
    changed = false;
    iterations++;
    const next = [result[0]];
    for (let i = 1; i < result.length - 1; i++) {
      const a = result[i - 1];
      const p = result[i];
      const b = result[i + 1];
      const v1x = p[1] - a[1], v1y = p[0] - a[0];
      const v2x = b[1] - p[1], v2y = b[0] - p[0];
      const m1 = Math.hypot(v1x, v1y);
      const m2 = Math.hypot(v2x, v2y);
      if (m1 === 0 || m2 === 0) {
        changed = true;
        continue;
      }
      const cos = (v1x * v2x + v1y * v2y) / (m1 * m2);
      // cos near 1 = straight; cos < threshold (e.g. -0.5 = >120° turn) = sharp backtrack
      if (cos < cosThreshold) {
        changed = true;
        continue; // drop p
      }
      next.push(p);
    }
    next.push(result[result.length - 1]);
    result = next;
  }
  return result;
}

// Chaikin corner-cutting smoothing — replaces each interior vertex with two
// points along the adjacent segments (at 1/4 and 3/4). Reduces sharp angles
// without major shape change. Iterate N times.
function chaikinSmooth(points, iterations = 1) {
  let pts = points;
  for (let n = 0; n < iterations; n++) {
    if (pts.length < 3) return pts;
    const out = [pts[0]];
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i];
      const q = pts[i + 1];
      const Q = [p[0] * 0.75 + q[0] * 0.25, p[1] * 0.75 + q[1] * 0.25];
      const R = [p[0] * 0.25 + q[0] * 0.75, p[1] * 0.25 + q[1] * 0.75];
      out.push(Q, R);
    }
    out.push(pts[pts.length - 1]);
    pts = out;
  }
  return pts;
}

async function osrmRoute(from, to) {
  const url = `${OSRM_BASE}/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
  const res = await fetch(url, {
    headers: { "User-Agent": "ConquistaArchive/0.2 (research)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json.routes?.[0]?.geometry?.coordinates) return null;
  return json.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
}

// Strip OSRM-generated points before re-densifying.
function stripOsrm(puntos) {
  return puntos.filter((p) => p.via !== "osrm");
}

// Pre-thinning: remove non-lugar waypoints that are too close to the previous anchor.
// This avoids feeding OSRM closely-spaced points that cause zigzags.
function preThin(puntos, minKm) {
  if (puntos.length < 3) return puntos;
  const out = [puntos[0]];
  let lastCoords = pointCoords(puntos[0]);
  for (let i = 1; i < puntos.length - 1; i++) {
    const cur = puntos[i];
    const curCoords = pointCoords(cur);
    if (!curCoords) {
      out.push(cur);
      continue;
    }
    // Always keep lugar_id markers — they're narrative anchors.
    if (cur.lugar_id) {
      out.push(cur);
      lastCoords = curCoords;
      continue;
    }
    // For intermediate waypoints: keep only if far enough from the last kept anchor.
    if (lastCoords && haversine(lastCoords, curCoords) >= minKm) {
      out.push(cur);
      lastCoords = curCoords;
    }
  }
  out.push(puntos[puntos.length - 1]);
  return out;
}

let totalCalls = 0;
let totalSuccess = 0;
let totalFail = 0;
let totalSkip = 0;
let totalAdded = 0;

async function densifyRoute(ruta) {
  const out = [];
  for (let i = 0; i < ruta.puntos.length; i++) {
    out.push(ruta.puntos[i]);
    if (i === ruta.puntos.length - 1) break;
    const cur = ruta.puntos[i];
    const next = ruta.puntos[i + 1];
    const a = pointCoords(cur);
    const b = pointCoords(next);
    if (!a || !b) {
      totalSkip++;
      continue;
    }
    const dist = haversine(a, b);
    if (dist < 0.8) {
      totalSkip++;
      continue;
    }
    if (dist > maxSegKm) {
      console.log(`    seg ${i}: ${dist.toFixed(1)}km > ${maxSegKm}km, skip`);
      totalSkip++;
      continue;
    }
    totalCalls++;
    try {
      const geom = await osrmRoute(a, b);
      if (!geom || geom.length < 3) {
        totalFail++;
        continue;
      }
      // Pipeline: D-P simplify → spike removal (drop backtracks) → optional smoothing
      let processed = douglasPeucker(geom, epsilon);
      processed = removeSpikes(processed, -0.3); // drop turns > ~107° (very sharp)
      // Skip first/last (already in cur/next).
      for (let j = 1; j < processed.length - 1; j++) {
        out.push({
          lat: Number(processed[j][0].toFixed(5)),
          lng: Number(processed[j][1].toFixed(5)),
          via: "osrm",
        });
        totalAdded++;
      }
      totalSuccess++;
    } catch (e) {
      console.log(`    seg ${i}: ${e.message}`);
      totalFail++;
    }
    await new Promise((r) => setTimeout(r, sleepMs));
  }
  return out;
}

const rutasToProcess = data.rutas.filter((r) =>
  onlyId && typeof onlyId === "string" ? r.id === onlyId : true
);

console.log(
  `Procesando ${rutasToProcess.length}/${data.rutas.length} rutas. OSRM: ${OSRM_BASE}`
);
console.log(
  `Params: epsilon=${epsilon}, min-anchor-km=${minAnchorKm}, max-seg-km=${maxSegKm}`
);

(async () => {
  for (const ruta of rutasToProcess) {
    const before = ruta.puntos.length;
    ruta.puntos = stripOsrm(ruta.puntos);
    const stripped = ruta.puntos.length;
    ruta.puntos = preThin(ruta.puntos, minAnchorKm);
    const thinned = ruta.puntos.length;
    process.stdout.write(`${ruta.id.padEnd(46)} ${before}->${stripped}->${thinned}->`);
    ruta.puntos = await densifyRoute(ruta);
    console.log(`${ruta.puntos.length}`);
    fs.writeFileSync(LUGARES_PATH, JSON.stringify(data, null, 2), "utf8");
  }
  console.log("\n--- Resumen ---");
  console.log(`OSRM calls:    ${totalCalls}`);
  console.log(`  ok:          ${totalSuccess}`);
  console.log(`  fail:        ${totalFail}`);
  console.log(`  skipped:     ${totalSkip}`);
  console.log(`puntos OSRM añadidos: ${totalAdded}`);
})();
