"use client";
import { useState } from "react";
import type { ExperienceContext } from "@/lib/experience-config";
import { OBJECTIONS, RESPONSES, type ResponseKind } from "@/lib/prp/objections";
import { usePrp } from "@/stores/prpExperience";

const KIND_TINT: Record<ResponseKind, string> = {
  REFRAME: "var(--danger)",
  REFUTE: "var(--ok)",
  "REFUTE-IN-PRINCIPLE": "var(--ok)",
  "CONCEDE-AND-DISCIPLINE": "var(--fg-mute)",
};

export default function ObjectionsMode({ ctx }: { ctx: ExperienceContext; regime: string }) {
  const openId = usePrp((s) => s.objections.openId);
  const tile = usePrp((s) => s.objections.tile);
  const readIds = usePrp((s) => s.objections.readIds);
  const continuationChoice = usePrp((s) => s.objections.continuationChoice);
  const openObjection = usePrp((s) => s.openObjection);
  const advanceTile = usePrp((s) => s.advanceTile);
  const chooseContinuation = usePrp((s) => s.chooseContinuation);
  const closeTurn = usePrp((s) => s.closeTurn);
  const setMode = usePrp((s) => s.setMode);
  const setSelectedClaimId = usePrp((s) => s.setSelectedClaimId);

  const obj = openId ? OBJECTIONS.find((o) => o.id === openId) : null;
  const resp = openId ? RESPONSES[openId] : null;
  const choice = openId ? continuationChoice[openId] : null;
  const [customText, setCustomText] = useState("");

  return (
    <div style={{ padding: "var(--s-4)", display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
      <header>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", margin: 0 }}>
          Seven objections the book expects. Which one is yours?
        </h2>
      </header>

      <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-mute)", margin: 0 }}>
        The book answers on its own methodological terms. Some objections the book REFRAMES rather than REFUTES.
        See the last tile of each turn.{resp && (
          <>{" · current: "}<span style={{ color: KIND_TINT[resp.kind] }}>{resp.kind}</span></>
        )}
      </p>

      {!obj && (
        <div style={{
          display: "grid", gap: "var(--s-3)",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        }}>
          {OBJECTIONS.map((o) => (
            <button key={o.id} type="button" onClick={() => { openObjection(o.id); ctx.announce(`Objection ${o.id}: ${o.title}`); }}
              style={{
                textAlign: "left", padding: "var(--s-3)", border: "var(--border-hair)",
                background: "var(--bg-1)", cursor: "pointer", position: "relative",
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)" }}>
                <span>OBJECTION {o.id}</span>
                <span>{readIds.has(o.id) ? "✓ read" : ""}</span>
              </div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "16px", margin: "4px 0 8px" }}>{o.title}</h3>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-dim)", lineHeight: 1.5 }}>{o.objectionText}</p>
              <div style={{ marginTop: "8px", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)" }}>
                urgency {"●".repeat(o.urgency)}{"○".repeat(5 - o.urgency)}
                {"  ·  targets "}{o.targetClaimIds.join(", ")}
              </div>
            </button>
          ))}
        </div>
      )}

      {obj && resp && (
        <article role="dialog" aria-label={`Dialectic turn for objection ${obj.id}`}
          style={{ border: "var(--border-hair)", padding: "var(--s-4)" }}>
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--s-3)" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-mute)" }}>
              OBJECTION {obj.id} · TILE {tile ?? "—"} of A→B→C
            </span>
            <button type="button" onClick={closeTurn} style={btn}>back to deck</button>
          </header>

          {tile === "A" && (
            <Tile label="TILE A — OBJECTION">
              <div className="prp-prose" style={{ fontSize: "15px" }}><p>{obj.objectionText}</p></div>
            </Tile>
          )}

          {tile === "B" && (
            <Tile label="TILE B — THE BOOK'S RESPONSE">
              <div style={{
                display: "inline-block", marginBottom: "var(--s-3)",
                fontFamily: "var(--font-mono)", fontSize: "10px",
                padding: "3px 6px", letterSpacing: "0.12em",
                color: KIND_TINT[resp.kind], border: `1px solid ${KIND_TINT[resp.kind]}`,
              }}>{resp.kind}</div>
              <div className="prp-prose prp-prose--drop-cap" style={{ fontSize: "15px" }}>
                <p>{resp.responseText}</p>
              </div>
            </Tile>
          )}

          {tile === "C" && (
            <Tile label="TILE C — WHAT WOULD YOU SAY NEXT?">
              <fieldset>
                {resp.continuations.map((c, i) => (
                  <label key={i} style={{
                    display: "block", padding: "8px 0", fontFamily: "var(--font-mono)", fontSize: "13px", cursor: "pointer",
                  }}>
                    <input type="radio" name="cont" checked={choice?.index === i}
                      onChange={() => chooseContinuation(i)} />
                    <span style={{ marginLeft: 8 }}>
                      {c.stance === "press-further" ? "Press further: " :
                       c.stance === "reject-premise" ? "Reject the premise: " :
                       "Say the book is playing with words: "}{c.text}
                    </span>
                  </label>
                ))}
                <label style={{ display: "block", paddingTop: "var(--s-2)", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
                  <input type="radio" name="cont" checked={choice?.index === "custom"}
                    onChange={() => chooseContinuation("custom", customText)} />
                  <span style={{ marginLeft: 8 }}>Custom:</span>
                  <textarea
                    value={customText}
                    onChange={(e) => { setCustomText(e.target.value); if (choice?.index === "custom") chooseContinuation("custom", e.target.value); }}
                    rows={2}
                    style={{
                      width: "100%", marginTop: 4, background: "var(--bg-0)",
                      color: "var(--fg)", border: "var(--border-hair)",
                      fontFamily: "var(--font-mono)", fontSize: "13px", padding: "6px",
                    }}
                  />
                </label>
              </fieldset>
              <div style={{ marginTop: "var(--s-3)", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--fg-dim)", lineHeight: 1.5 }}>
                The book&apos;s response here is a <span style={{ color: KIND_TINT[resp.kind] }}>{resp.kind}</span>.
                If you still reject the response, the disagreement is likely at{" "}
                <button type="button"
                  onClick={() => { setSelectedClaimId(resp.openInOntologyClaimId); setMode("ontology"); }}
                  style={{ background: "transparent", color: "var(--accent)", cursor: "pointer", padding: 0 }}>
                  {resp.openInOntologyClaimId}
                </button>
                {", which you can open in the Ontology."}
                {(resp.kind === "REFRAME" && resp.reframeAlt) && (
                  <div style={{ marginTop: "var(--s-2)" }}>
                    The book does not expect to convert a reader who rejects {resp.openInOntologyClaimId}. It asks only that the reader state an alternative account that does not reduce to <em>{resp.reframeAlt}</em>.
                  </div>
                )}
              </div>
              {resp.openInDiamondCaseId && (
                <button type="button" style={{ ...btn, marginTop: "var(--s-3)" }}
                  onClick={() => setMode("diamond")}>
                  open in diamond · {resp.openInDiamondCaseId}
                </button>
              )}
            </Tile>
          )}

          <footer style={{ marginTop: "var(--s-4)", display: "flex", gap: "8px" }}>
            {tile !== "C" && <button type="button" style={btn} onClick={advanceTile}>advance →</button>}
            {tile === "C" && <button type="button" style={btn} onClick={closeTurn}>finish & return</button>}
          </footer>
        </article>
      )}
    </div>
  );
}

const btn: React.CSSProperties = {
  fontFamily: "var(--font-mono)", fontSize: "11px", padding: "4px 10px",
  border: "var(--border-hair)", background: "transparent", color: "var(--fg)",
  cursor: "pointer", letterSpacing: "0.06em", textTransform: "uppercase",
};

function Tile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)",
                     letterSpacing: "0.12em", marginBottom: "var(--s-3)" }}>{label}</div>
      {children}
    </section>
  );
}
