"use client";
import { useEffect, useRef } from "react";
import type { ExperienceContext } from "@/lib/experience-config";
import { useCe, type Regime } from "@/stores/coherenceEngineExperience";
import { DECISION_INPUTS, GATE_ORDER, APPLICATION_LABELS, findInput, type GateKey, type GateRunResult, type GateVerdict } from "@/lib/coherenceEngine/decisionInputs";
import { DOMAIN_PARAMS } from "@/lib/coherenceEngine/domainParameters";

const GATE_DISPLAY: Record<GateKey, { n: number; short: string }> = {
  quality_gate: { n: 1, short: "QUALITY" },
  compliance_gate: { n: 2, short: "COMPLIANCE" },
  anti_gaming_gate: { n: 3, short: "ANTI-GAMING" },
  portfolio_gate: { n: 4, short: "PORTFOLIO" },
  coherence_gate: { n: 5, short: "COHERENCE" },
  confidence_gate: { n: 6, short: "CONFIDENCE" },
};

export default function GatesMode({ ctx, regime }: { ctx: ExperienceContext; regime: "narrow" | "standard" | "wide" }) {
  const appId = useCe((s) => s.gates.activeApplicationId);
  const step = useCe((s) => s.gates.stepperIndex);
  const auto = useCe((s) => s.gates.autoPlay);
  const activeRegime = useCe((s) => s.gates.activeRegime);
  const drawerGate = useCe((s) => s.gates.openDrawerGate);
  const setApp = useCe((s) => s.setActiveApplication);
  const stepF = useCe((s) => s.stepForward);
  const stepB = useCe((s) => s.stepBackward);
  const reset = useCe((s) => s.resetPipeline);
  const tAuto = useCe((s) => s.toggleAutoPlay);
  const setRegime = useCe((s) => s.setActiveRegime);
  const openDrawer = useCe((s) => s.openGateDrawer);
  const openInMode = useCe((s) => s.openInMode);

  const fixture = findInput(appId);
  const variant = fixture.regimeVariants[activeRegime];
  const grr = variant.gateRunResult;

  // reset regime to fixture's authored regime when app changes
  const lastAppId = useRef(appId);
  useEffect(() => {
    if (lastAppId.current !== appId) {
      setRegime(fixture.portfolio_state.regime);
      lastAppId.current = appId;
    }
  }, [appId, fixture, setRegime]);

  // autoplay
  useEffect(() => {
    if (!auto) return;
    if (step >= 6) { tAuto(); return; }
    const t = setTimeout(() => stepF(), 900);
    return () => clearTimeout(t);
  }, [auto, step, stepF, tAuto]);

  // keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (["1", "2", "3", "4", "5"].includes(e.key)) {
        const idx = parseInt(e.key, 10) - 1;
        if (idx < DECISION_INPUTS.length) setApp(DECISION_INPUTS[idx].application_id);
      } else if (e.key === " ") { e.preventDefault(); tAuto(); }
      else if (e.key === "ArrowRight") stepF();
      else if (e.key === "ArrowLeft") stepB();
      else if (e.key === "Home") reset();
      else if (e.key === "End") { for (let i = step; i < 6; i++) stepF(); }
      else if (e.key === "n") setRegime("normal");
      else if (e.key === "d") setRegime("defensive");
      else if (e.key === "s") setRegime("stress");
      else if (e.key === "Escape") openDrawer(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setApp, tAuto, stepF, stepB, reset, step, setRegime, openDrawer]);

  return (
    <div role="tabpanel" aria-label="Decision Policy Gates" style={{ padding: "var(--s-3)", overflow: "auto" }}>
      <ApplicationPicker activeId={appId} setApp={(id) => { setApp(id); ctx.announce(`Application: ${APPLICATION_LABELS[id]?.short ?? id}`); }} />
      <RegimeSelector active={activeRegime} authored={fixture.portfolio_state.regime} setRegime={(r) => { setRegime(r); ctx.announce(`Regime set to ${r}.`); }} />
      <InputSummary fixture={fixture} grr={grr} />

      <div style={{ fontFamily: "var(--font-serif)", fontSize: "12px", color: "var(--fg-dim)", fontStyle: "italic", margin: "var(--s-3) 0 var(--s-2) 0" }}>Ordering is load-bearing.</div>
      <PipelineControls auto={auto} step={step} stepF={stepF} stepB={stepB} reset={reset} tAuto={tAuto} />
      <GatePipeline grr={grr} step={step} regime={regime} openDrawer={openDrawer} drawerGate={drawerGate} openInMode={openInMode} />

      <div style={{ display: "grid", gridTemplateColumns: regime === "wide" ? "1fr 1fr" : "1fr", gap: "var(--s-3)", marginTop: "var(--s-3)" }}>
        <CSReqDecomp fixture={fixture} grr={grr} />
        <RTermLedger grr={grr} />
      </div>

      <DecisionStub grr={grr} appId={appId} openInMode={openInMode} />
    </div>
  );
}

function ApplicationPicker({ activeId, setApp }: { activeId: string; setApp: (id: string) => void }) {
  return (
    <div style={{ display: "flex", gap: "var(--s-2)", flexWrap: "wrap", marginBottom: "var(--s-2)" }}>
      {DECISION_INPUTS.map((d, i) => {
        const active = d.application_id === activeId;
        return (
          <button key={d.application_id} onClick={() => setApp(d.application_id)}
            style={{ padding: "6px 10px", fontFamily: "var(--font-mono)", fontSize: "11px", background: active ? "var(--bg-2)" : "transparent", color: active ? "var(--fg)" : "var(--fg-dim)", border: active ? "1px solid var(--accent)" : "var(--border-hair)", cursor: "pointer", display: "flex", flexDirection: "column" }}>
            <span><span style={{ color: "var(--accent)" }}>{i + 1}</span> {APPLICATION_LABELS[d.application_id]?.short ?? d.application_id}</span>
            <span style={{ fontSize: "9px", color: "var(--fg-mute)" }}>{d.application_id}</span>
          </button>
        );
      })}
    </div>
  );
}

function RegimeSelector({ active, authored, setRegime }: { active: Regime; authored: Regime; setRegime: (r: Regime) => void }) {
  const opts: Array<{ id: Regime; r_regime: number }> = [
    { id: "normal", r_regime: 0 },
    { id: "defensive", r_regime: 0.010 },
    { id: "stress", r_regime: 0.015 },
  ];
  return (
    <div style={{ display: "flex", gap: "var(--s-1)", marginBottom: "var(--s-3)", alignItems: "center", flexWrap: "wrap" }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)", marginRight: "var(--s-2)" }}>REGIME:</span>
      {opts.map((o) => {
        const isActive = o.id === active;
        const isAuthored = o.id === authored;
        return (
          <button key={o.id} onClick={() => setRegime(o.id)}
            style={{ padding: "4px 8px", fontFamily: "var(--font-mono)", fontSize: "10px", background: isActive ? "var(--bg-2)" : "transparent", color: isActive ? "var(--fg)" : "var(--fg-dim)", border: isActive ? "1px solid var(--accent)" : "var(--border-hair)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
              {isAuthored && <span aria-hidden="true" style={{ color: "var(--accent)", fontSize: "8px" }}>·</span>}
              {o.id.toUpperCase()}
            </span>
            <span style={{ color: "var(--fg-mute)", fontSize: "9px" }}>+{o.r_regime.toFixed(3)}</span>
          </button>
        );
      })}
    </div>
  );
}

function InputSummary({ fixture, grr }: { fixture: ReturnType<typeof findInput>; grr: GateRunResult }) {
  return (
    <div style={{ padding: "var(--s-2) var(--s-3)", border: "var(--border-hair)", background: "var(--bg-1)", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-dim)", marginBottom: "var(--s-2)" }}>
      {fixture.application_id} | ${fixture.requested_check_usd.toLocaleString()} | {fixture.domain_primary} | CS = {fixture.coherence_superiority >= 0 ? "+" : ""}{fixture.coherence_superiority.toFixed(2)} | CI width = {grr.ciWidth.toFixed(2)} | compliance: {fixture.compliance_status}
    </div>
  );
}

function PipelineControls({ auto, step, stepF, stepB, reset, tAuto }: { auto: boolean; step: number; stepF: () => void; stepB: () => void; reset: () => void; tAuto: () => void }) {
  const btn = { padding: "4px 10px", fontFamily: "var(--font-mono)" as const, fontSize: "11px", background: "transparent", border: "var(--border-hair)", color: "var(--fg-dim)", cursor: "pointer" };
  return (
    <div style={{ display: "flex", gap: "var(--s-2)", marginBottom: "var(--s-2)", alignItems: "center" }}>
      <button onClick={stepB} style={btn} aria-label="step back">◀</button>
      <button onClick={stepF} style={btn} aria-label="step forward">▶</button>
      <button onClick={tAuto} style={{ ...btn, color: auto ? "var(--accent)" : "var(--fg-dim)" }} aria-label="auto play">▶▶</button>
      <button onClick={reset} style={btn} aria-label="reset">⟲</button>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)", marginLeft: "var(--s-2)" }}>step {step}/6</span>
    </div>
  );
}

function GatePipeline({ grr, step, regime, openDrawer, drawerGate, openInMode }: { grr: GateRunResult; step: number; regime: string; openDrawer: (g: string | null) => void; drawerGate: string | null; openInMode: (m: "cosine" | "compare", refId: string) => void }) {
  const isWide = regime === "wide";
  return (
    <div style={{ display: "grid", gridTemplateColumns: isWide ? "repeat(6, 1fr)" : "1fr", gap: "var(--s-2)", marginBottom: "var(--s-3)" }}>
      {GATE_ORDER.map((g, i) => {
        const verdict: GateVerdict = step > i ? grr.perGate[i].verdict : "pending";
        const isHaltPoint = grr.haltedAt !== null && i > grr.haltedAt && step > i;
        const effective: GateVerdict = isHaltPoint ? "pending" : verdict;
        return <GateCard key={g} gate={g} verdict={effective} detail={grr.perGate[i]} grr={grr} openDrawer={openDrawer} drawerOpen={drawerGate === g} openInMode={openInMode} />;
      })}
    </div>
  );
}

function GateCard({ gate, verdict, detail, grr, openDrawer, drawerOpen, openInMode }: { gate: GateKey; verdict: GateVerdict; detail: GateRunResult["perGate"][number]; grr: GateRunResult; openDrawer: (g: string | null) => void; drawerOpen: boolean; openInMode: (m: "cosine" | "compare", refId: string) => void }) {
  const info = GATE_DISPLAY[gate];
  const color = verdict === "pass" ? "var(--ok)" : verdict === "fail" ? "var(--danger)" : verdict === "manual_review" ? "var(--accent)" : "var(--fg-mute)";
  const border = verdict === "pending" ? `1px dashed var(--rule)` : `1px solid ${color}`;
  return (
    <div style={{ padding: "var(--s-2)", border, background: "var(--bg-1)", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-dim)" }}>{info.n}. {info.short}</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color, textTransform: "uppercase", letterSpacing: "0.08em" }}>{verdict === "pending" ? "—" : verdict.replace("_", " ")}</span>
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--fg-dim)", marginTop: "var(--s-1)" }}>
        <KeyDetailLine gate={gate} grr={grr} />
      </div>
      {verdict !== "pass" && verdict !== "pending" && detail.reasonCodes.length > 0 && (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color, marginTop: "4px" }}>
          {detail.reasonCodes.map((c) => <div key={c}>{c}</div>)}
        </div>
      )}
      <button onClick={() => openDrawer(drawerOpen ? null : gate)} aria-label="explainer" style={{ position: "absolute", top: "4px", right: "4px", background: "transparent", border: "var(--border-hair)", color: "var(--fg-mute)", padding: "0 4px", fontFamily: "var(--font-mono)", fontSize: "9px", cursor: "pointer" }}>?</button>
      {drawerOpen && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, marginTop: "4px", padding: "var(--s-2)", border: "var(--border-hair)", background: "var(--bg-2)", zIndex: 10, fontFamily: "var(--font-serif)", fontSize: "11px", color: "var(--fg-dim)" }}>
          <GateExplainer gate={gate} />
          {gate === "coherence_gate" && (
            <div style={{ marginTop: "var(--s-2)", display: "flex", gap: "var(--s-1)" }}>
              <button onClick={() => openInMode("cosine", "stage:difference")} style={{ background: "transparent", border: "var(--border-hair)", color: "var(--accent)", padding: "1px 4px", fontFamily: "var(--font-mono)", fontSize: "9px", cursor: "pointer" }}>COSINE §3</button>
              <button onClick={() => openInMode("compare", "baseline")} style={{ background: "transparent", border: "var(--border-hair)", color: "var(--accent)", padding: "1px 4px", fontFamily: "var(--font-mono)", fontSize: "9px", cursor: "pointer" }}>COMPARE</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function KeyDetailLine({ gate, grr }: { gate: GateKey; grr: GateRunResult }) {
  if (gate === "coherence_gate") {
    const cr = grr.csReq;
    return <>CS_obs {cr.csObserved >= 0 ? "+" : ""}{cr.csObserved.toFixed(2)} vs CSreq {cr.csReq >= 0 ? "+" : ""}{cr.csReq.toFixed(2)} (margin {cr.margin >= 0 ? "+" : ""}{cr.margin.toFixed(2)})</>;
  }
  if (gate === "confidence_gate") return <>CI width {grr.ciWidth.toFixed(2)} (warn 0.14, max 0.20)</>;
  if (gate === "anti_gaming_gate") {
    const score = (grr.perGate[2].detail as { score?: number }).score ?? 0;
    return <>score {score.toFixed(2)} (warn 0.35, fail 0.60)</>;
  }
  if (gate === "compliance_gate") {
    const status = (grr.perGate[1].detail as { status?: string }).status ?? "";
    return <>status: {status}</>;
  }
  if (gate === "portfolio_gate") {
    const d = grr.perGate[3].detail as { S?: number; domain_exposure?: number; headroom?: number };
    return <>S=${d.S?.toLocaleString()} | exp {d.domain_exposure?.toFixed(2)} | headroom {d.headroom?.toFixed(2)}</>;
  }
  // quality
  const d = grr.perGate[0].detail as { score?: number };
  return <>score {d.score?.toFixed(2) ?? ""}</>;
}

function GateExplainer({ gate }: { gate: GateKey }) {
  switch (gate) {
    case "quality_gate":
      return <>Hard quality floor over the transcript (CE4 §4.1): founder words ≥ 400, turns ≥ 20, mean confidence ≥ 0.70, low-confidence ratio ≤ 0.15, topic coverage ≥ 0.60.</>;
    case "compliance_gate":
      return <>Three-state compliance check (CE4 §4.2): clear → pass; review_required → manual_review; blocked → fail.</>;
    case "anti_gaming_gate":
      return <>Anti-gaming meter (CE4 §4.3): &lt; 0.35 pass; 0.35–0.60 manual_review; ≥ 0.60 fail.</>;
    case "portfolio_gate":
      return <>Portfolio conjunction (CE4 §4.4): check ≤ S_max ($500k); projected domain exposure ≤ 0.30 of NAV; post-request headroom ≥ 0.08.</>;
    case "coherence_gate":
      return <>Coherence threshold (CE4 §4.5): pass if CS_observed ≥ CSreq, where CSreq = CSd0 + αd · log_2(S/Sdmin) + R(S, Π) and CS_observed is the lower bound of the 95% CI.</>;
    case "confidence_gate":
      return <>CI width (CE4 §4.6): pass if width &lt; 0.20; widths &gt; 0.14 fall to manual_review.</>;
  }
}

function CSReqDecomp({ fixture, grr }: { fixture: ReturnType<typeof findInput>; grr: GateRunResult }) {
  const params = DOMAIN_PARAMS[fixture.domain_primary];
  const log2 = Math.log2(fixture.requested_check_usd / params.Sdmin);
  const cr = grr.csReq;
  return (
    <div style={{ padding: "var(--s-3)", border: "var(--border-hair)", background: "var(--bg-1)", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-dim)" }}>
      <div style={{ color: "var(--fg)", marginBottom: "var(--s-2)" }}>CSreq = CSd0 + αd · log<sub>2</sub>(S / Sdmin) + R(S, Π)</div>
      <div>CSd0 = {params.CSd0.toFixed(2)} (domain = {fixture.domain_primary})</div>
      <div>αd = {params.alpha.toFixed(4)}</div>
      <div>log<sub>2</sub>({fixture.requested_check_usd.toLocaleString()} / {params.Sdmin.toLocaleString()}) = {log2.toFixed(3)}</div>
      <div>αd · log<sub>2</sub>(...) = +{cr.logScaleTerm.toFixed(4)}</div>
      <div>R = +{cr.rTotal.toFixed(4)} (see ledger)</div>
      <div style={{ borderTop: "var(--border-hair)", marginTop: "4px", paddingTop: "4px" }}>CSreq = {cr.csReq >= 0 ? "+" : ""}{cr.csReq.toFixed(4)}</div>
      <div>CS_observed = {cr.csObserved >= 0 ? "+" : ""}{cr.csObserved.toFixed(4)}</div>
      <div style={{ color: cr.margin >= 0 ? "var(--ok)" : "var(--danger)" }}>margin (obs−req) = {cr.margin >= 0 ? "+" : ""}{cr.margin.toFixed(4)}</div>
      <div style={{ fontFamily: "var(--font-serif)", color: "var(--fg-mute)", fontSize: "10px", fontStyle: "italic", marginTop: "var(--s-2)" }}>
        Conservative enforcement: CS_observed = CS_ci95.lower.
      </div>
      <div style={{ fontFamily: "var(--font-serif)", color: "var(--fg-dim)", fontSize: "10px", marginTop: "var(--s-1)" }}>
        A 4× larger check requires αd · log<sub>2</sub>(4) = 2αd extra coherence superiority. A 16× check requires one full additional unit. Source: CE4 §3.1.
      </div>
    </div>
  );
}

function RTermLedger({ grr }: { grr: GateRunResult }) {
  const rows: Array<{ key: keyof GateRunResult["csReq"]["rBreakdown"]; label: string; basis: string }> = [
    { key: "r_utilization", label: "r_utilization", basis: "+0.01 at 0.88/0.93/0.97" },
    { key: "r_domain_count", label: "r_domain_count", basis: "+0.015 at ≥ 25 passes in domain" },
    { key: "r_pipeline", label: "r_pipeline", basis: "+0.01 at ≥ 40 open in pipeline" },
    { key: "r_domain_usd", label: "r_domain_usd", basis: "+0.005 at 0.28 / 0.36 of capacity" },
    { key: "r_liquidity", label: "r_liquidity", basis: "+0.005 when post-headroom < 0.08 / < 0.05" },
    { key: "r_drawdown", label: "r_drawdown", basis: "+0.01 at drawdown ≥ 0.12 / 0.22" },
    { key: "r_regime", label: "r_regime", basis: "0 normal / 0.010 defensive / 0.015 stress" },
  ];
  const rb = grr.csReq.rBreakdown;
  return (
    <div style={{ padding: "var(--s-3)", border: "var(--border-hair)", background: "var(--bg-1)", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-dim)" }}>
      <div style={{ color: "var(--fg)", marginBottom: "var(--s-2)" }}>R TERMS</div>
      {rows.map((r) => {
        const v = rb[r.key];
        return (
          <div key={r.key} style={{ display: "grid", gridTemplateColumns: "1fr 60px", gap: "8px", padding: "2px 0", color: v > 0 ? "var(--accent)" : "var(--fg-mute)" }}>
            <span>{r.label}<br /><span style={{ fontSize: "9px", color: "var(--fg-mute)" }}>{r.basis}</span></span>
            <span style={{ textAlign: "right" }}>+{v.toFixed(4)}</span>
          </div>
        );
      })}
      <div style={{ borderTop: "var(--border-hair)", marginTop: "var(--s-1)", paddingTop: "4px" }}>R (clamped [0, 0.35]) = +{grr.csReq.rTotal.toFixed(4)}</div>
      <div style={{ fontFamily: "var(--font-serif)", color: "var(--fg-mute)", fontSize: "10px", fontStyle: "italic", marginTop: "var(--s-2)" }}>
        R clamped to [0, 0.35] per CE4 §3.2.
      </div>
    </div>
  );
}

function DecisionStub({ grr, appId, openInMode }: { grr: GateRunResult; appId: string; openInMode: (m: "audit", r: string) => void }) {
  const v = grr.overall === "pending" ? "pass" : grr.overall;
  const color = v === "pass" ? "var(--ok)" : v === "fail" ? "var(--danger)" : "var(--accent)";
  return (
    <div style={{ marginTop: "var(--s-3)" }}>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: "11px", color: "var(--fg-dim)", fontStyle: "italic", marginBottom: "var(--s-2)" }}>
        A passed application produces an escalation packet; a human partner reads and decides whether to meet. The policy never invests.
      </div>
      <button onClick={() => openInMode("audit", `artifact:${appId}`)} style={{ padding: "var(--s-2) var(--s-3)", background: "var(--bg-1)", border: `1px solid ${color}`, fontFamily: "var(--font-mono)", fontSize: "11px", color, cursor: "pointer", display: "flex", alignItems: "baseline", gap: "var(--s-2)" }}>
        <span>{v.toUpperCase()}</span>
        <span style={{ color: "var(--fg-dim)" }}>artifact_hash: {grr.artifactHashStub}…</span>
        <span style={{ color: "var(--fg-mute)", fontSize: "9px" }}>→ AUDIT</span>
      </button>
    </div>
  );
}
