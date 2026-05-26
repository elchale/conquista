"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { useMemo } from "react";

interface Props {
  body: string;
  /** Map cite-key → resolved tooltip text, prepared on the server. */
  citationLookup?: Record<string, string>;
}

// Match [^cite-key] but NOT escaped \[^...]
const CITE_RE = /(?<!\\)\[\^([a-z0-9-]+)\]/gi;

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default function MarkdownView({ body, citationLookup = {} }: Props) {
  const processed = useMemo(() => {
    return body.replace(CITE_RE, (_m, key) => {
      const tooltip = citationLookup[key] ?? "fuente no resuelta";
      return `<sup class="citation-marker" data-cite="${escapeAttr(
        key
      )}" title="${escapeAttr(tooltip)}">[${escapeAttr(key)}]</sup>`;
    });
  }, [body, citationLookup]);

  return (
    <div className="prose-archivo">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}
