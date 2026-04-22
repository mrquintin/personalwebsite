"use client";
import { useEffect, useState } from "react";
import { GLOSSARY } from "@/lib/prp/glossary";

type Props = {
  search: string;
  onSelectClaim: (id: string) => void;
  onClose: () => void;
};

export default function GlossaryFullView({ search: initial, onSelectClaim, onClose }: Props) {
  const [q, setQ] = useState(initial ?? "");
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const filtered = q
    ? GLOSSARY.filter((t) => t.term.toLowerCase().includes(q.toLowerCase()) || t.definition.toLowerCase().includes(q.toLowerCase()))
    : GLOSSARY;

  return (
    <div role="dialog" aria-label="glossary"
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 100,
                 display: "grid", placeItems: "center", padding: "var(--s-4)" }}>
      <div style={{
        background: "var(--bg-1)", border: "var(--border-hair)",
        width: "min(720px, 100%)", maxHeight: "80vh", overflow: "auto",
      }}>
        <header style={{
          padding: "var(--s-3) var(--s-4)", borderBottom: "var(--border-hair)",
          display: "flex", gap: "var(--s-3)", alignItems: "center",
        }}>
          <span style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)", fontSize: "11px" }}>
            GLOSSARY · {filtered.length}/{GLOSSARY.length}
          </span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="search…"
            style={{
              flex: 1, padding: "4px 8px", background: "var(--bg-0)",
              color: "var(--fg)", border: "var(--border-hair)",
              fontFamily: "var(--font-mono)", fontSize: "12px",
            }} />
          <button type="button" onClick={onClose}
            style={{ background: "transparent", color: "var(--fg-mute)", cursor: "pointer", padding: 0 }}>
            close (esc)
          </button>
        </header>
        <div style={{
          padding: "var(--s-3) var(--s-4)",
          display: "grid", gap: "var(--s-3)",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        }}>
          {filtered.map((t) => (
            <article key={t.term}>
              <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "16px", margin: 0, color: "var(--accent)" }}>{t.term}</h4>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--fg)", margin: "4px 0", lineHeight: 1.5 }}>
                {t.definition}
              </p>
              {t.connectedClaimIds.length > 0 && (
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {t.connectedClaimIds.map((id) => (
                    <button key={id} type="button" onClick={() => onSelectClaim(id)}
                      style={{
                        fontFamily: "var(--font-mono)", fontSize: "10px",
                        color: "var(--accent)", border: "var(--border-hair)",
                        padding: "2px 4px", background: "transparent", cursor: "pointer",
                      }}>→ {id}</button>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
