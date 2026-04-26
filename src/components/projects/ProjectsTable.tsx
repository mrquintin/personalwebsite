"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Project, ProjectKind } from "@/lib/projects/types";
import { sortProjects, type SortKey, type SortDir } from "@/lib/projects/sort";
import { filterByKind, filterByQuery } from "@/lib/projects/filter";
import StatusPill from "./StatusPill";
import { useHotkey } from "@/lib/hotkeys/useHotkey";
import { microcopy } from "@/content/microcopy";

const KIND_OPTIONS: (ProjectKind | "all")[] = ["all", "company", "book", "research", "software", "website", "other"];

function relSuffix(iso: string): string {
  const then = new Date(iso).getTime();
  const days = Math.round((Date.now() - then) / 86_400_000);
  if (days === 0) return "today";
  if (days < 0)  return `${Math.abs(days)}d ahead`;
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.round(days / 30)}mo ago`;
  return `${Math.round(days / 365)}y ago`;
}

// R03: CODE column removed. Title is the primary identifier.
const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "title", label: "title" },
  { key: "kind", label: "kind" },
  { key: "status", label: "status" },
  { key: "started", label: "started" },
  { key: "updated", label: "updated" },
  { key: "stage", label: "stage" },
];

type Props = { projects: Project[] };

export default function ProjectsTable({ projects }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const initialKind = (params?.get("kind") as ProjectKind | "all" | null) ?? "all";
  const initialSort = (params?.get("sort") as SortKey | null) ?? "updated";
  const initialDir  = (params?.get("dir") as SortDir | null) ?? "desc";

  const [kind, setKind] = useState<ProjectKind | "all">(initialKind);
  const [sortKey, setSortKey] = useState<SortKey>(initialSort);
  const [sortDir, setSortDir] = useState<SortDir>(initialDir);
  const [filter, setFilter] = useState("");
  const [filterFocus, setFilterFocus] = useState(false);
  const [sel, setSel] = useState(0);
  const filterRef = useRef<HTMLInputElement>(null);

  const rows = useMemo(() => {
    const f1 = filterByKind(projects, kind);
    const f2 = filterByQuery(f1, filter);
    return sortProjects(f2, sortKey, sortDir);
  }, [projects, kind, filter, sortKey, sortDir]);

  // sync URL
  useEffect(() => {
    const usp = new URLSearchParams();
    if (kind !== "all") usp.set("kind", kind);
    if (sortKey !== "updated") usp.set("sort", sortKey);
    if (sortDir !== "desc") usp.set("dir", sortDir);
    const qs = usp.toString();
    history.replaceState(null, "", `/projects${qs ? `?${qs}` : ""}`);
  }, [kind, sortKey, sortDir]);

  // keyboard
  useHotkey({ key: "ArrowDown", preventDefault: true }, () => setSel((s) => Math.min(rows.length - 1, s + 1)));
  useHotkey({ key: "ArrowUp",   preventDefault: true }, () => setSel((s) => Math.max(0, s - 1)));
  useHotkey({ key: "j" }, () => setSel((s) => Math.min(rows.length - 1, s + 1)));
  useHotkey({ key: "k" }, () => setSel((s) => Math.max(0, s - 1)));
  useHotkey({ key: "Enter" }, () => activate(rows[sel]));
  useHotkey({ key: "Enter", meta: true, preventDefault: true }, () => {
    const p = rows[sel];
    if (!p) return;
    const dest = p.customPage ?? `/projects/${p.slug}`;
    window.open(dest, "_blank", "noopener");
  });
  useHotkey({ key: "/", preventDefault: true }, () => {
    setFilterFocus(true);
    setTimeout(() => filterRef.current?.focus(), 0);
  });
  useHotkey({ key: "Escape", enabled: filterFocus }, () => {
    setFilter(""); setFilterFocus(false);
  });

  function activate(p?: Project) {
    if (!p) return;
    const dest = p.customPage ?? `/projects/${p.slug}`;
    router.push(dest);
  }

  function clickHeader(k: SortKey) {
    if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("desc"); }
  }

  const detail = rows[sel];

  return (
    <div className="projects-table-wrap">
      <div style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)", marginBottom: "var(--s-4)" }}>
        {microcopy.meta.projectsHeaderPrefix} — {projects.length} loaded · sort: {sortKey} {sortDir === "asc" ? "↑" : "↓"}
      </div>
      <div style={{ display: "flex", gap: "var(--s-2)", marginBottom: "var(--s-4)", fontFamily: "var(--font-mono)", flexWrap: "wrap" }}>
        {KIND_OPTIONS.map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className="pill"
            style={{
              cursor: "pointer",
              color: kind === k ? "var(--accent)" : "var(--fg-mute)",
              background: kind === k ? "var(--bg-3)" : "var(--bg-2)",
            }}
          >
            {k}
          </button>
        ))}
        {filterFocus && (
          <input
            ref={filterRef}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            onBlur={() => { if (!filter) setFilterFocus(false); }}
            placeholder={microcopy.placeholders.projectsFilter}
            style={{
              marginLeft: "auto",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--t-xs-size)",
              borderBottom: "1px solid var(--rule)",
              padding: "0 var(--s-2)",
              outline: "none",
            }}
          />
        )}
      </div>
      {rows.length === 0 ? (
        <div style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)" }}>{microcopy.emptyStates.noProjects}</div>
      ) : (
        <table className="projects-table" role="grid" aria-rowcount={rows.length}>
          <thead>
            <tr>
              <th style={{ width: 40 }}>#</th>
              {COLUMNS.map((c) => (
                <th key={c.key} onClick={() => clickHeader(c.key)} aria-sort={sortKey === c.key ? (sortDir === "asc" ? "ascending" : "descending") : "none"}>
                  {c.label} {sortKey === c.key ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </th>
              ))}
              <th>{microcopy.meta.projectsActionsCol}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p, i) => (
              <tr
                key={p.slug}
                data-row
                aria-selected={i === sel}
                onClick={() => activate(p)}
                onMouseEnter={() => setSel(i)}
              >
                <td style={{ color: "var(--fg-mute)" }}>{String(i + 1).padStart(2, "0")}</td>
                <td style={{ color: "var(--fg-hi)", maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.title}
                  {p.visibility === "teaser" && (
                    <span style={{ color: "var(--fg-mute)", marginLeft: "var(--s-3)" }}>
                      {microcopy.emptyStates.teaserTag}
                    </span>
                  )}
                </td>
                <td style={{ color: "var(--fg-mute)", textTransform: "uppercase" }}>{p.kind}</td>
                <td><StatusPill status={p.status} /></td>
                <td style={{ color: "var(--fg-mute)" }}>{p.startedISO}</td>
                <td style={{ color: "var(--fg)" }}>
                  {p.updatedISO} <span style={{ color: "var(--fg-dim)" }}>· {relSuffix(p.updatedISO)}</span>
                </td>
                <td style={{ color: "var(--fg)" }}>{p.stage ?? ""}</td>
                <td style={{ color: "var(--fg-mute)" }}>{microcopy.buttons.rowOpen} · {microcopy.buttons.rowOpenTab}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {detail && (
        <aside className="projects-detail" aria-label={microcopy.meta.rowSelectedPreviewLabel}>
          <div style={{ color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: "var(--t-xs-size)" }}>
            {detail.title}
          </div>
          <div style={{ color: "var(--fg-mute)", fontFamily: "var(--font-mono)", fontSize: "var(--t-xxs-size)", marginTop: "var(--s-1)" }}>
            updated {detail.updatedISO}
          </div>
          <p style={{ color: "var(--fg)", fontFamily: "var(--font-sans)", fontSize: "var(--t-xs-size)", marginTop: "var(--s-3)", lineHeight: 1.5 }}>
            {detail.summary}
          </p>
          {detail.links.slice(0, 3).length > 0 && (
            <ul style={{ marginTop: "var(--s-3)", fontFamily: "var(--font-mono)", fontSize: "var(--t-xxs-size)" }}>
              {detail.links.slice(0, 3).map((l, i) => (
                <li key={i} style={{ color: "var(--fg-dim)", padding: "2px 0" }}>
                  · <a href={l.href} target={l.external ? "_blank" : undefined} rel="noopener" style={{ color: "var(--fg)" }}>{l.label}</a>
                </li>
              ))}
            </ul>
          )}
        </aside>
      )}
    </div>
  );
}
