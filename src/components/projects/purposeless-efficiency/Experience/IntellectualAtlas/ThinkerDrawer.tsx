"use client";
import { useEffect } from "react";
import type { Thinker } from "@/lib/prp/thinkers";

const STANCE_LABEL: Record<Thinker["stance"], string> = {
  ENDORSED: "ENDORSED",
  ENGAGED: "PRODUCTIVELY ENGAGED",
  REBUKED: "REBUKED",
  DEFENDED: "DEFENDED",
};
const STANCE_COLOR: Record<Thinker["stance"], string> = {
  ENDORSED: "var(--ok)",
  ENGAGED: "var(--accent)",
  REBUKED: "var(--danger)",
  DEFENDED: "var(--accent-dim)",
};

type Props = {
  thinker: Thinker;
  onClose: () => void;
  openInOntology: (claimId: string) => void;
};

export default function ThinkerDrawer({ thinker, onClose, openInOntology }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <aside role="dialog" aria-label={`Thinker: ${thinker.name}`}
      style={{
        position: "absolute", top: 0, right: 0, height: "100%",
        width: "min(420px, 92%)", background: "var(--bg-1)",
        borderLeft: "var(--border-hair)", overflow: "auto", padding: "var(--s-4)",
      }}>
      <header>
        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "24px", margin: 0 }}>{thinker.name}</h3>
        <div style={{ marginTop: 4, fontFamily: "var(--font-mono)", fontSize: "11px",
                       color: STANCE_COLOR[thinker.stance], letterSpacing: "0.12em" }}>
          {STANCE_LABEL[thinker.stance]}
        </div>
        <div style={{ marginTop: 4, fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-dim)" }}>
          {thinker.lifespan} · {thinker.positioning}
        </div>
      </header>

      <Section title="THE BOOK ENGAGES">
        <div className="prp-prose" style={{ fontSize: "14px" }}><p>{thinker.engagement}</p></div>
      </Section>

      <Section title="THE BOOK'S STANCE">
        <div className="prp-prose" style={{ fontSize: "14px" }}><p>{thinker.stanceText}</p></div>
      </Section>

      <Section title="CONNECTED CLAIMS">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {thinker.connectedClaimIds.map((id) => (
            <button key={id} type="button" onClick={() => openInOntology(id)}
              style={{
                fontFamily: "var(--font-mono)", fontSize: "10px",
                color: "var(--accent)", padding: "3px 6px",
                border: "var(--border-hair)", background: "transparent", cursor: "pointer",
              }}>{id}</button>
          ))}
        </div>
      </Section>

      {thinker.counterRecommendation && (
        <Section title="COUNTER-RECOMMENDATION">
          <div className="prp-prose" style={{ fontSize: "13px" }}><p>{thinker.counterRecommendation}</p></div>
        </Section>
      )}

      <Section title="WHERE ENCOUNTERED">
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--fg-dim)" }}>
          {thinker.whereEncountered.join(", ")}
        </div>
      </Section>

      <footer style={{ marginTop: "var(--s-4)" }}>
        <button type="button" onClick={onClose} style={{
          fontFamily: "var(--font-mono)", fontSize: "11px", padding: "4px 10px",
          border: "var(--border-hair)", background: "transparent", color: "var(--fg)",
          cursor: "pointer", letterSpacing: "0.06em", textTransform: "uppercase",
        }}>close (esc)</button>
      </footer>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: "var(--s-4)" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)",
                     letterSpacing: "0.12em", marginBottom: 4 }}>{title}</div>
      {children}
    </section>
  );
}
