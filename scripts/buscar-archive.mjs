// Research helper: search archive.org for public-domain scans and report which
// candidates actually have a downloadable PDF (+ size). Read-only; downloads nothing.
//
//   node scripts/buscar-archive.mjs "francisco lopez de gomara historia general indias"
//   node scripts/buscar-archive.mjs --id <identifier>   # inspect one item's files
//
// Prints, per candidate: identifier · year · downloads · [PDF size or "no pdf"].

const UA = "ConquistaArchive/0.1 (investigacion academica; charlie.feijoo@gmail.com)";

async function metadata(id) {
  const res = await fetch(`https://archive.org/metadata/${id}`, {
    headers: { Accept: "application/json", "User-Agent": UA },
  });
  if (!res.ok) return null;
  return res.json();
}

function bestPdf(meta) {
  const files = meta?.files ?? [];
  const pdf =
    files.find(
      (f) =>
        /\.pdf$/i.test(f.name) &&
        (f.format === "Text PDF" || f.format === "Image Container PDF")
    ) || files.find((f) => /\.pdf$/i.test(f.name));
  if (!pdf) return null;
  const mb = pdf.size ? (Number(pdf.size) / 1024 / 1024).toFixed(1) : "?";
  return { name: pdf.name, mb, url: `https://archive.org/download/${meta.metadata.identifier}/${encodeURIComponent(pdf.name)}` };
}

async function inspectOne(id) {
  const meta = await metadata(id);
  if (!meta) return console.log(`  ${id}: (sin metadata)`);
  const access = meta.metadata?.["access-restricted-item"] === "true" ? "BORROW/restringido" : "libre";
  const pdf = bestPdf(meta);
  console.log(`\n${id}`);
  console.log(`  titulo: ${meta.metadata?.title}`);
  console.log(`  year:   ${meta.metadata?.year ?? meta.metadata?.date ?? "?"}  acceso: ${access}`);
  console.log(`  pdf:    ${pdf ? `${pdf.mb} MB → ${pdf.url}` : "NINGUNO"}`);
}

async function search(query) {
  const url =
    `https://archive.org/advancedsearch.php?q=${encodeURIComponent(query)}` +
    `&fl[]=identifier&fl[]=title&fl[]=year&fl[]=downloads&fl[]=mediatype` +
    `&rows=12&page=1&output=json`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  const json = await res.json();
  const docs = json?.response?.docs ?? [];
  console.log(`\n=== "${query}" → ${docs.length} resultados ===`);
  for (const d of docs) {
    if (d.mediatype && d.mediatype !== "texts") continue;
    const meta = await metadata(d.identifier);
    const pdf = meta ? bestPdf(meta) : null;
    const access = meta?.metadata?.["access-restricted-item"] === "true" ? "BORROW" : "libre";
    console.log(
      `  ${String(d.identifier).padEnd(48)} ${String(d.year ?? "?").padEnd(6)} ` +
      `dl:${String(d.downloads ?? 0).padEnd(7)} ${access.padEnd(7)} ${pdf ? pdf.mb + "MB" : "no-pdf"}`
    );
    console.log(`      ${String(d.title ?? "").slice(0, 90)}`);
  }
}

const args = process.argv.slice(2);
if (args[0] === "--id") {
  for (const id of args.slice(1)) await inspectOne(id);
} else {
  await search(args.join(" "));
}
