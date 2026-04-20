"use client";
import { useEffect, useRef, useState } from "react";

const LINES: { ok: boolean; body: string }[] = [
  { ok: true,  body: "boot: operator.console v0.3.1" },
  { ok: true,  body: "kernel: mqos-26.0.4" },
  { ok: true,  body: "identity: michael.quintin" },
  { ok: true,  body: "role: operator · writer · founder" },
  { ok: true,  body: "channels: 5 panels loaded (ABT, HVM, PRP, THS, CV)" },
  { ok: true,  body: "command palette: ⌘K" },
  { ok: true,  body: "session: READY" },
];
const STORAGE_KEY = "operator.boot.shown";

type Props = { onComplete: () => void };

export default function BootSequence({ onComplete }: Props) {
  const [visible, setVisible] = useState(true);
  const [step, setStep] = useState(0);
  const [fading, setFading] = useState(false);
  const completedRef = useRef(false);

  // skip if already shown OR reduced motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    let alreadyShown = false;
    try { alreadyShown = sessionStorage.getItem(STORAGE_KEY) === "true"; } catch {}
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (alreadyShown || reduced) {
      setVisible(false);
      onComplete();
    }
    try { sessionStorage.setItem(STORAGE_KEY, "true"); } catch {}
  }, [onComplete]);

  useEffect(() => {
    if (!visible) return;
    if (step < LINES.length) {
      const t = setTimeout(() => setStep((s) => s + 1), 150);
      return () => clearTimeout(t);
    }
    // settle on cursor for ~400ms then fade
    const t1 = setTimeout(() => setFading(true), 400);
    const t2 = setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      setVisible(false);
      onComplete();
    }, 400 + 420);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [step, visible, onComplete]);

  // skippable: any key/click
  useEffect(() => {
    if (!visible) return;
    function dismiss() {
      if (completedRef.current) return;
      completedRef.current = true;
      setVisible(false);
      onComplete();
    }
    function key(e: KeyboardEvent) { if (e.key === "Escape" || true) dismiss(); }
    window.addEventListener("keydown", key);
    window.addEventListener("mousedown", dismiss);
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("mousedown", dismiss);
    };
  }, [visible, onComplete]);

  if (!visible) return null;
  return (
    <div
      aria-hidden="true"
      className="boot-overlay"
      style={{
        position: "fixed", inset: 0,
        background: "var(--bg-0)",
        color: "var(--fg)",
        zIndex: "var(--z-boot)" as unknown as number,
        fontFamily: "var(--font-mono)",
        opacity: fading ? 0 : 1,
        transition: "opacity var(--d-slow) var(--ease)",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div style={{ maxWidth: 720, width: "100%", padding: "var(--s-7)" }}>
        {LINES.slice(0, step).map((l, i) => (
          <div key={i} style={{
            opacity: 1,
            transform: "translateY(0)",
            transition: "all var(--d-fast) var(--ease)",
            fontSize: "var(--t-sm-size)",
            lineHeight: "var(--t-base-lh)",
          }}>
            <span style={{ color: l.ok ? "var(--ok)" : "var(--danger)" }}>
              [ {l.ok ? "OK" : "!!"} ]
            </span>
            <span style={{ marginLeft: 12 }}>{l.body}</span>
          </div>
        ))}
        {step >= LINES.length && (
          <div style={{ marginTop: "var(--s-3)" }}>
            ~$ <span className="cursor-blink">_</span>
          </div>
        )}
      </div>
      <div style={{
        position: "fixed", right: 16, bottom: 16,
        color: "var(--fg-mute)", fontSize: "var(--t-xxs-size)",
      }}>
        Skip [esc]
      </div>
    </div>
  );
}
