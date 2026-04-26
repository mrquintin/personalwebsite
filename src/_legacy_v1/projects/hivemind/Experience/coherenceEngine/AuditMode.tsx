"use client";
import { useEffect, useRef, useState } from "react";
import type { ExperienceContext } from "@/lib/experience-config";
import { useCe, type ScoringMode } from "@/stores/coherenceEngineExperience";
import { DECISION_INPUTS, APPLICATION_LABELS } from "@/lib/coherenceEngine/decisionInputs";
import { buildArtifact } from "@/lib/coherenceEngine/artifacts";
import { canonicalJson, sha256Hex } from "@/lib/coherenceEngine/hashStub";
import { CANDID_LIMITS, CANDID_CLOSING, QUINTIN_HYPOTHESIS, VALIDATION_PLAN } from "@/lib/coherenceEngine/candidLimits";

export default function AuditMode({ ctx, regime }: { ctx: ExperienceContext; regime: "narrow" | "standard" | "wide" }) {
  const artifactId = useCe((s) => s.audit.activeArtifactId);
  const expanded = useCe((s) => s.audit.expandedSections);
  const scoringMode = useCe((s) => s.audit.scoringMode);
  const replayState = useCe((s) => s.audit.replayState);
  const lastHash = useCe((s) => s.audit.lastComputedHash);
  const ledgerExpanded = useCe((s) => s.audit.ledgerExpanded);
  const setArtifact = useCe((s) => s.setActiveArtifact);
  const toggleSection = useCe((s) => s.toggleSection);
  const setScoringMode = useCe((s) => s.setScoringMode);
  const setReplay = useCe((s) => s.setReplayState);
  const toggleLedger = useCe((s) => s.toggleLedgerItem);
  const openInMode = useCe((s) => s.openInMode);
  const activeRegime = useCe((s) => s.gates.activeRegime);

  const fixture = DECISION_INPUTS.find((d) => d.application_id === artifactId) ?? DECISION_INPUTS[0];
  const artifact = buildArtifact(artifactId, scoringMode, fixture.portfolio_state.regime);
  const [expectedHash, setExpectedHash] = useState<string | null>(null);
  const validationRef = useRef<HTMLDivElement | null>(null);

  // recompute expected hash whenever artifact id / scoring mode changes
  useEffect(() => {
    let cancelled = false;
    const body = canonicalJson(artifact);
    sha256Hex(body).then((h) => { if (!cancelled) setExpectedHash(h); });
    return () => { cancelled = true; };
  }, [artifactId, scoringMode]); // eslint-disable-line react-hooks/exhaustive-deps

  async function runReplay() {
    setReplay("running", null);
    ctx.announce(`Replaying decision for ${artifactId}.`);
    const built = buildArtifact(artifactId, scoringMode, fixture.portfolio_state.regime);
    const body = canonicalJson(built);
    const computed = await sha256Hex(body);
    const ok = computed === expectedHash;
    setReplay(ok ? "complete" : "mismatch", computed);
    ctx.announce(ok ? "Replay complete. Hash matches." : "Replay complete. Hash mismatch.");
  }

  // keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "r") void runReplay();
      else if (e.key === "e") setScoringMode("enforce");
      else if (e.key === "s") setScoringMode("shadow");
      else if (e.key === "1") toggleLedger("predictive-validity");
      else if (e.key === "2") toggleLedger("weights-tuned");
      else if (e.key === "3") toggleLedger("cross-domain");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setScoringMode, toggleLedger]); // eslint-disable-line react-hooks/exhaustive-deps

  const isWide = regime === "wide";

  return (
    <div role="tabpanel" aria-label="Decision Artifact and Honest Ledger" style={{ padding: "var(--s-3)", display: "grid", gridTemplateColumns: isWide ? "58% 42%" : "1fr", gap: "var(--s-3)", overflow: "auto" }}>
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
        <ArtifactPicker activeId={artifactId} setArtifact={(id) => { setArtifact(id); ctx.announce(`Artifact: ${APPLICATION_LABELS[id]?.short ?? id}`); }} />
        <div style={{ display: "flex", gap: "var(--s-2)", alignItems: "center" }}>
          <button onClick={runReplay} style={{ padding: "6px 14px", fontFamily: "var(--font-mono)", fontSize: "11px", background: "var(--accent)", color: "var(--bg-0)", border: "none", cursor: "pointer" }}>
            REPLAY {replayState === "running" ? "…" : ""}
          </button>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: replayState === "complete" ? "var(--ok)" : replayState === "mismatch" ? "var(--danger)" : "var(--fg-mute)" }}>
            {replayState === "idle" && "press REPLAY to verify"}
            {replayState === "running" && "hashing…"}
            {replayState === "complete" && "expected == computed"}
            {replayState === "mismatch" && "fixture drift — run P06 ship-gate"}
          </span>
        </div>
        <HashPanel expected={expectedHash} computed={lastHash} replayState={replayState} />
        <ScoringModeToggle mode={scoringMode} onChange={(m) => { setScoringMode(m); ctx.announce(`Scoring mode: ${m}.`); }} />
        <ArtifactInspector artifact={artifact} expanded={expanded} toggleSection={toggleSection} />
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
        <QuintinHypothesisCard />
        <CandidLimitsLedger expanded={ledgerExpanded} toggle={toggleLedger} openInMode={openInMode} validationRef={validationRef} />
        <div ref={validationRef}><ValidationPlanCard /></div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)" }}>active regime preview: {activeRegime}</div>
      </section>
    </div>
  );
}

function ArtifactPicker({ activeId, setArtifact }: { activeId: string; setArtifact: (id: string) => void }) {
  return (
    <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap" }}>
      {DECISION_INPUTS.map((d) => {
        const active = d.application_id === activeId;
        return (
          <button key={d.application_id} onClick={() => setArtifact(d.application_id)}
            style={{ padding: "4px 8px", fontFamily: "var(--font-mono)", fontSize: "10px", background: active ? "var(--bg-2)" : "transparent", color: active ? "var(--fg)" : "var(--fg-dim)", border: active ? "1px solid var(--accent)" : "var(--border-hair)", cursor: "pointer" }}>
            {APPLICATION_LABELS[d.application_id]?.short ?? d.application_id}
          </button>
        );
      })}
    </div>
  );
}

function HashPanel({ expected, computed, replayState }: { expected: string | null; computed: string | null; replayState: string }) {
  const both = replayState === "complete" || replayState === "mismatch";
  return (
    <div style={{ padding: "var(--s-3)", border: "var(--border-hair)", background: "var(--bg-1)", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-dim)" }}>
      <div style={{ marginBottom: "4px" }}>expected: <span style={{ color: "var(--fg)", wordBreak: "break-all" }}>{both ? expected ?? "(pending)" : "(press REPLAY)"}</span></div>
      <div>computed: <span style={{ color: replayState === "complete" ? "var(--ok)" : replayState === "mismatch" ? "var(--danger)" : "var(--fg)", wordBreak: "break-all" }}>{both ? computed ?? "(pending)" : "(press REPLAY)"}</span></div>
      <div style={{ marginTop: "var(--s-2)", color: "var(--fg-mute)", fontSize: "9px" }}>algorithm: SHA-256 over canonicalJson(artifact)</div>
    </div>
  );
}

function ScoringModeToggle({ mode, onChange }: { mode: ScoringMode; onChange: (m: ScoringMode) => void }) {
  return (
    <div style={{ padding: "var(--s-2) var(--s-3)", border: "var(--border-hair)", background: "var(--bg-1)" }}>
      <div style={{ display: "flex", gap: "var(--s-1)", marginBottom: "var(--s-2)" }}>
        {(["enforce", "shadow"] as ScoringMode[]).map((m) => {
          const active = m === mode;
          return (
            <button key={m} onClick={() => onChange(m)}
              style={{ padding: "4px 12px", fontFamily: "var(--font-mono)", fontSize: "10px", background: active ? "var(--bg-2)" : "transparent", color: active ? "var(--fg)" : "var(--fg-dim)", border: active ? "1px solid var(--accent)" : "var(--border-hair)", cursor: "pointer" }}>
              {m.toUpperCase()}
            </button>
          );
        })}
      </div>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: "11px", color: "var(--fg-dim)", lineHeight: 1.5 }}>
        Shadow mode computes and records the decision as a shadow_decision artifact but takes no downstream action. It is how the team deploys new parameter sets against live traffic without touching funding decisions [CE4 §7].
      </div>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: "10px", color: "var(--fg-mute)", marginTop: "var(--s-2)", fontStyle: "italic" }}>
        Switching to shadow will produce a different artifact hash. That is the point: the hash binds every input — including scoring_mode — to the outcome.
      </div>
    </div>
  );
}

function ArtifactInspector({ artifact, expanded, toggleSection }: { artifact: ReturnType<typeof buildArtifact>; expanded: Record<string, boolean>; toggleSection: (k: string) => void }) {
  const fields: Array<{ key: string; value: unknown; complex?: boolean }> = [
    { key: "schema_version", value: artifact.schema_version },
    { key: "policy_version", value: artifact.policy_version },
    { key: "parameter_set_id", value: artifact.parameter_set_id },
    { key: "input", value: artifact.input, complex: true },
    { key: "csReq", value: artifact.csReq, complex: true },
    { key: "csObserved", value: artifact.csObserved },
    { key: "outcome", value: artifact.outcome },
    { key: "failed_gates", value: artifact.failed_gates, complex: true },
    { key: "reason_codes", value: artifact.reason_codes, complex: true },
    { key: "escalation_packet_ref", value: artifact.escalation_packet_ref },
    { key: "scoring_mode", value: artifact.scoring_mode },
    { key: "created_at_iso", value: artifact.created_at_iso },
  ];
  const outcomeColor = artifact.outcome === "pass" ? "var(--ok)" : artifact.outcome === "fail" ? "var(--danger)" : "var(--accent)";
  return (
    <div style={{ padding: "var(--s-3)", border: "var(--border-hair)", background: "var(--bg-1)", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-dim)", maxHeight: "420px", overflow: "auto" }}>
      <div style={{ color: "var(--fg)", marginBottom: "var(--s-2)" }}>DECISION ARTIFACT</div>
      {fields.map((f) => {
        const isOpen = !!expanded[f.key];
        return (
          <div key={f.key} style={{ padding: "2px 0", borderBottom: "var(--border-hair)" }}>
            <button onClick={() => toggleSection(f.key)} style={{ background: "transparent", border: "none", color: "var(--fg-dim)", fontFamily: "var(--font-mono)", fontSize: "11px", cursor: "pointer", textAlign: "left", padding: 0 }}>
              {f.complex ? (isOpen ? "▾" : "▸") : "·"} <span>{f.key}</span>
              {!f.complex && (
                <span style={{ marginLeft: "8px", color: f.key === "outcome" ? outcomeColor : "var(--fg)" }}>
                  {String(f.value)}
                </span>
              )}
            </button>
            {f.complex && isOpen && (
              <pre style={{ margin: "4px 0 0 16px", fontSize: "10px", color: "var(--fg)", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                {JSON.stringify(f.value, null, 2)}
              </pre>
            )}
          </div>
        );
      })}
    </div>
  );
}

function QuintinHypothesisCard() {
  return (
    <div style={{ padding: "var(--s-3)", border: "var(--border-hair)", background: "var(--bg-1)" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)", marginBottom: "var(--s-2)" }}>WORKING THESIS</div>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "13px", color: "var(--fg)", lineHeight: 1.6, margin: 0 }}>
        &ldquo;{QUINTIN_HYPOTHESIS.text}&rdquo;
      </p>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--fg-mute)", marginTop: "var(--s-2)" }}>— {QUINTIN_HYPOTHESIS.source}</div>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: "10px", color: "var(--fg-mute)", fontStyle: "italic", marginTop: "var(--s-1)" }}>Working thesis. Explicitly conjectural [CE1 §3.2].</div>
    </div>
  );
}

function CandidLimitsLedger({ expanded, toggle, openInMode, validationRef }: { expanded: Record<string, boolean>; toggle: (id: string) => void; openInMode: (m: "layers" | "cosine" | "audit", refId: string) => void; validationRef: React.MutableRefObject<HTMLDivElement | null> }) {
  return (
    <div style={{ padding: "var(--s-3)", border: "var(--border-hair)", background: "var(--bg-1)" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)", marginBottom: "var(--s-2)" }}>CANDID LIMITS</div>
      {CANDID_LIMITS.map((item) => {
        const isOpen = expanded[item.id] ?? true;
        return (
          <div key={item.id} style={{ padding: "var(--s-2) 0", borderBottom: "var(--border-hair)" }}>
            <button onClick={() => toggle(item.id)} style={{ background: "transparent", border: "none", color: "var(--fg)", fontFamily: "var(--font-serif)", fontSize: "13px", cursor: "pointer", textAlign: "left", padding: 0, display: "flex", gap: "var(--s-1)", width: "100%" }}>
              <span style={{ color: "var(--accent)" }}>{isOpen ? "▾" : "▸"}</span>
              <span style={{ flex: 1 }}>{item.anchor}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--fg-mute)" }}>{item.source}</span>
            </button>
            {isOpen && (
              <div style={{ marginTop: "var(--s-2)", marginLeft: "var(--s-3)" }}>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: "12px", color: "var(--fg-dim)", lineHeight: 1.6, margin: 0 }}>{item.body}</p>
                <button onClick={() => {
                  if (item.id === "predictive-validity") { validationRef.current?.scrollIntoView({ behavior: "smooth" }); }
                  else if (item.id === "weights-tuned") openInMode("layers", "");
                  else if (item.id === "cross-domain") openInMode("cosine", "stage:difference");
                }} style={{ marginTop: "var(--s-1)", background: "transparent", border: "var(--border-hair)", color: "var(--accent)", padding: "2px 6px", fontFamily: "var(--font-mono)", fontSize: "10px", cursor: "pointer" }}>
                  cross-reference
                </button>
              </div>
            )}
          </div>
        );
      })}
      <div style={{ marginTop: "var(--s-3)", padding: "var(--s-2)", border: "var(--border-hair)", borderColor: "var(--accent-dim)" }}>
        <p style={{ fontFamily: "var(--font-serif)", fontSize: "12px", color: "var(--fg-dim)", margin: 0, fontStyle: "italic", lineHeight: 1.6 }}>{CANDID_CLOSING.anchor}</p>
      </div>
      <div style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--fg-mute)", marginTop: "var(--s-1)" }}>CE1 §8. Anchors preserved verbatim.</div>
    </div>
  );
}

function ValidationPlanCard() {
  return (
    <div style={{ padding: "var(--s-3)", border: "var(--border-hair)", background: "var(--bg-1)" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)", marginBottom: "var(--s-2)" }}>VALIDATION PLAN</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-dim)", lineHeight: 1.6 }}>
        Status: {VALIDATION_PLAN.status}<br />
        Design: {VALIDATION_PLAN.designSummary}<br />
        Target: {VALIDATION_PLAN.target}<br />
        Source: {VALIDATION_PLAN.source}
      </div>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: "11px", color: "var(--fg-dim)", marginTop: "var(--s-2)", fontStyle: "italic" }}>
        The engine, at present, is a measurement instrument whose predictive validity is an open question [CE1 §3.2].
      </div>
    </div>
  );
}
