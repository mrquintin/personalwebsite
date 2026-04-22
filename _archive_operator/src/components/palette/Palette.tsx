"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { AnimatePresence, motion } from "framer-motion";
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
  const [pendingId, setPendingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const registry = useMemo(() => buildRegistry(buildVersion), [buildVersion]);

  const history = useMemo<string[]>(() => {
    if (typeof window === "undefined") return [];
    void open;
    try { return JSON.parse(sessionStorage.getItem(HISTORY_KEY) ?? "[]"); }
    catch { return []; }
  }, [open]);

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

  useHotkey({ key: "k", meta: true, preventDefault: true, enabled: !suppressed }, () => {
    setOpen((o) => !o);
  });
  useHotkey({ key: "ArrowDown", enabled: open, preventDefault: true }, () => {
    setSel((s) => Math.min(items.length - 1, s + 1));
  });
  useHotkey({ key: "ArrowUp", enabled: open, preventDefault: true }, () => {
    setSel((s) => Math.max(0, s - 1));
  });
  useHotkey({ key: "Enter", enabled: open, preventDefault: true }, () => {
    activate(items[sel]?.item);
  });
  useHotkey({ key: "F1", preventDefault: true, enabled: !suppressed }, () => {
    window.dispatchEvent(new CustomEvent("operator:open-help"));
  });

  // Konami code easter egg → open palette + custom command
  useEffect(() => {
    const SEQ = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
    let i = 0;
    function on(e: KeyboardEvent) {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (k === SEQ[i]) {
        i++;
        if (i === SEQ.length) {
          i = 0;
          setOpen(true);
          setToast("you have good taste. welcome.");
        }
      } else {
        i = k === SEQ[0] ? 1 : 0;
      }
    }
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, []);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setSel(0);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const close = useCallback(() => setOpen(false), []);

  const activate = useCallback((cmd?: Command) => {
    if (!cmd || pendingId) return;
    // sudo theatre
    if (q.startsWith("sudo ")) {
      setToast("operator.michael.quintin ALL=(ALL) ALL — permission granted");
    }
    try {
      const cur: string[] = JSON.parse(sessionStorage.getItem(HISTORY_KEY) ?? "[]");
      const next = [cmd.id, ...cur.filter((x) => x !== cmd.id)].slice(0, HISTORY_MAX);
      sessionStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch {}
    setPendingId(cmd.id);
    Promise.resolve(cmd.run({
      router: { push: (href: string) => router.push(href) },
      toast: setToast,
      close,
    })).finally(() => setPendingId(null));
  }, [router, close, pendingId, q]);

  return (
    <>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <AnimatePresence>
          {open && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <motion.div
                  className="palette-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.16 }}
                />
              </Dialog.Overlay>
              <Dialog.Content asChild aria-label="Command palette">
                <motion.div
                  className="palette"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                >
                  <VisuallyHidden asChild><Dialog.Title>Command palette</Dialog.Title></VisuallyHidden>
                  <VisuallyHidden asChild><Dialog.Description>Type a command or fuzzy-search the site.</Dialog.Description></VisuallyHidden>
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
                        pending={pendingId === r.item.id}
                        disabled={pendingId !== null && pendingId !== r.item.id}
                        id={`palette-row-${i}`}
                        onActivate={() => activate(r.item)}
                        onMouseEnter={() => setSel(i)}
                      />
                    ))}
                  </div>
                  <div className="palette-divider" />
                  <div className="palette-footer">{COPY.paletteFooter}</div>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
