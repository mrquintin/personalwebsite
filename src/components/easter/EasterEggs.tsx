"use client";
// Mounts site-wide easter eggs.
//   - "clear" + Enter at home: flashes status bar with "screen cleared."
//   - ⌘+Shift+T: hold to reveal an ASCII page-outline overlay
//   - late-night (00:00–06:00): one-shot flash on first visit per session
import { useEffect, useState } from "react";

export default function EasterEggs() {
  const [outline, setOutline] = useState<string[] | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [buffer, setBuffer] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    function onKeyDown(e: KeyboardEvent) {
      // ⌘+Shift+T → outline overlay
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        const headings = Array.from(document.querySelectorAll("h1, h2, h3"))
          .map((el) => `${el.tagName}  ${(el.textContent ?? "").trim()}`);
        setOutline(headings);
        return;
      }
      // typed-buffer for "clear"
      if (window.location.pathname === "/") {
        if (e.key === "/") setBuffer("");
        else if (/^[a-zA-Z]$/.test(e.key)) setBuffer((b) => (b + e.key).slice(-8));
        else if (e.key === "Enter" && buffer.toLowerCase().endsWith("clear")) {
          setFlash("screen cleared.");
          setBuffer("");
          history.replaceState(null, "", "/");
          window.dispatchEvent(new CustomEvent("operator:accordion-neutral"));
        }
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      if (e.key === "Meta" || e.key === "Control" || e.key === "Shift" || e.key.toLowerCase() === "t") {
        setOutline(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [buffer]);

  // late-night
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (sessionStorage.getItem("operator.late-night-shown") === "true") return;
      const h = new Date().getHours();
      if (h >= 0 && h < 6) {
        setFlash("STATUS: late — respect your sleep.");
        sessionStorage.setItem("operator.late-night-shown", "true");
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 1200);
    return () => clearTimeout(t);
  }, [flash]);

  return (
    <>
      {outline && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed", inset: 0, zIndex: 110,
            background: "rgba(0,0,0,0.85)",
            color: "var(--fg)", fontFamily: "var(--font-mono)",
            padding: "var(--s-7)", overflow: "auto",
          }}
        >
          <div style={{ color: "var(--accent)", marginBottom: "var(--s-4)" }}>
            ── PAGE OUTLINE ── (release ⌘+Shift+T)
          </div>
          <pre style={{ whiteSpace: "pre" }}>
            {outline.map((h, i) => `${String(i + 1).padStart(2, "0")}  ${h}\n`).join("")}
          </pre>
        </div>
      )}
      {flash && <div className="toast" style={{ background: "var(--accent)", color: "var(--bg-0)" }}>{flash}</div>}
    </>
  );
}
