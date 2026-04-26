"use client";
import { useEffect } from "react";
import type { ExperienceContext } from "@/lib/experience-config";
import { useHvm, type Mode as HvmMode } from "@/stores/hivemindExperience";
import { FAILURES, EXECUTIVE, type FailureEntry } from "@/lib/hivemind/failures";
import { BELIEFS } from "@/lib/hivemind/beliefs";

export default function FailuresMode({ ctx, regime }: { ctx: ExperienceContext; regime: "narrow" | "standard" | "wide" }) {
  const expanded = useHvm((s) => s.failures.expandedFailureId);
  const principlesOpen = useHvm((s) => s.failures.principlesOpen);
  const initialBelief = useHvm((s) => s.failures.initialBelief);
  const toggle = useHvm((s) => s.toggleFailure);
  const openPrinciples = useHvm((s) => s.openPrinciples);
  const closePrinciples = useHvm((s) => s.closePrinciples);
  const openInMode = useHvm((s) => s.openInMode);

  const expandedEntry = expanded ? FAILURES.find((f) => f.id === expanded) : null;

  useEffect(() => {
    if (expandedEntry) ctx.announce(`Failure ${expandedEntry.roman} expanded. Structural response: ${expandedEntry.responseLabel.toLowerCase()}.`);
  }, [expandedEntry, ctx]);

  return (
    <div style={{ padding: "var(--s-4)", display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
      <header style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--fg-mute)", letterSpacing: "0.1em" }}>
        FOUR STRUCTURAL FAILURES, FOUR STRUCTURAL RESPONSES
      </header>

      <div style={{
        display: "grid",
        gridTemplateColumns: regime === "narrow" ? "1fr" : "repeat(2, 1fr)",
        gap: "var(--s-3)",
      }}>
        {FAILURES.map((f) => (
          <FailureCard key={f.id} failure={f}
            expanded={regime !== "wide" && expanded === f.id}
            onToggle={() => toggle(f.id)} />
        ))}
      </div>

      {/* Executive card */}
      <div style={{ border: "var(--border-hair)", padding: "var(--s-3)", marginTop: "var(--s-2)" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)", letterSpacing: "0.1em" }}>
          TEAM — {EXECUTIVE.label}
        </div>
        <p style={{ fontFamily: "var(--font-serif)", fontSize: "13px", color: "var(--fg)", marginTop: 4 }}>{EXECUTIVE.body}</p>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontStyle: "italic", color: "var(--fg-dim)", marginTop: 8 }}>
          {EXECUTIVE.openOrgQuestion}
        </p>
      </div>

      <button type="button" onClick={() => openPrinciples(null)}
        style={{
          marginTop: "var(--s-2)", padding: "8px 12px",
          fontFamily: "var(--font-mono)", fontSize: "11px",
          border: "var(--border-hair)", background: "transparent",
          color: "var(--fg)", cursor: "pointer", letterSpacing: "0.1em",
          alignSelf: "flex-start",
        }}>
        OPEN THE SEVEN CORE BELIEFS
      </button>

      {/* WIDE-only side drawer */}
      {regime === "wide" && expandedEntry && (
        <ResponsePanel failure={expandedEntry}
          onClose={() => toggle(expandedEntry.id)}
          onOpenBelief={(n) => openPrinciples(n)}
          onOpenMode={(m, refId) => openInMode(m, refId)} />
      )}

      {/* Principles drawer */}
      {principlesOpen && (
        <PrinciplesDrawer initialBelief={initialBelief} onClose={closePrinciples} />
      )}
    </div>
  );
}

function FailureCard({ failure, expanded, onToggle }: { failure: FailureEntry; expanded: boolean; onToggle: () => void }) {
  return (
    <article style={{ border: "var(--border-hair)", padding: "var(--s-3)" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "20px", color: "var(--fg-mute)" }}>{failure.roman}.</span>
          {" "}
          <span style={{ fontFamily: "var(--font-serif)", fontSize: "18px", color: "var(--fg)" }}>{failure.name}</span>
        </div>
        <button type="button" onClick={onToggle} aria-expanded={expanded}
          style={{ background: "transparent", color: "var(--fg-mute)", cursor: "pointer", padding: 0, fontSize: "20px" }}>
          {expanded ? "−" : "+"}
        </button>
      </header>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "13px", color: "var(--fg)", marginTop: 6 }}>
        {failure.oneLinerVerbatim}
      </p>
      <div style={{ marginTop: 8, fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--accent)", letterSpacing: "0.1em" }}>
        RESPONSE: {failure.responseLabel}
      </div>

      {expanded && <InlineResponseSections failure={failure} />}
    </article>
  );
}

function InlineResponseSections({ failure }: { failure: FailureEntry }) {
  const openInMode = useHvm((s) => s.openInMode);
  const openPrinciples = useHvm((s) => s.openPrinciples);
  return (
    <div style={{ marginTop: "var(--s-3)", borderTop: "var(--border-hair)", paddingTop: "var(--s-3)" }}>
      <ResponseBody failure={failure} onOpenBelief={openPrinciples} onOpenMode={openInMode} />
    </div>
  );
}

function ResponsePanel({
  failure, onClose, onOpenBelief, onOpenMode,
}: {
  failure: FailureEntry; onClose: () => void;
  onOpenBelief: (n: 1|2|3|4|5|6|7) => void;
  onOpenMode: (m: HvmMode, refId: string) => void;
}) {
  return (
    <aside role="dialog" aria-label={`Failure ${failure.roman} response`}
      style={{
        position: "absolute", top: 0, right: 0, height: "100%", width: "min(440px, 50%)",
        background: "var(--bg-1)", borderLeft: "var(--border-hair)",
        overflow: "auto", padding: "var(--s-4)",
      }}>
      <header style={{ display: "flex", justifyContent: "space-between" }}>
        <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", margin: 0 }}>
          {failure.roman}. {failure.name}
        </h3>
        <button type="button" onClick={onClose} style={{ background: "transparent", color: "var(--fg-mute)", cursor: "pointer", padding: 0 }}>esc</button>
      </header>
      <ResponseBody failure={failure} onOpenBelief={onOpenBelief} onOpenMode={onOpenMode} />
    </aside>
  );
}

function ResponseBody({
  failure, onOpenBelief, onOpenMode,
}: {
  failure: FailureEntry;
  onOpenBelief: (n: 1|2|3|4|5|6|7) => void;
  onOpenMode: (m: HvmMode, refId: string) => void;
}) {
  return (
    <>
      <Section title="INDUSTRY BEHAVIOR">
        <p style={{ fontFamily: "var(--font-serif)", fontSize: "13px", marginBottom: 6 }}>{failure.oneLinerVerbatim}</p>
        <ul style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--fg-dim)" }}>
          {failure.industryMechanisms.map((m, i) => (<li key={i}>· {m}</li>))}
        </ul>
      </Section>
      <Section title="STRUCTURAL RESPONSE">
        <p style={{ fontFamily: "var(--font-serif)", fontSize: "13px" }}>{failure.responseBody}</p>
      </Section>
      <Section title={`FIRM ARTIFACT — ${failure.firmArtifact.label}`}>
        <p style={{ fontFamily: "var(--font-serif)", fontSize: "13px" }}>{failure.firmArtifact.body}</p>
      </Section>
      <Section title="CORE BELIEFS ENGAGED">
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {failure.beliefsEngaged.map((n) => (
            <button key={n} type="button" onClick={() => onOpenBelief(n)}
              style={{
                fontFamily: "var(--font-mono)", fontSize: "10px",
                color: "var(--accent)", border: "var(--border-hair)",
                padding: "3px 6px", background: "transparent", cursor: "pointer",
              }}>
              belief {n}
            </button>
          ))}
        </div>
      </Section>
      {failure.productCrossRef && (
        <Section title="WHERE IT SURFACES IN THE PRODUCT">
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "13px", color: "var(--fg-dim)" }}>{failure.productCrossRef.hint}</p>
          <button type="button"
            onClick={() => onOpenMode(failure.productCrossRef!.mode, failure.productCrossRef!.refId)}
            style={{
              marginTop: 6, fontFamily: "var(--font-mono)", fontSize: "10px",
              color: "var(--accent)", border: "var(--border-hair)",
              padding: "3px 6px", background: "transparent", cursor: "pointer",
              letterSpacing: "0.1em",
            }}>
            OPEN IN {failure.productCrossRef.mode.toUpperCase()}
          </button>
        </Section>
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: "var(--s-4)" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)", letterSpacing: "0.12em", marginBottom: 4 }}>{title}</div>
      {children}
    </section>
  );
}

function PrinciplesDrawer({ initialBelief, onClose }: { initialBelief: 1|2|3|4|5|6|7 | null; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div role="dialog" aria-label="seven core beliefs"
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 100,
                 display: "grid", placeItems: "center", padding: "var(--s-4)" }}>
      <div style={{
        background: "var(--bg-1)", border: "var(--border-hair)",
        width: "min(640px, 100%)", maxHeight: "82vh", overflow: "auto",
      }}>
        <header style={{ padding: "var(--s-3) var(--s-4)", borderBottom: "var(--border-hair)" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-mute)", letterSpacing: "0.12em" }}>
            SEVEN CORE BELIEFS (THE NASH LAB)
          </div>
          <p style={{ marginTop: 6, fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "13px", color: "var(--fg-dim)" }}>
            If you disagree with any of these principles, it will be difficult for you to align yourself with the company&apos;s mission.
          </p>
        </header>
        <ol style={{ padding: "var(--s-3) var(--s-4)" }}>
          {BELIEFS.map((b) => (
            <li key={b.number}
              id={`belief-${b.number}`}
              style={{
                padding: "var(--s-3) 0", borderBottom: "var(--border-hair)",
                background: initialBelief === b.number ? "var(--bg-2)" : "transparent",
              }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "16px", color: "var(--fg-mute)" }}>{String(b.number).padStart(2, "0")}</span>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: "14px", margin: 0, color: "var(--fg)" }}>
                  {b.verbatim}
                </p>
              </div>
              {b.loadBearing && (
                <span style={{ display: "inline-block", marginTop: 6, fontFamily: "var(--font-mono)", fontSize: "9px",
                                color: "var(--accent)", border: "1px solid var(--accent)", padding: "1px 5px", letterSpacing: "0.1em" }}>
                  LOAD-BEARING
                </span>
              )}
            </li>
          ))}
        </ol>
        <footer style={{ padding: "var(--s-3) var(--s-4)", borderTop: "var(--border-hair)", display: "flex", justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} style={{
            fontFamily: "var(--font-mono)", fontSize: "11px", padding: "4px 10px",
            border: "var(--border-hair)", background: "transparent", color: "var(--fg)", cursor: "pointer",
          }}>close (esc)</button>
        </footer>
      </div>
    </div>
  );
}
