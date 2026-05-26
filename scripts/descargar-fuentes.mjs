// Descarga los PDFs catalogados a /docs/<tipo>/<id>.pdf
//
// Estrategia:
// - Para URLs `tipo: "pdf"` se descarga directo.
// - Para URLs `archive.org/details/<id>` se deriva `archive.org/download/<id>/<id>.pdf`.
// - Verifica que la respuesta sea PDF real (magic bytes %PDF) y que pese > 100 KB; si no, lo descarta.
// - Saltea archivos ya existentes (no re-descarga).
// - Actualiza `pdf_local` en cada fuente que se descargue exitosamente.
//
// Uso:
//   node scripts/descargar-fuentes.mjs              # todo
//   node scripts/descargar-fuentes.mjs --only=xerez-1534
//   node scripts/descargar-fuentes.mjs --dry-run    # muestra qué intentaría sin descargar

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const FUENTES_PATH = path.join(ROOT, "content", "data", "fuentes.json");
// PDFs are served as static assets, so they live under public/. The public/
// prefix is stripped when writing pdf_local so the web path stays "/docs/...".
const PUBLIC_DIR = path.join(ROOT, "public");
const DOCS_DIR = path.join(PUBLIC_DIR, "docs");

const TIPO_DIR = {
  primaria: "primarias",
  secundaria: "secundarias",
  visita: "visitas",
  "ed-critica": "ediciones-criticas",
  otros: "otros",
};

function arg(name) {
  const m = process.argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!m) return null;
  return m.includes("=") ? m.split("=")[1] : true;
}
const onlyId = arg("only");
const dryRun = !!arg("dry-run");

function archiveOrgIdFromLanding(url) {
  const m = url.match(/archive\.org\/details\/([^/?#]+)/);
  return m ? m[1] : null;
}

async function archiveOrgFindPdfUrl(id) {
  // Use IA metadata API to find the actual .pdf file name
  try {
    const res = await fetch(`https://archive.org/metadata/${id}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const meta = await res.json();
    const files = meta.files ?? [];
    // Prefer "Text PDF" or "Image Container PDF" formats
    const pdf =
      files.find(
        (f) =>
          /\.pdf$/i.test(f.name) &&
          (f.format === "Text PDF" || f.format === "Image Container PDF")
      ) || files.find((f) => /\.pdf$/i.test(f.name));
    if (!pdf) return null;
    return `https://archive.org/download/${id}/${encodeURIComponent(pdf.name)}`;
  } catch {
    return null;
  }
}

async function pickDownloadUrl(fuente) {
  const urls = fuente.urls ?? [];
  // 1) direct pdf url
  const direct = urls.find(
    (u) => u.verificado === true && (u.tipo === "pdf" || /\.pdf($|\?)/i.test(u.url))
  );
  if (direct) return { url: direct.url, source: "direct" };

  // 2) archive.org landing → look up actual pdf via metadata API
  for (const u of urls) {
    if (u.verificado === true) {
      const id = archiveOrgIdFromLanding(u.url);
      if (id) {
        const pdfUrl = await archiveOrgFindPdfUrl(id);
        if (pdfUrl) return { url: pdfUrl, source: "archive.org/metadata" };
      }
    }
  }

  return null;
}

const raw = fs.readFileSync(FUENTES_PATH, "utf8");
const data = JSON.parse(raw);
const fuentes = Array.isArray(data.fuentes)
  ? data.fuentes
  : Object.values(data.fuentes);

// First filter by id, then resolve URLs (which is async)
const preFilter = fuentes.filter((f) => {
  if (onlyId && typeof onlyId === "string" && f.id !== onlyId) return false;
  return (f.urls ?? []).some((u) => u.verificado === true);
});

console.log(`Filtradas ${preFilter.length} fuentes con URL verificada. Resolviendo PDFs vía archive.org metadata...`);

const candidatas = [];
for (const f of preFilter) {
  const pick = await pickDownloadUrl(f);
  if (pick) candidatas.push({ f, pick });
}
console.log(`${candidatas.length} con URL PDF resoluble.`);

if (dryRun) {
  for (const { f, pick } of candidatas) {
    console.log(`  ${f.id.padEnd(36)} ← ${pick.source}: ${pick.url}`);
  }
  process.exit(0);
}

const results = { descargadas: [], saltadas: [], errores: [] };

for (const { f, pick } of candidatas) {

  const subdir = TIPO_DIR[f.tipo] ?? "otros";
  const targetDir = path.join(DOCS_DIR, subdir);
  fs.mkdirSync(targetDir, { recursive: true });
  const target = path.join(targetDir, `${f.id}.pdf`);

  if (fs.existsSync(target) && fs.statSync(target).size > 100 * 1024) {
    console.log(`  ✓ ya existe: ${f.id} (${(fs.statSync(target).size / 1024 / 1024).toFixed(1)} MB)`);
    results.saltadas.push(f.id);
    if (!f.pdf_local) {
      f.pdf_local = path.relative(PUBLIC_DIR, target).replace(/\\/g, "/");
    }
    continue;
  }

  process.stdout.write(`  ↓ ${f.id.padEnd(36)} ← ${pick.url.slice(0, 90)} ... `);
  try {
    const res = await fetch(pick.url, {
      redirect: "follow",
      headers: {
        "User-Agent":
          "ConquistaArchive/0.1 (investigación académica; charlie.feijoo@gmail.com)",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());

    // Magic-bytes check: %PDF
    if (buf.length < 100 * 1024) {
      throw new Error(`muy pequeño (${buf.length} bytes — probable HTML/login)`);
    }
    if (buf.slice(0, 4).toString("utf8") !== "%PDF") {
      throw new Error("no es PDF (probable página de login/borrow)");
    }

    fs.writeFileSync(target, buf);
    const mb = (buf.length / 1024 / 1024).toFixed(1);
    console.log(`OK (${mb} MB)`);
    f.pdf_local = path.relative(PUBLIC_DIR, target).replace(/\\/g, "/");
    results.descargadas.push({ id: f.id, mb });
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
    results.errores.push({ id: f.id, msg: e.message });
  }
}

// Persist updated pdf_local
const updated = { ...data, fuentes };
fs.writeFileSync(FUENTES_PATH, JSON.stringify(updated, null, 2), "utf8");

console.log("\n--- Resumen ---");
console.log(`Descargadas:   ${results.descargadas.length}`);
console.log(`Ya existían:   ${results.saltadas.length}`);
console.log(`Con error:     ${results.errores.length}`);
if (results.descargadas.length) {
  const totalMb = results.descargadas.reduce((s, x) => s + Number(x.mb), 0);
  console.log(`Tamaño total descargado: ${totalMb.toFixed(1)} MB`);
}
if (results.errores.length) {
  console.log("\nErrores (probablemente 'borrow only' en archive.org o URL no apunta a PDF):");
  for (const e of results.errores) console.log(`  - ${e.id}: ${e.msg}`);
}
