"use client";
import { useEffect, useRef } from "react";
import type { Claim } from "@/lib/prp/claims";
import { CLAIMS, dependsOn, entails } from "@/lib/prp/claims";
import { DIAMOND_CASES } from "@/lib/prp/diamondCases";
import { THINKERS } from "@/lib/prp/thinkers";
import DependencyTrail from "./DependencyTrail";

const KIND_LABEL: Record<Claim["kind"], string> = {
  foundational: "FOUNDATIONAL",
  applied: "APPLIED",
  methodological: "METHODOLOGICAL",
};

type Props = {
  claim: Claim;
  onSelect: (id: string) => void;
  onClose: () => void;
  onSwitchMode: (mode: "diamond" | "atlas", refId: string) => void;
};

export default function ClaimCard({ claim, onSelect, onClose, onSwitchMode }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    ref.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const parents = dependsOn(claim.id);
  const children = entails(claim.id);

  // P03 / P05 cross-refs
  const diamondCase = DIAMOND_CASES.find((d) => d.tagClaimIds.includes(claim.id));
  const thinker = THINKERS.find((t) => t.connectedClaimIds.includes(claim.id));

  const stub = !claim.authorApproved;

  return (
    <aside
      ref={ref} tabIndex={-1}
      role="dialog" aria-modal="false" aria-label={`Claim: ${claim.name}`}
      style={{
        position: "absolute", top: 0, right: 0, height: "100%",
        width: "min(420px, 90%)", background: "var(--bg-1)",
        borderLeft: "var(--border-hair)", overflow: "auto",
        padding: "var(--s-4)", outline: "none",
      }}
    >
      <DependencyTrail claimId={claim.id} onJump={onSelect} />
      <header style={{ marginTop: "var(--s-2)" }}>
        <div style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)", fontSize: "11px" }}>
          {claim.id}
        </div>
        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "22px", lineHeight: 1.15,
                     color: "var(--fg)", margin: "4px 0 8px" }}>
          {claim.name}
        </h3>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.1em",
          padding: "2px 6px", border: "var(--border-hair)", color: "var(--fg-mute)",
        }}>{KIND_LABEL[claim.kind]}</span>
      </header>

      {stub ? (
        <div style={{ marginTop: "var(--s-4)", color: "var(--fg-mute)",
                      fontFamily: "var(--font-mono)", fontSize: "13px" }}>
          claim pending author review
        </div>
      ) : (
        <>
          <Section title="STATEMENT">
            <div className="prp-prose" style={{ fontSize: "15px" }}>{claim.statement}</div>
          </Section>
          <Section title="DEPENDS ON">
            <RefList ids={parents} onJump={onSelect} />
          </Section>
          <Section title="ENTAILS">
            <RefList ids={children} onJump={onSelect} />
          </Section>
          {claim.objectionRefs.length > 0 && (
            <Section title="OBJECTION CROSS-REFS">
              <ul style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--fg-dim)" }}>
                {claim.objectionRefs.map((o) => (<li key={o}>· objection {o}</li>))}
              </ul>
            </Section>
          )}
          <Section title="WHERE DEVELOPED">
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--fg-dim)" }}>
              {claim.chapterRefs.length === 0 ? "—" : claim.chapterRefs.map((n) => `Ch.${n}`).join(", ")}
            </div>
          </Section>
        </>
      )}

      <footer style={{ marginTop: "var(--s-5)", display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {diamondCase && (
          <button type="button" onClick={() => onSwitchMode("diamond", diamondCase.id)}
                  style={btn}>open in Diamond Method</button>
        )}
        {thinker && (
          <button type="button" onClick={() => onSwitchMode("atlas", thinker.id)}
                  style={btn}>show in Atlas</button>
        )}
        <button type="button" onClick={onClose} style={btn} aria-label="close claim card">close (esc)</button>
      </footer>
    </aside>
  );
}

const btn: React.CSSProperties = {
  fontFamily: "var(--font-mono)", fontSize: "11px",
  padding: "4px 8px", border: "var(--border-hair)",
  background: "transparent", color: "var(--fg)", cursor: "pointer",
  letterSpacing: "0.06em", textTransform: "uppercase",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: "var(--s-4)" }}>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)",
        letterSpacing: "0.12em", marginBottom: "4px",
      }}>{title}</div>
      {children}
    </section>
  );
}

function RefList({ ids, onJump }: { ids: string[]; onJump: (id: string) => void }) {
  if (ids.length === 0) return <div style={{ color: "var(--fg-mute)" }}>—</div>;
  const claimMap = new Map(CLAIMS.map((c) => [c.id, c]));
  return (
    <ul style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>
      {ids.map((id) => {
        const c = claimMap.get(id);
        return (
          <li key={id} style={{ padding: "2px 0" }}>
            ·{" "}
            <button type="button" onClick={() => onJump(id)}
              style={{ background: "transparent", color: "var(--accent)", cursor: "pointer", padding: 0 }}>
              {id}
            </button>{" "}
            <span style={{ color: "var(--fg-dim)" }}>— {c?.name ?? "(unknown)"}</span>
          </li>
        );
      })}
    </ul>
  );
}
