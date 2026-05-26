"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavEntry {
  tipo: string;
  slug: string;
  nombre: string;
  estado: string;
  tags: string[];
}

export interface NavSubgroup {
  key: string;
  label: string;
  items: NavEntry[];
}

export interface NavSection {
  tipo: string;
  label: string;
  count: number;
  subgroups?: NavSubgroup[];
  items?: NavEntry[];
}

export interface ToolLink {
  href: string;
  label: string;
}

function StatusDot({ estado }: { estado: string }) {
  if (estado === "stub") return <span className="text-ink-400 mr-1">○</span>;
  if (estado === "en-progreso")
    return <span className="text-accent-gold mr-1">◐</span>;
  return <span className="text-accent-jade mr-1">●</span>;
}

function Chevron() {
  return (
    <svg
      className="tree-chevron"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 1.5 L6.5 5 L3 8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EntryLink({ entry, active }: { entry: NavEntry; active: boolean }) {
  return (
    <Link
      href={`/${entry.tipo}/${entry.slug}`}
      className={`tree-item block truncate ${active ? "active" : ""}`}
      title={entry.nombre}
    >
      <StatusDot estado={entry.estado} />
      {entry.nombre}
    </Link>
  );
}

export default function SidebarNav({
  toolLinks,
  sections,
}: {
  toolLinks: ToolLink[];
  sections: NavSection[];
}) {
  const pathname = usePathname();

  // A section starts open only if the current route lives inside it.
  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const s of sections) {
      initial[s.tipo] = pathname === `/${s.tipo}` || pathname.startsWith(`/${s.tipo}/`);
    }
    return initial;
  });

  const toggle = (tipo: string) =>
    setOpen((prev) => ({ ...prev, [tipo]: !prev[tipo] }));

  return (
    <>
      <nav className="space-y-0.5 mb-5">
        {toolLinks.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`tree-item block ${active ? "active" : ""}`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-ink-200/70 pt-2 space-y-0.5">
        {sections.map((s) => {
          const isOpen = !!open[s.tipo];
          return (
            <div key={s.tipo}>
              <button
                type="button"
                className="tree-toggle"
                aria-expanded={isOpen}
                onClick={() => toggle(s.tipo)}
              >
                <Chevron />
                <span className="flex-1 text-left">{s.label}</span>
                <span className="font-normal normal-case tracking-normal text-ink-400">
                  {s.count}
                </span>
              </button>

              {isOpen ? (
                <div className="mb-2 ml-1.5 border-l border-ink-200 pl-1.5">
                  {s.subgroups
                    ? s.subgroups.map((g) => (
                        <div key={g.key} className="mt-1.5 first:mt-0.5">
                          <div className="px-1.5 mb-0.5 text-[10px] uppercase tracking-wider text-ink-500">
                            {g.label}
                          </div>
                          {g.items.map((e) => (
                            <EntryLink
                              key={`${e.tipo}-${e.slug}`}
                              entry={e}
                              active={pathname === `/${e.tipo}/${e.slug}`}
                            />
                          ))}
                        </div>
                      ))
                    : (s.items ?? []).map((e) => (
                        <EntryLink
                          key={`${e.tipo}-${e.slug}`}
                          entry={e}
                          active={pathname === `/${e.tipo}/${e.slug}`}
                        />
                      ))}
                  {s.count === 0 ? (
                    <div className="px-1.5 text-xs italic text-ink-400">vacío</div>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );
}
