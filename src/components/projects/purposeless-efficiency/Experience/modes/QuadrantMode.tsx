"use client";
import { useState } from "react";
import type { ExperienceContext } from "@/lib/experience-config";
import { QUADRANT_CASES, type Quadrant, type QuadrantCase } from "@/lib/prp/quadrantCases";
import { usePrp, agreementOf } from "@/stores/prpExperience";
import { CLAIMS } from "@/lib/prp/claims";

const Q_LABELS: Record<Quadrant, string> = {
  Q1: "STRUGGLING", Q2: "DOGGEDLY SOUND", Q3: "PURPOSELESS EFFICIENCY", Q4: "COHERENT OPERATION",
};
const Q_TINT: Record<Quadrant, string> = {
  Q1: "var(--bg-2)", Q2: "rgba(123,168,201,0.07)", Q3: "rgba(204,107,107,0.10)", Q4: "rgba(125,180,140,0.10)",
};

export default function QuadrantMode({ ctx }: { ctx: ExperienceContext; regime: string }) {
  const placements = usePrp((s) => s.quadrant.placements);
  const revealed = usePrp((s) => s.quadrant.revealed);
  const interviewMode = usePrp((s) => s.quadrant.interviewMode);
  const placeCase = usePrp((s) => s.placeCase);
  const revealCase = usePrp((s) => s.revealCase);
  const toggleInterview = usePrp((s) => s.toggleInterview);
  const setSelectedClaimId = usePrp((s) => s.setSelectedClaimId);
  const setMode = usePrp((s) => s.setMode);

  const [picked, setPicked] = useState<string | null>(null);
  const [openCompareId, setOpenCompareId] = useState<string | null>(null);

  function place(caseId: string, q: Quadrant) {
    placeCase(caseId, { quadrant: q });
    revealCase(caseId);
    setOpenCompareId(caseId);
    setPicked(null);
    const c = QUADRANT_CASES.find((x) => x.id === caseId);
    if (c) {
      const a = agreementOf({ quadrant: q }, c.bookPlacement);
      const msg = a === "SAME" ? "You and the book agree." : a === "ADJACENT" ? "You placed one quadrant over." : "Substantial disagreement. See below.";
      ctx.announce(`Placed ${c.label} in ${q}. The book's placement is ${c.bookPlacement.quadrant}. ${msg}`);
    }
  }

  return (
    <div style={{ padding: "var(--s-4)" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--s-4)" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--fg-mute)" }}>
          Drop an institution into the Purpose-Efficiency Framework. You decide first; the book replies.
        </div>
        <button type="button" onClick={toggleInterview}
          style={{
            fontFamily: "var(--font-mono)", fontSize: "11px",
            border: "var(--border-hair)", padding: "4px 10px",
            color: interviewMode ? "var(--accent)" : "var(--fg-mute)",
            cursor: "pointer", background: interviewMode ? "var(--bg-3)" : "transparent",
          }}>
          interview mode: {interviewMode ? "on" : "off"}
        </button>
      </header>

      {/* Board */}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gridTemplateRows: "auto 1fr auto",
                    gap: 0, fontFamily: "var(--font-mono)", fontSize: "11px" }}>
        <div />
        <div style={{ padding: "0 0 6px 0", color: "var(--fg-mute)", textAlign: "center" }}>EFFICIENCY → HIGH</div>
        <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", color: "var(--fg-mute)", padding: "0 6px" }}>
          PURPOSE → HIGH
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr",
                       border: "var(--border-hair)", minHeight: 280 }}>
          {(["Q2", "Q4", "Q1", "Q3"] as Quadrant[]).map((q) => {
            const placedHere = QUADRANT_CASES.filter((c) => placements[c.id]?.quadrant === q);
            return (
              <div key={q}
                onClick={() => picked && place(picked, q)}
                onKeyDown={(e) => { if (picked && (e.key === "Enter" || e.key === " ")) place(picked, q); }}
                tabIndex={picked ? 0 : -1}
                aria-label={`Drop into ${Q_LABELS[q]}`}
                style={{
                  background: Q_TINT[q], borderRight: q === "Q2" || q === "Q1" ? "var(--border-hair)" : "none",
                  borderBottom: q === "Q2" || q === "Q4" ? "var(--border-hair)" : "none",
                  padding: "var(--s-3)", cursor: picked ? "crosshair" : "default", position: "relative",
                }}>
                <div style={{ color: q === "Q3" ? "var(--danger)" : "var(--fg-mute)",
                              fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.12em" }}>
                  {Q_LABELS[q]}
                </div>
                <ul style={{ marginTop: "var(--s-3)", fontFamily: "var(--font-serif)", fontSize: "13px" }}>
                  {placedHere.map((c) => (
                    <li key={c.id} style={{ margin: "4px 0", color: "var(--fg)" }}>· {c.label}</li>
                  ))}
                </ul>
                {/* Book ghost markers */}
                {QUADRANT_CASES.filter((c) => revealed.has(c.id) && c.bookPlacement.quadrant === q).map((c) => (
                  <span key={c.id} title={`book: ${c.label}`}
                    style={{
                      display: "inline-block", marginRight: 6,
                      fontFamily: "var(--font-mono)", fontSize: "10px",
                      color: "var(--accent)", border: "1px dashed var(--accent)",
                      padding: "2px 4px", marginTop: 4,
                    }}>book · {c.label}</span>
                ))}
              </div>
            );
          })}
        </div>
        <div />
      </div>

      {/* Chips */}
      <div style={{
        marginTop: "var(--s-4)", display: "flex", flexWrap: "wrap", gap: "var(--s-2)",
        overflowX: "auto", padding: "var(--s-2) 0",
      }}>
        {QUADRANT_CASES.map((c) => (
          <button key={c.id} type="button" onClick={() => setPicked(c.id === picked ? null : c.id)}
            aria-pressed={picked === c.id}
            style={{
              fontFamily: "var(--font-serif)", fontSize: "13px",
              padding: "6px 10px",
              border: picked === c.id ? "1px solid var(--accent)" : "var(--border-hair)",
              background: picked === c.id ? "var(--bg-3)" : "transparent",
              color: "var(--fg)", cursor: "pointer",
            }}>
            {c.label}
          </button>
        ))}
        {picked && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-mute)", alignSelf: "center" }}>
            tap a quadrant to place — or press Enter on a focused quadrant
          </span>
        )}
      </div>

      {/* Compare */}
      {openCompareId && (() => {
        const c = QUADRANT_CASES.find((x) => x.id === openCompareId)!;
        const user = placements[openCompareId];
        if (!user) return null;
        const agreement = agreementOf(user, c.bookPlacement);
        const verdict = agreement === "SAME" ? "You and the book agree."
                      : agreement === "ADJACENT" ? "You placed one quadrant over."
                      : "Substantial disagreement. See below.";
        return (
          <PlacementCompare caseObj={c} userQ={user.quadrant} verdict={verdict}
            agreement={agreement}
            onJumpToOntology={(claimId) => { setSelectedClaimId(claimId); setMode("ontology"); }}
            onClose={() => setOpenCompareId(null)} />
        );
      })()}
    </div>
  );
}

function PlacementCompare({
  caseObj, userQ, verdict, agreement, onJumpToOntology, onClose,
}: {
  caseObj: QuadrantCase; userQ: Quadrant; verdict: string;
  agreement: "SAME" | "ADJACENT" | "OPPOSITE";
  onJumpToOntology: (id: string) => void; onClose: () => void;
}) {
  const claimMap = new Map(CLAIMS.map((c) => [c.id, c]));
  return (
    <aside role="dialog" aria-label={`Book reading: ${caseObj.label}`}
      style={{
        position: "fixed", right: 16, bottom: 80, width: "min(420px, 92%)",
        maxHeight: "70vh", overflow: "auto", background: "var(--bg-1)",
        border: "var(--border-hair)", padding: "var(--s-4)", zIndex: 50,
      }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", margin: 0 }}>{caseObj.label}</h3>
        <button type="button" onClick={onClose}
          style={{ background: "transparent", color: "var(--fg-mute)", cursor: "pointer", padding: 0 }}>esc</button>
      </header>
      <div style={{ marginTop: "var(--s-2)", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-mute)" }}>
        you: <span style={{ color: "var(--fg)" }}>{userQ}</span>
        {"  ·  "}
        book: <span style={{ color: "var(--accent)" }}>{caseObj.bookPlacement.quadrant}</span>
        {"  ·  "}
        <span style={{ color: agreement === "SAME" ? "var(--ok)" : agreement === "OPPOSITE" ? "var(--danger)" : "var(--fg)" }}>
          {agreement.toLowerCase()}
        </span>
      </div>
      <div style={{ marginTop: "var(--s-3)", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-mute)" }}>
        {verdict}
      </div>
      {caseObj.trajectory && (
        <div style={{ marginTop: "var(--s-3)", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-dim)" }}>
          trajectory: {caseObj.trajectory.map((p) => `${p.quadrant}${p.asOfYear ? ` (${p.asOfYear})` : ""}`).join("  →  ")}
          <div style={{ marginTop: "4px", color: "var(--fg-mute)" }}>
            The book reads this institution as moving between quadrants over time. The arrow shows the book&apos;s account of its drift.
          </div>
        </div>
      )}
      <div style={{ marginTop: "var(--s-4)" }}>
        {caseObj.reasoning.map((r, i) => (
          <div key={i} className="prp-prose" style={{ fontSize: "14px", marginTop: "var(--s-3)" }}>
            <p>{r.body}</p>
          </div>
        ))}
      </div>
      {caseObj.claimRefs.length > 0 && (
        <footer style={{ marginTop: "var(--s-4)", display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {caseObj.claimRefs.map((id) => (
            <button key={id} type="button" onClick={() => onJumpToOntology(id)}
              title={claimMap.get(id)?.name}
              style={{
                fontFamily: "var(--font-mono)", fontSize: "10px",
                color: "var(--accent)", padding: "3px 6px",
                border: "var(--border-hair)", background: "transparent", cursor: "pointer",
                letterSpacing: "0.08em",
              }}>
              open in ontology · {id}
            </button>
          ))}
        </footer>
      )}
    </aside>
  );
}
