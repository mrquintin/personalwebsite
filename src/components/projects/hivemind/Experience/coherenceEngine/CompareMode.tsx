"use client";
import { useEffect, useState } from "react";
import type { ExperienceContext } from "@/lib/experience-config";
import { useCe, type DomainKey } from "@/stores/coherenceEngineExperience";
import { PITCHES, findPitch } from "@/lib/coherenceEngine/pitches";
import { INCUMBENT_COH, SOCIETAL_BASELINE } from "@/lib/coherenceEngine/incumbents";

export default function CompareMode({ ctx, regime }: { ctx: ExperienceContext; regime: "narrow" | "standard" | "wide" }) {
  const pitchId = useCe((s) => s.compare.activePitchId);
  const bands = useCe((s) => s.compare.showIllustrativeBands);
  const focus = useCe((s) => s.compare.focusDomain);
  const setPitch = useCe((s) => s.setActivePitch);
  const toggleBands = useCe((s) => s.toggleIllustrativeBands);
  const setFocus = useCe((s) => s.setFocusDomain);
  const openInMode = useCe((s) => s.openInMode);

  const pitch = findPitch(pitchId);
  const [showFull, setShowFull] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "1") setPitch(PITCHES[0].id);
      else if (e.key === "2") setPitch(PITCHES[1].id);
      else if (e.key === "3") setPitch(PITCHES[2].id);
      else if (e.key === "b") toggleBands();
      else if (e.key === "Escape") setFocus(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setPitch, toggleBands, setFocus]);

  const isWide = regime === "wide";
  return (
    <div role="tabpanel" aria-label="Domain-Relative Comparator" style={{ padding: "var(--s-3)", display: "grid", gridTemplateColumns: isWide ? "1fr 1fr" : "1fr", gap: "var(--s-3)", overflow: "auto" }}>
      <section>
        <div style={{ display: "flex", gap: "var(--s-2)", marginBottom: "var(--s-3)", flexWrap: "wrap" }}>
          {PITCHES.map((p, i) => {
            const active = p.id === pitch.id;
            return (
              <button key={p.id} aria-current={active ? "true" : undefined} onClick={() => { setPitch(p.id); ctx.announce(`Pitch: ${p.label}. Domain: ${p.primaryDomain}.`); }}
                style={{ padding: "8px 10px", fontFamily: "var(--font-mono)", fontSize: "11px", background: active ? "var(--bg-2)" : "transparent", color: active ? "var(--fg)" : "var(--fg-dim)", border: active ? "1px solid var(--accent)" : "var(--border-hair)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <span><span style={{ color: "var(--accent)" }}>{i + 1}</span> {p.label}</span>
                <span style={{ fontSize: "9px", color: "var(--fg-mute)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "2px" }}>{p.primaryDomain}</span>
              </button>
            );
          })}
        </div>
        <div style={{ marginBottom: "var(--s-2)", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)" }}>DOMAIN MIX:&nbsp;
          {pitch.domainMix.map((m) => {
            const active = focus === m.domain;
            return (
              <button key={m.domain} onClick={() => setFocus(active ? null : m.domain)}
                style={{ marginRight: "4px", padding: "2px 6px", fontFamily: "var(--font-mono)", fontSize: "10px", background: active ? "var(--bg-2)" : "transparent", color: active ? "var(--accent)" : "var(--fg-dim)", border: active ? "1px solid var(--accent)" : "var(--border-hair)", cursor: "pointer" }}>
                {m.domain} {m.weight.toFixed(2)}
              </button>
            );
          })}
        </div>
        <div style={{ padding: "var(--s-3)", border: "var(--border-hair)", background: "var(--bg-1)", fontFamily: "var(--font-serif)", fontSize: "13px", color: "var(--fg-dim)", lineHeight: 1.6 }}>
          {showFull ? pitch.text : pitch.text.slice(0, 360) + (pitch.text.length > 360 ? "…" : "")}
          <div style={{ marginTop: "var(--s-2)" }}>
            <button onClick={() => setShowFull(!showFull)} style={{ background: "transparent", border: "var(--border-hair)", color: "var(--fg-dim)", padding: "2px 6px", fontFamily: "var(--font-mono)", fontSize: "10px", cursor: "pointer" }}>
              {showFull ? "show less" : "show full pitch"}
            </button>
          </div>
        </div>
      </section>

      <section style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
        <IncumbentSparkline pitchDomains={pitch.domainMix.map((m) => m.domain)} pitchCoh={pitch.cohAbsolute} bands={bands} toggleBands={toggleBands} />
        <CSReadout pitchId={pitch.id} focus={focus} openInMode={openInMode} />
        <CIBar pitch={pitch} openInMode={openInMode} />
      </section>
    </div>
  );
}

function IncumbentSparkline({ pitchDomains, pitchCoh, bands, toggleBands }: { pitchDomains: DomainKey[]; pitchCoh: number; bands: boolean; toggleBands: () => void }) {
  return (
    <div style={{ padding: "var(--s-3)", border: "var(--border-hair)", background: "var(--bg-1)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--s-2)" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg)" }}>INCUMBENT POSITION</span>
        <button onClick={toggleBands} style={{ fontFamily: "var(--font-mono)", fontSize: "10px", padding: "2px 6px", background: "transparent", border: "var(--border-hair)", color: "var(--fg-dim)", cursor: "pointer" }}>
          bands: {bands ? "on" : "off"}
        </button>
      </div>
      {pitchDomains.map((d) => (
        <Lane key={d} domain={d} pitchCoh={pitchCoh} bands={bands} />
      ))}
      <div style={{ fontFamily: "var(--font-serif)", fontSize: "11px", color: "var(--fg-dim)", marginTop: "var(--s-3)", borderTop: "var(--border-hair)", paddingTop: "var(--s-2)" }}>
        Society&apos;s own curated premise set: Coh ≈ {SOCIETAL_BASELINE.coh} across {SOCIETAL_BASELINE.premiseCount} premises, {SOCIETAL_BASELINE.domainCount} domains, {SOCIETAL_BASELINE.documentedTensions} documented cross-domain tensions [CE1 §5.2].
      </div>
      {bands && (
        <div style={{ marginTop: "var(--s-2)", fontFamily: "var(--font-serif)", fontSize: "10px", color: "var(--fg-mute)", fontStyle: "italic" }}>
          Illustrative bands. The fund&apos;s policy does not use an absolute-coherence threshold; it uses a domain-relative superiority threshold (see GATES tab).
        </div>
      )}
    </div>
  );
}

function Lane({ domain, pitchCoh, bands }: { domain: DomainKey; pitchCoh: number; bands: boolean }) {
  const W = 320, H = 22;
  const inc = INCUMBENT_COH[domain];
  function px(x: number) { return x * W; }
  return (
    <div style={{ marginBottom: "var(--s-3)" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)", marginBottom: "2px" }}>{domain}</div>
      <svg width={W} height={H} role="img" aria-label={`${domain} lane`} style={{ maxWidth: "100%" }}>
        {bands && (
          <>
            <rect x={0} y={0} width={px(0.25)} height={H} fill="var(--bg-3)" opacity={0.6} />
            <rect x={px(0.25)} y={0} width={px(0.25)} height={H} fill="var(--danger)" opacity={0.15} />
            <rect x={px(0.5)} y={0} width={px(0.25)} height={H} fill="var(--accent)" opacity={0.15} />
            <rect x={px(0.75)} y={0} width={px(0.25)} height={H} fill="var(--ok)" opacity={0.15} />
          </>
        )}
        <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke="var(--rule)" />
        <line x1={px(SOCIETAL_BASELINE.coh)} y1={2} x2={px(SOCIETAL_BASELINE.coh)} y2={H - 2} stroke="var(--fg-dim)" strokeWidth={1} />
        <line x1={px(inc)} y1={0} x2={px(inc)} y2={H} stroke="var(--fg)" strokeWidth={2} />
        <line x1={px(pitchCoh)} y1={0} x2={px(pitchCoh)} y2={H} stroke="var(--accent)" strokeWidth={2} />
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--fg-mute)" }}>
        <span>society 0.321</span>
        <span>incumbent {inc.toFixed(2)}</span>
        <span style={{ color: "var(--accent)" }}>this pitch {pitchCoh.toFixed(2)}</span>
      </div>
    </div>
  );
}

function CSReadout({ pitchId, focus, openInMode }: { pitchId: string; focus: DomainKey | null; openInMode: (m: "cosine", refId: string) => void }) {
  const pitch = findPitch(pitchId);
  return (
    <div style={{ padding: "var(--s-3)", border: "var(--border-hair)", background: "var(--bg-1)" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-mute)", marginBottom: "var(--s-2)" }}>CS(Γ, d) = Coh(Γ) − Coh(Γ<sub>inc_d</sub>)</div>
      {pitch.domainMix.length === 1 || focus !== null ? (
        <SingleDomainCS pitch={pitch} domain={focus ?? pitch.domainMix[0].domain} openInMode={openInMode} />
      ) : (
        <MixedCS pitch={pitch} openInMode={openInMode} />
      )}
      <div style={{ fontFamily: "var(--font-serif)", fontSize: "11px", color: "var(--fg-dim)", marginTop: "var(--s-2)", lineHeight: 1.5 }}>
        This is the unweighted difference. The policy compares the lower bound of a 95% interval (see below) against a check-size-aware, portfolio-aware threshold.
      </div>
    </div>
  );
}

function SingleDomainCS({ pitch, domain, openInMode }: { pitch: ReturnType<typeof findPitch>; domain: DomainKey; openInMode: (m: "cosine", r: string) => void }) {
  const inc = pitch.incumbentPerDomain[domain] ?? 0;
  const cs = pitch.csPerDomain[domain] ?? 0;
  return (
    <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--fg-dim)" }}>
      <div>Coh(Γ) = {pitch.cohAbsolute.toFixed(3)}</div>
      <div>Coh(Γ<sub>inc_{domain}</sub>) = {inc.toFixed(3)} <button onClick={() => openInMode("cosine", "stage:difference")} style={{ marginLeft: "8px", background: "transparent", border: "var(--border-hair)", color: "var(--accent)", padding: "1px 4px", fontFamily: "var(--font-mono)", fontSize: "10px", cursor: "pointer" }}>see COSINE §3</button></div>
      <div style={{ color: cs >= 0 ? "var(--ok)" : "var(--danger)" }}>CS (point) = {cs >= 0 ? "+" : ""}{cs.toFixed(3)}</div>
    </div>
  );
}

function MixedCS({ pitch, openInMode }: { pitch: ReturnType<typeof findPitch>; openInMode: (m: "cosine", r: string) => void }) {
  return (
    <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--fg-dim)" }}>
      <div>Coh(Γ) = {pitch.cohAbsolute.toFixed(3)} <button onClick={() => openInMode("cosine", "stage:difference")} style={{ marginLeft: "8px", background: "transparent", border: "var(--border-hair)", color: "var(--accent)", padding: "1px 4px", fontFamily: "var(--font-mono)", fontSize: "10px", cursor: "pointer" }}>see COSINE §3</button></div>
      <div style={{ marginTop: "4px" }}>CS (mix) = Σ w<sub>d</sub> · CS<sub>d</sub> = <span style={{ color: pitch.csPoint >= 0 ? "var(--ok)" : "var(--danger)" }}>{pitch.csPoint >= 0 ? "+" : ""}{pitch.csPoint.toFixed(3)}</span></div>
      <ul style={{ margin: "var(--s-2) 0 0 var(--s-3)", padding: 0, listStyle: "none" }}>
        {pitch.domainMix.map((m) => (
          <li key={m.domain} style={{ fontSize: "11px" }}>{m.domain} w = {m.weight.toFixed(2)}, CS<sub>d</sub> = {(pitch.csPerDomain[m.domain] ?? 0).toFixed(3)}</li>
        ))}
      </ul>
    </div>
  );
}

function CIBar({ pitch, openInMode }: { pitch: ReturnType<typeof findPitch>; openInMode: (m: "gates", r: string) => void }) {
  const W = 360;
  const lo = pitch.csCI95.lower, hi = pitch.csCI95.upper, point = pitch.csPoint;
  const min = -0.1, max = 0.5;
  function px(x: number) { return ((x - min) / (max - min)) * W; }
  return (
    <div style={{ padding: "var(--s-3)", border: "var(--border-hair)", background: "var(--bg-1)" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg)", marginBottom: "var(--s-2)" }}>95% CREDIBLE INTERVAL FOR CS</div>
      <svg width={W} height={42} role="img" aria-label="CS interval" style={{ maxWidth: "100%" }}>
        <line x1={0} y1={28} x2={W} y2={28} stroke="var(--rule)" />
        <line x1={px(lo)} y1={20} x2={px(hi)} y2={20} stroke="var(--fg-dim)" strokeWidth={2} />
        <circle cx={px(lo)} cy={20} r={4} fill="var(--accent)" />
        <circle cx={px(point)} cy={20} r={3} fill="var(--fg-dim)" />
        <circle cx={px(hi)} cy={20} r={4} fill="none" stroke="var(--fg-dim)" />
        <text x={px(lo)} y={12} fontSize="9" fill="var(--accent)" fontFamily="var(--font-mono)" textAnchor="middle">CS_obs</text>
        <text x={0} y={40} fontSize="9" fill="var(--fg-mute)" fontFamily="var(--font-mono)">{min.toFixed(1)}</text>
        <text x={W - 16} y={40} fontSize="9" fill="var(--fg-mute)" fontFamily="var(--font-mono)">{max.toFixed(1)}</text>
      </svg>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-dim)", marginTop: "var(--s-2)" }}>
        CS_observed (lower) = <span style={{ color: "var(--accent)" }}>{lo >= 0 ? "+" : ""}{lo.toFixed(3)}</span><br />
        CS point = {point >= 0 ? "+" : ""}{point.toFixed(3)}<br />
        CS upper = {hi >= 0 ? "+" : ""}{hi.toFixed(3)}<br />
        Interval width = {(hi - lo).toFixed(3)}<br />
        Uncertainty model: fund-cs-superiority-v1
      </div>
      <div style={{ fontFamily: "var(--font-serif)", fontSize: "11px", color: "var(--fg-dim)", marginTop: "var(--s-2)", lineHeight: 1.5 }}>
        The policy uses the LOWER BOUND of this interval, not the point estimate. A pitch at the edge of its own uncertainty fails by design, not by accident [CE2 §6, CE4 §3.3].
        <button onClick={() => openInMode("gates", "gate:coherence_gate")} style={{ marginLeft: "6px", background: "transparent", border: "var(--border-hair)", color: "var(--accent)", padding: "1px 4px", fontFamily: "var(--font-mono)", fontSize: "10px", cursor: "pointer" }}>GATES: coherence</button>
      </div>
    </div>
  );
}
