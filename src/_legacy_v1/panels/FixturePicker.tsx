"use client";
// Dev-only fixture picker. Toggled with Shift+Cmd+E (or Shift+Ctrl+E).
// Bound to the active experience via a thin context: the experience
// declares its fixtures and a setter; this overlay lists them.
import { useEffect, useState, createContext, useContext, useCallback, type ReactNode } from "react";

type FixtureItem = { id: string; label: string };

type Ctx = {
  fixtures: FixtureItem[];
  current: string | null;
  set: (id: string) => void;
  dump: () => unknown;
} | null;

const FixtureCtx = createContext<Ctx>(null);

export function FixtureProvider({
  fixtures, current, set, dump, children,
}: {
  fixtures: FixtureItem[];
  current: string | null;
  set: (id: string) => void;
  dump: () => unknown;
  children: ReactNode;
}) {
  return (
    <FixtureCtx.Provider value={{ fixtures, current, set, dump }}>
      {children}
    </FixtureCtx.Provider>
  );
}

export default function FixturePicker() {
  const ctx = useContext(FixtureCtx);
  const [open, setOpen] = useState(false);
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    if (!isDev) return;
    function onKey(e: KeyboardEvent) {
      // Shift + (Cmd or Ctrl) + E
      if (e.shiftKey && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "e") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDev, open]);

  const dumpToConsole = useCallback(() => {
    if (!ctx) return;
    // eslint-disable-next-line no-console
    console.log("[fixture] state:", ctx.dump());
  }, [ctx]);

  if (!isDev || !open) return null;
  if (!ctx) {
    return (
      <div className="fixture-picker" onClick={() => setOpen(false)} role="dialog" aria-label="fixture picker">
        <div className="panel" onClick={(e) => e.stopPropagation()}>
          <header><span>fixture picker</span><span>esc</span></header>
          <div className="exp-loading">no active experience advertises fixtures</div>
        </div>
      </div>
    );
  }
  return (
    <div className="fixture-picker" onClick={() => setOpen(false)} role="dialog" aria-label="fixture picker">
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <header>
          <span>fixture picker · {ctx.fixtures.length}</span>
          <span>esc</span>
        </header>
        <ul role="listbox">
          {ctx.fixtures.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                aria-selected={ctx.current === f.id}
                onClick={() => { ctx.set(f.id); setOpen(false); }}
              >
                {ctx.current === f.id ? "▸ " : "  "}{f.id} · {f.label}
              </button>
            </li>
          ))}
        </ul>
        <footer>
          <button type="button" onClick={dumpToConsole}>dump state to console</button>
        </footer>
      </div>
    </div>
  );
}
