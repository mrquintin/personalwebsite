"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Command } from "@/lib/commands/types";
import { buildRegistry } from "@/lib/commands/registry";
import { fuzzyRank } from "./useFuzzy";
import ResultRow from "./ResultRow";
import { useHotkey } from "@/lib/hotkeys/useHotkey";
import { COPY } from "@/content/microcopy";

const HISTORY_KEY = "operator.palette.history";
const HISTORY_MAX = 5;

type Props = { buildVersion: string; suppressed?: boolean };

export default function Palette({ buildVersion, suppressed }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const registry = useMemo(() => buildRegistry(buildVersion), [buildVersion]);

  const history = useMemo<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(sessionStorage.getItem(HISTORY_KEY) ?? "[]"); } catch { return []; }
  }, [open]);

  // Scope filter: queries starting with /nav, /act, /qry, /prj, />xxx
  const { scope, queryText } = useMemo(() => {
    const m = q.match(/^\/(nav|act|qry|prj|>)([^\s]*)\s?(.*)$/);
    if (!m) return { scope: "all" as const, queryText: q };
    if (m[1] === ">") return { scope: "code" as const, queryText: (m[2] + " " + m[3]).trim() };
    const map = { nav: "nav", act: "action", qry: "query", prj: "projects" } as const;
    return { scope: map[m[1] as keyof typeof map] as string, queryText: m[3] };
  }, [q]);

  const ranked = useMemo(() => {
    let pool = registry;
    if (scope === "nav")     pool = pool.filter((c) => c.kind === "nav");
    if (scope === "action")  pool = pool.filter((c) => c.kind === "action");
    if (scope === "query")   pool = pool.filter((c) => c.kind === "query");
    if (scope === "projects")pool = pool.filter((c) => c.section === "Projects");
    return fuzzyRank(pool, queryText).slice(0, 10);
  }, [registry, scope, queryText]);

  const items = useMemo(() => {
    if (q === "" && history.length) {
      const histItems = history
        .map((id) => registry.find((c) => c.id === id))
        .filter((c): c is Command => Boolean(c))
        .map((item) => ({ item, match: { score: 0, indices: [] as number[] } }));
      return histItems.length ? histItems : ranked;
    }
    return ranked;
  }, [q, history, registry, ranked]);

  // Open / close hotkeys
  useHotkey({ key: "k", meta: true, preventDefault: true, enabled: !suppressed }, () => {
    setOpen((o) => !o);
  });
  useHotkey({ key: "Escape", enabled: open }, () => setOpen(false));
  useHotkey({ key: "ArrowDown", enabled: open, preventDefault: true }, () => {
    setSel((s) => Math.min(items.length - 1, s + 1));
  });
  useHotkey({ key: "ArrowUp", enabled: open, preventDefault: true }, () => {
    setSel((s) => Math.max(0, s - 1));
  });
  useHotkey({ key: "Enter", enabled: open, preventDefault: true }, () => {
    activate(items[sel]?.item);
  });

  // F1 → help (handled by HelpModal; we just dispatch)
  useHotkey({ key: "F1", preventDefault: true, enabled: !suppressed }, () => {
    window.dispatchEvent(new CustomEvent("operator:open-help"));
  });

  // Reset on open
  useEffect(() => {
    if (!open) return;
    setQ("");
    setSel(0);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const close = useCallback(() => setOpen(false), []);

  const activate = useCallback((cmd?: Command) => {
    if (!cmd) return;
    // Push to history
    try {
      const cur: string[] = JSON.parse(sessionStorage.getItem(HISTORY_KEY) ?? "[]");
      const next = [cmd.id, ...cur.filter((x) => x !== cmd.id)].slice(0, HISTORY_MAX);
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {}
    Promise.resolve(cmd.run({ router: { push: router.push }, toast: setToast, close }));
  }, [router, close]);

  if (!open) return (
    <>
      {toast && <div className="toast">{toast}</div>}
    </>
  );

  return (
    <>
      <div className="palette-backdrop" onMouseDown={close} aria-hidden="true" />
      <div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className="palette-input-row">
          <span className="palette-chevron">›</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setSel(0); }}
            placeholder={COPY.paletteOpen}
            spellCheck={false}
            autoComplete="off"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-results"
            aria-activedescendant={items[sel] ? `palette-row-${sel}` : undefined}
          />
          <kbd className="palette-kbd">ESC</kbd>
        </div>
        <div className="palette-divider" />
        <div
          className="palette-results"
          id="palette-results"
          role="listbox"
          aria-live="polite"
          aria-label={`${items.length} results`}
        >
          {items.length === 0 && (
            <div className="palette-empty">no commands matched. / to filter.</div>
          )}
          {items.map((r, i) => (
            <ResultRow
              key={r.item.id}
              cmd={r.item}
              indices={r.match.indices}
              selected={i === sel}
              id={`palette-row-${i}`}
              onActivate={() => activate(r.item)}
              onMouseEnter={() => setSel(i)}
            />
          ))}
        </div>
        <div className="palette-divider" />
        <div className="palette-footer">{COPY.paletteFooter}</div>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
