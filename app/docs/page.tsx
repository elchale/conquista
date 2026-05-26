import Link from "next/link";
import { loadFuentes, type Fuente } from "@/lib/fuentes";

export const metadata = {
  title: "Biblioteca — Crónicas de la conquista",
  description:
    "Biblioteca de crónicas y fuentes de la conquista del Perú, con descripción y PDF de cada obra.",
};

// --- Agrupación de las fuentes primarias en "estantes" temáticos ---
type GrupoKey = "testigos" | "cronistas" | "indigena" | "andino" | "tratados";

const GRUPO_DE_CATEGORIA: Record<string, GrupoKey> = {
  relacion_descubrimiento: "testigos",
  cronista_testigo_hispano: "testigos",
  carta_relacion: "testigos",
  cronista_hispano: "cronistas",
  cronista_oficial_hispano: "cronistas",
  cronista_oficial_toledano: "cronistas",
  cronista_hispano_bilingue: "cronistas",
  cronista_jesuita: "cronistas",
  cronista_jesuita_tardio: "cronistas",
  cronista_mercedario: "cronistas",
  cronista_eclesiastico: "cronistas",
  cronista_extirpacion: "andino",
  informe_administrativo: "andino",
  visita_administrativa: "andino",
  cronista_indigena: "indigena",
  voz_indigena: "indigena",
  voz_indigena_mestiza: "indigena",
  cronista_mestizo: "indigena",
  tratado_denuncia: "tratados",
};

const GRUPOS: {
  key: GrupoKey;
  titulo: string;
  glosa: string;
  spine: string; // tailwind bg for the book "spine"
}[] = [
  {
    key: "testigos",
    titulo: "Testigos de la conquista",
    glosa: "Relaciones de quienes vieron el descubrimiento, Cajamarca y la marcha al Cuzco (1528–1571).",
    spine: "bg-accent-rust",
  },
  {
    key: "cronistas",
    titulo: "Cronistas e historiadores",
    glosa: "Síntesis hispanas, oficiales y eclesiásticas de los siglos XVI y XVII.",
    spine: "bg-accent-gold",
  },
  {
    key: "indigena",
    titulo: "Voces indígenas y mestizas",
    glosa: "El Tahuantinsuyu narrado desde dentro: cronistas indígenas, mestizos y bilingües.",
    spine: "bg-accent-jade",
  },
  {
    key: "andino",
    titulo: "Ritos, visitas e informes",
    glosa: "Extirpación de idolatrías, visitas administrativas e informes sobre el mundo andino.",
    spine: "bg-ink-600",
  },
  {
    key: "tratados",
    titulo: "Tratados y denuncias",
    glosa: "La conquista a debate: su justicia y sus consecuencias.",
    spine: "bg-accent-rust",
  },
];

const IDIOMA_LABEL: Record<string, string> = { es: "ES", en: "EN", fr: "FR" };

function añoDe(f: Fuente): number {
  const n = parseInt(String(f.fecha_original ?? "9999").replace(/\D/g, ""), 10);
  return Number.isNaN(n) ? 9999 : n;
}

function apellido(autor: string): string {
  // Heurística: última "palabra fuerte" para la portada (evita SJ, OdeM, paréntesis).
  const limpio = autor.replace(/\(.*?\)/g, "").replace(/\b(SJ|OdeM|OFM)\b/g, "").trim();
  const parts = limpio.split(/\s+/).filter(Boolean);
  return parts.slice(-1)[0] || autor;
}

function FuenteCard({ f }: { f: Fuente }) {
  const grupo = GRUPO_DE_CATEGORIA[f.categoria ?? ""] ?? "cronistas";
  const spine = GRUPOS.find((g) => g.key === grupo)?.spine ?? "bg-ink-600";
  const tieneFacsimil = (f.urls ?? []).some(
    (u) => u.tipo === "facsimil" || (u.edicion_tipo ?? "").includes("facsimil")
  );
  const fuentesLibres = (f.urls ?? []).filter((u) => u.acceso === "libre");

  return (
    <article className="group flex gap-3 rounded border border-ink-200 bg-ink-50 p-3 transition-colors hover:border-accent-gold/70">
      {/* Portada / lomo */}
      <div
        className={`relative hidden sm:flex w-16 shrink-0 flex-col justify-between rounded-sm ${spine} px-1.5 py-2 text-ink-50 shadow-inner`}
      >
        <span className="absolute inset-y-0 left-0 w-[3px] bg-black/20" />
        <span className="font-serif text-[11px] leading-tight line-clamp-4 drop-shadow">
          {apellido(f.autor)}
        </span>
        <span className="font-mono text-[10px] opacity-80">
          {String(f.fecha_original ?? "s.f.")}
        </span>
      </div>

      {/* Cuerpo */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <h3 className="font-serif text-lg font-semibold text-ink-900 leading-snug">
            {f.titulo}
          </h3>
        </div>
        <div className="font-serif text-sm text-ink-700">
          {f.autor}
          <span className="text-ink-400"> · {f.fecha_original ?? "s.f."}</span>
        </div>

        {f.relevancia ? (
          <p className="mt-1.5 text-sm leading-relaxed text-ink-700 line-clamp-4">
            {f.relevancia}
          </p>
        ) : null}

        {f.edicion_recomendada ? (
          <p className="mt-1 text-xs italic text-ink-500 line-clamp-2">
            Edición: {f.edicion_recomendada}
          </p>
        ) : null}

        {/* Badges + acciones */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
          {f.idioma ? (
            <span className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-ink-600">
              {IDIOMA_LABEL[f.idioma] ?? f.idioma.toUpperCase()}
            </span>
          ) : null}
          {tieneFacsimil ? (
            <span className="rounded bg-accent-gold/15 px-1.5 py-0.5 text-accent-gold">
              facsímil ilustrado
            </span>
          ) : null}

          {f.pdf_local ? (
            <Link
              href={`/${f.pdf_local}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded bg-accent-rust px-2 py-0.5 font-medium text-ink-50 hover:bg-accent-rust/90"
            >
              Leer PDF ↗
            </Link>
          ) : fuentesLibres.length > 0 ? (
            <span className="rounded border border-ink-300 px-1.5 py-0.5 text-ink-500">
              enlace externo
            </span>
          ) : (
            <span className="rounded border border-ink-200 px-1.5 py-0.5 italic text-ink-400">
              solo referencia
            </span>
          )}

          {(f.urls ?? []).map((u, i) => (
            <a
              key={i}
              href={u.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-500 underline decoration-ink-300 underline-offset-2 hover:text-accent-rust"
              title={u.nota ?? u.plataforma}
            >
              {u.plataforma}
              {u.tipo === "facsimil" ? " (facsímil)" : ""}
            </a>
          ))}
        </div>

        {f.facsimiles && f.facsimiles.length > 0 ? (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-ink-500">Facsímil ilustrado:</span>
            {f.facsimiles.map((fx, i) => (
              <Link
                key={i}
                href={`/${fx.pdf_local}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded bg-accent-gold px-2 py-0.5 font-medium text-ink-50 hover:bg-accent-gold/90"
              >
                {fx.vol} ↗
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default async function BibliotecaPage() {
  const catalog = await loadFuentes();
  const fuentes = Object.values(catalog.fuentes);

  const primarias = fuentes.filter((f) => f.tipo === "primaria");
  const estudios = fuentes
    .filter((f) => f.tipo !== "primaria")
    .sort((a, b) => añoDe(a) - añoDe(b));

  const conPdf = fuentes.filter((f) => f.pdf_local).length;

  const porGrupo = (key: GrupoKey) =>
    primarias
      .filter((f) => (GRUPO_DE_CATEGORIA[f.categoria ?? ""] ?? "cronistas") === key)
      .sort((a, b) => añoDe(a) - añoDe(b));

  return (
    <div className="px-6 py-8 md:px-10 max-w-5xl">
      <header className="mb-8 border-b border-ink-200 pb-5">
        <h1 className="font-serif text-3xl font-semibold text-ink-900">
          Biblioteca de crónicas
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-700">
          Las fuentes de la conquista del Perú (1527–1572): crónicas de testigos,
          historiadores, voces indígenas y mestizas, visitas administrativas y
          estudios modernos. Cada obra incluye una descripción y, cuando está en
          dominio público, su PDF descargable.
        </p>
        <p className="mt-2 text-xs text-ink-500">
          {primarias.length} fuentes primarias · {conPdf} con PDF · {estudios.length}{" "}
          estudios modernos ·{" "}
          <Link href="/fuentes" className="underline hover:text-accent-rust">
            ver índice de citas
          </Link>
        </p>
      </header>

      {GRUPOS.map((g) => {
        const items = porGrupo(g.key);
        if (items.length === 0) return null;
        return (
          <section key={g.key} className="mb-10">
            <div className="mb-3">
              <h2 className="font-serif text-2xl font-semibold text-ink-800">
                {g.titulo}{" "}
                <span className="text-base font-normal text-ink-400">
                  ({items.length})
                </span>
              </h2>
              <p className="text-sm italic text-ink-500">{g.glosa}</p>
            </div>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {items.map((f) => (
                <FuenteCard key={f.id} f={f} />
              ))}
            </div>
          </section>
        );
      })}

      {estudios.length > 0 ? (
        <section className="mb-10">
          <div className="mb-3">
            <h2 className="font-serif text-2xl font-semibold text-ink-800">
              Estudios modernos{" "}
              <span className="text-base font-normal text-ink-400">
                ({estudios.length})
              </span>
            </h2>
            <p className="text-sm italic text-ink-500">
              Monografías e historiografía contemporánea. Muchas están en copyright
              (solo préstamo digital o referencia).
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {estudios.map((f) => (
              <FuenteCard key={f.id} f={f} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
