"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ExperienceContext } from "@/lib/experience-config";
import { GLOSSARY } from "@/lib/prp/glossary";
import { usePrp } from "@/stores/prpExperience";
import GlossaryFullView from "./GlossaryFullView";

// P05 §B3 + P01 §A0: portaled into the chassis-owned outlet so it
// persists across all five modes.
export default function GlossaryStrip({
  ctx, regime,
}: { ctx: ExperienceContext; regime: "narrow" | "standard" | "wide" }) {
  const open = usePrp((s) => s.atlas.glossaryOpen);
  const fullOpen = usePrp((s) => s.atlas.glossaryFullOpen);
  const search = usePrp((s) => s.atlas.glossarySearch);
  const toggle = usePrp((s) => s.toggleGlossary);
  const openFull = usePrp((s) => s.openFullGlossary);
  const closeFull = usePrp((s) => s.closeFullGlossary);
  const setSelectedClaimId = usePrp((s) => s.setSelectedClaimId);
  const setMode = usePrp((s) => s.setMode);

  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => { setTarget(document.getElementById("prp-glossary-outlet")); }, []);

  const [popoverFor, setPopoverFor] = useState<string | null>(null);

  if (!target) return null;
  const visible = GLOSSARY.slice(0, regime === "narrow" ? 4 : 8);
  const more = GLOSSARY.length - visible.length;

  const stripContent = (
    <>
      <div style={{
        height: open ? 36 : 28,
        borderTop: "var(--border-hair)", background: "var(--bg-1)",
        display: "flex", alignItems: "center", padding: "0 var(--s-3)",
        overflow: "hidden", whiteSpace: "nowrap",
        fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-mute)",
      }}>
        <button type="button" onClick={toggle}
          style={{ color: "var(--fg)", background: "transparent", cursor: "pointer", padding: 0 }}>
          GLOSSARY
        </button>
        {open && (
          <div style={{ marginLeft: "var(--s-3)", display: "flex", gap: "var(--s-3)", alignItems: "center", overflow: "hidden" }}>
            {visible.map((t) => (
              <button key={t.term} type="button"
                onClick={() => setPopoverFor(popoverFor === t.term ? null : t.term)}
                style={{ color: "var(--fg-dim)", background: "transparent", cursor: "pointer", padding: 0,
                         textOverflow: "ellipsis", overflow: "hidden" }}>
                {t.term}
              </button>
            ))}
            {more > 0 && (
              <button type="button" onClick={() => openFull("")}
                style={{ color: "var(--accent)", background: "transparent", cursor: "pointer", padding: 0 }}>
                +{more}
              </button>
            )}
          </div>
        )}
        <button type="button" onClick={() => openFull("")} style={{
          marginLeft: "auto", color: "var(--fg-mute)", background: "transparent", cursor: "pointer", padding: 0,
        }}>open full</button>
      </div>
      {popoverFor && (() => {
        const term = GLOSSARY.find((g) => g.term === popoverFor);
        if (!term) return null;
        return (
          <div role="dialog" aria-label={`definition: ${term.term}`}
            style={{
              position: "absolute", bottom: 36, left: "var(--s-3)",
              maxWidth: 360, padding: "var(--s-3)",
              border: "var(--border-hair)", background: "var(--bg-1)",
              fontFamily: "var(--font-mono)", fontSize: "12px", zIndex: 60,
            }}>
            <div style={{ color: "var(--accent)", marginBottom: 4 }}>{term.term}</div>
            <div style={{ color: "var(--fg)" }}>{term.definition}</div>
            <div style={{ marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap" }}>
              {term.connectedClaimIds.map((id) => (
                <button key={id} type="button"
                  onClick={() => { setSelectedClaimId(id); setMode("ontology"); setPopoverFor(null); ctx.announce(`Jumping to ${id}`); }}
                  style={{ color: "var(--accent)", background: "transparent", cursor: "pointer", padding: 0, fontSize: "11px" }}>
                  → {id}
                </button>
              ))}
              <button type="button" onClick={() => setPopoverFor(null)}
                style={{ marginLeft: "auto", color: "var(--fg-mute)", background: "transparent", cursor: "pointer", padding: 0 }}>
                close
              </button>
            </div>
          </div>
        );
      })()}
      {fullOpen && (
        <GlossaryFullView search={search}
          onSelectClaim={(id) => { setSelectedClaimId(id); setMode("ontology"); closeFull(); }}
          onClose={closeFull} />
      )}
    </>
  );
  return createPortal(stripContent, target);
}
