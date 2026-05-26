"use client";

import { useState, useEffect, useRef } from "react";
import MarkdownView from "./MarkdownView";

interface Props {
  tipo: string;
  slug: string;
  initialFrontmatter: Record<string, unknown>;
  initialBody: string;
  citationLookup: Record<string, string>;
}

export default function Editor({
  tipo,
  slug,
  initialFrontmatter,
  initialBody,
  citationLookup,
}: Props) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [body, setBody] = useState(initialBody);
  const [frontmatterText, setFrontmatterText] = useState(
    () => yamlStringify(initialFrontmatter)
  );
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/content/${tipo}/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frontmatter: parseFrontmatterText(frontmatterText),
          body,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setSavedAt(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  function scheduleSave() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(save, 1200);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setMode("view")}
          className={`text-xs px-2 py-1 rounded ${
            mode === "view"
              ? "bg-ink-800 text-ink-50"
              : "bg-ink-100 text-ink-700 hover:bg-ink-200"
          }`}
        >
          Ver
        </button>
        <button
          onClick={() => setMode("edit")}
          className={`text-xs px-2 py-1 rounded ${
            mode === "edit"
              ? "bg-ink-800 text-ink-50"
              : "bg-ink-100 text-ink-700 hover:bg-ink-200"
          }`}
        >
          Editar
        </button>
        <div className="flex-1" />
        {saving ? (
          <span className="text-xs text-ink-500">guardando…</span>
        ) : savedAt ? (
          <span className="text-xs text-accent-jade">
            guardado {savedAt.toLocaleTimeString()}
          </span>
        ) : null}
        {error ? (
          <span className="text-xs text-accent-rust">{error}</span>
        ) : null}
      </div>

      {mode === "view" ? (
        <MarkdownView body={body} citationLookup={citationLookup} />
      ) : (
        <div className="space-y-3">
          <details className="border border-ink-200 rounded">
            <summary className="cursor-pointer bg-ink-100 px-3 py-2 text-sm font-semibold">
              Frontmatter (YAML)
            </summary>
            <textarea
              className="w-full h-40 p-3 font-mono text-sm bg-ink-50 border-t border-ink-200 outline-none resize-y"
              value={frontmatterText}
              onChange={(e) => {
                setFrontmatterText(e.target.value);
                scheduleSave();
              }}
            />
          </details>
          <textarea
            className="w-full min-h-[60vh] p-4 font-mono text-sm bg-white border border-ink-200 rounded outline-none resize-y leading-relaxed"
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              scheduleSave();
            }}
            placeholder="Cuerpo en Markdown. Cite con [^cite-key]."
          />
          <div className="flex gap-2">
            <button
              onClick={save}
              className="text-sm px-3 py-1.5 bg-ink-800 text-ink-50 rounded hover:bg-ink-900"
            >
              Guardar ahora
            </button>
            <span className="text-xs text-ink-500 self-center">
              Auto-guarda 1.2s después del último cambio.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Minimal YAML helpers — we only roundtrip what gray-matter produced.
// For complex YAML the user should edit the .md file directly.
function yamlStringify(obj: Record<string, unknown>): string {
  const lines: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    if (v == null) continue;
    if (Array.isArray(v)) {
      if (v.length === 0) {
        lines.push(`${k}: []`);
      } else if (v.every((x) => typeof x === "string")) {
        lines.push(`${k}: [${v.map((x) => JSON.stringify(x)).join(", ")}]`);
      } else {
        lines.push(`${k}: ${JSON.stringify(v)}`);
      }
    } else if (typeof v === "object") {
      lines.push(`${k}: ${JSON.stringify(v)}`);
    } else {
      lines.push(`${k}: ${String(v)}`);
    }
  }
  return lines.join("\n");
}

function parseFrontmatterText(text: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!m) continue;
    const [, k, v] = m;
    if (v.startsWith("[") || v.startsWith("{")) {
      try {
        out[k] = JSON.parse(v);
        continue;
      } catch {
        // fallthrough
      }
    }
    if (v === "" || v == null) {
      out[k] = null;
    } else if (/^-?\d+(\.\d+)?$/.test(v)) {
      out[k] = Number(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}
