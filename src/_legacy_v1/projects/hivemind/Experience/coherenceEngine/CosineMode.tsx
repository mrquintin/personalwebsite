"use client";
import { useEffect } from "react";
import type { ExperienceContext } from "@/lib/experience-config";
import { useCe, type ParadoxStage } from "@/stores/coherenceEngineExperience";
import { NLI_PAIRS, PARADOX_AGGREGATES, DIM_WEIGHTS_CONTRADICTION, DIM_WEIGHTS_ENTAILMENT, findPair } from "@/lib/coherenceEngine/cosineData";

const STAGES: Array<{ id: ParadoxStage; label: string; n: number }> = [
  { id: "naive", label: "NAIVE", n: 1 },
  { id: "empirical", label: "EMPIRICAL", n: 2 },
  { id: "difference", label: "DIFFERENCE", n: 3 },
  { id: "reflection", label: "REFLECTION", n: 4 },
];

export default function CosineMode({ ctx, regime }: { ctx: ExperienceContext; regime: "narrow" | "standard" | "wide" }) {
  const stage = useCe((s) => s.cosine.stage);
  const pairId = useCe((s) => s.cosine.activePairId);
  const alpha = useCe((s) => s.cosine.reflectionAlpha);
  const ran = useCe((s) => s.cosine.reflectionRun);
  const showEnt = useCe((s) => s.cosine.showEntailmentDims);
  const setStage = useCe((s) => s.setStage);
  const setPair = useCe((s) => s.setActivePair);
  const setAlpha = useCe((s) => s.setReflectionAlpha);
  const triggerRun = useCe((s) => s.triggerReflectionRun);
  const toggleEnt = useCe((s) => s.toggleEntailmentDims);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "1") setStage("naive");
      else if (e.key === "2") setStage("empirical");
      else if (e.key === "3") setStage("difference");
      else if (e.key === "4") setStage("reflection");
      else if (e.key === "ArrowRight") {
        const i = STAGES.findIndex((s) => s.id === stage);
        if (i < STAGES.length - 1) setStage(STAGES[i + 1].id);
      } else if (e.key === "ArrowLeft") {
        const i = STAGES.findIndex((s) => s.id === stage);
        if (i > 0) setStage(STAGES[i - 1].id);
      } else if (stage === "reflection") {
        if (e.key === "a") setAlpha(2);
        else if (e.key === "b") setAlpha(4);
        else if (e.key === "c") setAlpha(6);
        else if (e.key === "d") setAlpha(8);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage, setStage, setAlpha]);

  return (
    <div role="tabpanel" aria-label="Cosine Paradox" style={{ padding: "var(--s-3)", overflow: "auto" }}>
      <StageStrip current={stage} onSelect={(s) => { setStage(s); ctx.announce(`Stage ${STAGES.findIndex((x) => x.id === s) + 1} of 4.`); }} />

      {stage === "naive" && <NaivePanel />}
      {stage === "empirical" && <EmpiricalPanel pairId={pairId} setPair={(id) => { setPair(id); ctx.announce(`Pair ${id} selected.`); }} />}
      {stage === "difference" && <DifferencePanel pairId={pairId} setPair={(id) => { setPair(id); ctx.announce(`Pair ${id} selected.`); }} showEnt={showEnt} toggleEnt={toggleEnt} regime={regime} />}
      {stage === "reflection" && <ReflectionPanel pairId={pairId} alpha={alpha} ran={ran} setPair={setPair} setAlpha={setAlpha} run={() => { triggerRun(); ctx.announce("Reflection complete."); }} />}
    </div>
  );
}

function StageStrip({ current, onSelect }: { current: ParadoxStage; onSelect: (s: ParadoxStage) => void }) {
  return (
    <nav role="tablist" aria-label="paradox stages" style={{ display: "flex", gap: "var(--s-2)", marginBottom: "var(--s-3)", flexWrap: "wrap" }}>
      {STAGES.map((s) => {
        const active = s.id === current;
        return (
          <button key={s.id} role="tab" aria-selected={active} onClick={() => onSelect(s.id)}
            style={{
              padding: "6px 10px", fontFamily: "var(--font-mono)", fontSize: "11px",
              background: active ? "var(--bg-2)" : "transparent", color: active ? "var(--fg)" : "var(--fg-dim)",
              border: active ? "1px solid var(--accent)" : "var(--border-hair)", cursor: "pointer",
            }}>
            <span style={{ color: "var(--accent)" }}>{s.n}</span> {s.label}
          </button>
        );
      })}
    </nav>
  );
}

function NaivePanel() {
  return (
    <div style={{ maxWidth: "640px" }}>
      <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-mute)", letterSpacing: "0.08em", margin: "0 0 var(--s-3) 0" }}>STAGE 1 OF 4 — THE NATURAL HYPOTHESIS</h3>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "14px", color: "var(--fg-dim)", lineHeight: 1.6 }}>
        A natural hypothesis when first confronting contradiction detection with sentence embeddings: contradictory sentences point in opposite directions in embedding space, so they should have low cosine similarity. If that held, a detector would be nearly trivial — compute pairwise cosine within a text, flag the low-similarity pairs.
      </p>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "14px", color: "var(--fg-dim)", lineHeight: 1.6 }}>
        The hypothesis is wrong. The next stage shows how wrong, and by how much.
      </p>
      <div style={{ marginTop: "var(--s-4)", padding: "var(--s-3)", border: "var(--border-hair)", background: "var(--bg-1)", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-dim)" }}>
        Conjecture 1 (Naïve opposition hypothesis).<br />
        If A and B are contradictory, then cos(e<sub>A</sub>, e<sub>B</sub>) &lt; cos(e<sub>A</sub>, e<sub>B&apos;</sub>) for B&apos; drawn from entailment and neutral pairs. (CE3 §1)
      </div>
    </div>
  );
}

function EmpiricalPanel({ pairId, setPair }: { pairId: string; setPair: (id: string) => void }) {
  const m = PARADOX_AGGREGATES.means.cosine;
  const pair = findPair(pairId);
  return (
    <div>
      <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-mute)", letterSpacing: "0.08em", margin: "0 0 var(--s-3) 0" }}>STAGE 2 OF 4 — THE EMPIRICAL REFUTATION</h3>
      <BellChart means={m} />
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "13px", color: "var(--fg-dim)", maxWidth: "640px", marginTop: "var(--s-3)" }}>
        Contradictions and entailments are statistically indistinguishable by cosine similarity at p = {PARADOX_AGGREGATES.pValue} [CE3 §2]. The cosine axis conflates topic with stance.
      </p>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)" }}>Source: CE3 §2, Finding 1.</div>
      <PairPicker pairId={pairId} setPair={setPair} />
      <div style={{ marginTop: "var(--s-2)", padding: "var(--s-2)", border: "var(--border-hair)", background: "var(--bg-1)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
        cos(e<sub>A</sub>, e<sub>B</sub>) = <span style={{ color: pair.label === "contradiction" ? "var(--danger)" : pair.label === "entailment" ? "var(--ok)" : "var(--fg-dim)" }}>{pair.cosAB.toFixed(3)}</span> &nbsp; label: {pair.label.toUpperCase()}
      </div>
    </div>
  );
}

function BellChart({ means }: { means: { contradiction: number; entailment: number; neutral: number } }) {
  // simple SVG with three bell-shape paths centered at the means
  const W = 560, H = 130;
  const xMin = -0.2, xMax = 1.0;
  function xToPx(x: number) { return ((x - xMin) / (xMax - xMin)) * W; }
  function bell(mu: number, color: string, label: string) {
    const sigma = 0.08;
    const pts: string[] = [];
    for (let i = 0; i <= 80; i++) {
      const x = xMin + (i / 80) * (xMax - xMin);
      const y = Math.exp(-Math.pow((x - mu) / sigma, 2) / 2);
      pts.push(`${xToPx(x).toFixed(1)},${(H - y * 90 - 20).toFixed(1)}`);
    }
    return (
      <g key={label}>
        <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.2" />
        <text x={xToPx(mu)} y={20} fontSize="9" fill={color} fontFamily="var(--font-mono)" textAnchor="middle">{label} μ={mu}</text>
      </g>
    );
  }
  return (
    <svg width={W} height={H} role="img" aria-label="Cosine distribution overlap" style={{ background: "var(--bg-1)", border: "var(--border-hair)", maxWidth: "100%" }}>
      <line x1={xToPx(0)} y1={H - 18} x2={xToPx(1)} y2={H - 18} stroke="var(--rule)" />
      {[-0.2, 0, 0.2, 0.4, 0.6, 0.8, 1.0].map((t) => (
        <g key={t}>
          <line x1={xToPx(t)} y1={H - 18} x2={xToPx(t)} y2={H - 14} stroke="var(--rule)" />
          <text x={xToPx(t)} y={H - 4} fontSize="9" fill="var(--fg-mute)" textAnchor="middle" fontFamily="var(--font-mono)">{t.toFixed(1)}</text>
        </g>
      ))}
      {bell(means.neutral, "var(--fg-dim)", "neutral")}
      {bell(means.contradiction, "var(--danger)", "contradict")}
      {bell(means.entailment, "var(--ok)", "entail")}
    </svg>
  );
}

function PairPicker({ pairId, setPair }: { pairId: string; setPair: (id: string) => void }) {
  return (
    <div style={{ marginTop: "var(--s-3)" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)", marginBottom: "var(--s-1)" }}>PICK A PAIR</div>
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
        {NLI_PAIRS.map((p) => {
          const active = p.id === pairId;
          const color = p.label === "contradiction" ? "var(--danger)" : p.label === "entailment" ? "var(--ok)" : "var(--fg-dim)";
          return (
            <button key={p.id} onClick={() => setPair(p.id)}
              style={{ padding: "3px 6px", fontFamily: "var(--font-mono)", fontSize: "9px", border: active ? "1px solid var(--accent)" : "var(--border-hair)", background: active ? "var(--bg-2)" : "transparent", color, cursor: "pointer" }}>
              {p.id.replace("ce-pair-", "")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DifferencePanel({ pairId, setPair, showEnt, toggleEnt, regime }: { pairId: string; setPair: (id: string) => void; showEnt: boolean; toggleEnt: () => void; regime: string }) {
  const pair = findPair(pairId);
  const dims = showEnt ? DIM_WEIGHTS_ENTAILMENT : DIM_WEIGHTS_CONTRADICTION;
  const sample = regime === "narrow" ? 64 : regime === "standard" ? 128 : 256;
  return (
    <div>
      <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-mute)", letterSpacing: "0.08em", margin: "0 0 var(--s-3) 0" }}>STAGE 3 OF 4 — DIFFERENCE VECTORS &amp; CONTRADICTION AXIS</h3>
      <SparsityBars />
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "13px", color: "var(--fg-dim)", maxWidth: "640px", marginTop: "var(--s-3)" }}>
        Cosine looks at the embedding. Hoyer sparsity looks at the DIFFERENCE between the two embeddings. Where cosine cannot separate contradiction from entailment, the difference vector&apos;s sparsity can.
      </p>

      <div style={{ marginTop: "var(--s-4)", padding: "var(--s-3)", border: "var(--border-hair)", background: "var(--bg-1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--s-2)" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg)" }}>DIMENSIONAL CONCENTRATION</span>
          <button onClick={toggleEnt} style={{ fontFamily: "var(--font-mono)", fontSize: "10px", padding: "2px 6px", background: "transparent", border: "var(--border-hair)", color: "var(--fg-dim)", cursor: "pointer" }}>
            show: {showEnt ? "entailment" : "contradiction"}
          </button>
        </div>
        <Lollipop arr={dims} sample={sample} highlight={!showEnt ? 42 : 0} />
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)", marginTop: "var(--s-2)" }}>
          42 of 768 dimensions ≈ 5.5% of embedding space carries the contradiction signal [CE3 §3].<br />
          F1 on top 20 PCs: {PARADOX_AGGREGATES.dimensionalConcentration.f1At20PCs.toFixed(2)}<br />
          F1 on top 50 PCs: {PARADOX_AGGREGATES.dimensionalConcentration.f1At50PCs.toFixed(2)}<br />
          Linear SVM on 2,308-dim feature vector: in-domain {PARADOX_AGGREGATES.linearSvm.inDomainF1.toFixed(3)}, general-domain {PARADOX_AGGREGATES.linearSvm.generalDomainF1.toFixed(3)}.
        </div>
      </div>

      <PairPicker pairId={pairId} setPair={setPair} />
      <div style={{ marginTop: "var(--s-2)", padding: "var(--s-2)", border: "var(--border-hair)", background: "var(--bg-1)", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-dim)" }}>
        d · ĉ = {pair.projectionOnCHat >= 0 ? "+" : ""}{pair.projectionOnCHat.toFixed(2)} (projection onto contradiction axis)<br />
        ‖d − (d · ĉ)ĉ‖ = {pair.perpMagnitude.toFixed(2)} (perpendicular component)<br />
        H(d) = {pair.differenceHoyer.toFixed(3)}
      </div>
    </div>
  );
}

function SparsityBars() {
  const h = PARADOX_AGGREGATES.means.hoyer;
  function row(label: string, val: number, color: string) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 60px", gap: "8px", alignItems: "center", marginBottom: "4px", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
        <span style={{ color: "var(--fg-dim)" }}>{label}</span>
        <div aria-hidden="true" style={{ height: "10px", background: "var(--bg-3)" }}>
          <div style={{ width: `${val * 100}%`, height: "100%", background: color }} />
        </div>
        <span style={{ color }}>H = {val.toFixed(3)}</span>
      </div>
    );
  }
  return (
    <div style={{ padding: "var(--s-3)", border: "var(--border-hair)", background: "var(--bg-1)" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg)", marginBottom: "var(--s-2)" }}>HOYER SPARSITY OF DIFFERENCE VECTORS</div>
      {row("contradiction", h.contradiction, "var(--danger)")}
      {row("entailment", h.entailment, "var(--ok)")}
      {row("neutral", h.neutral, "var(--fg-dim)")}
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--fg-mute)", marginTop: "4px" }}>H(x) = (√n − ‖x‖<sub>1</sub>/‖x‖<sub>2</sub>) / (√n − 1)</div>
    </div>
  );
}

function Lollipop({ arr, sample, highlight }: { arr: number[]; sample: number; highlight: number }) {
  const data = arr.slice(0, sample);
  const W = 560, H = 100;
  const max = Math.max(...data);
  return (
    <svg width={W} height={H} role="img" aria-label="Dimensional concentration" style={{ background: "var(--bg-0)", maxWidth: "100%" }}>
      {data.map((v, i) => {
        const x = (i / data.length) * W;
        const y = H - (v / max) * (H - 10);
        const isTop = i < highlight;
        return <line key={i} x1={x} y1={H} x2={x} y2={y} stroke={isTop ? "var(--accent)" : "var(--fg-mute)"} strokeWidth="1" />;
      })}
      {highlight > 0 && (
        <line x1={(highlight / data.length) * W} y1={0} x2={(highlight / data.length) * W} y2={H} stroke="var(--accent-dim)" strokeDasharray="2,2" />
      )}
    </svg>
  );
}

function ReflectionPanel({ pairId, alpha, ran, setPair, setAlpha, run }: { pairId: string; alpha: number; ran: boolean; setPair: (id: string) => void; setAlpha: (n: number) => void; run: () => void }) {
  const contradictionPairs = NLI_PAIRS.filter((p) => p.label === "contradiction");
  const pair = contradictionPairs.find((p) => p.id === pairId) ?? contradictionPairs[0];
  // ensure pairId is contradiction; otherwise reset on first render
  useEffect(() => {
    if (!contradictionPairs.find((p) => p.id === pairId)) setPair(contradictionPairs[0].id);
  }, [pairId, setPair, contradictionPairs]);

  const refl = pair.nearestReflection;
  const aKey = alpha === 2 ? "alpha2" : alpha === 4 ? "alpha4" : alpha === 8 ? "alpha8" : alpha === 6 ? "alpha4" : "alpha2";
  const out = refl ? refl[aKey as "alpha2" | "alpha4" | "alpha8"] : null;

  return (
    <div>
      <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-mute)", letterSpacing: "0.08em", margin: "0 0 var(--s-3) 0" }}>STAGE 4 OF 4 — HOUSEHOLDER REFLECTION</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--s-3)" }}>
        <div style={{ padding: "var(--s-3)", border: "var(--border-hair)", background: "var(--bg-1)" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)", marginBottom: "4px" }}>SOURCE</div>
          <div style={{ fontFamily: "var(--font-serif)", color: "var(--fg)" }}>{pair.a}</div>
        </div>
        <div style={{ padding: "var(--s-3)", border: "var(--border-hair)", background: "var(--bg-1)" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)", marginBottom: "4px" }}>NEAREST AFTER REFLECTION (α = {alpha})</div>
          {ran && out ? (
            <>
              <div style={{ fontFamily: "var(--font-serif)", color: "var(--fg)" }}>{out.text}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-dim)", marginTop: "var(--s-2)" }}>
                cos(Refl<sub>ĉ</sub>(e<sub>A</sub>), e<sub>B*</sub>) = {out.cosToTruth.toFixed(2)}<br />
                is-true-contradiction: {out.isTrueContradiction ? "YES" : "NO"}
              </div>
            </>
          ) : (
            <div style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)" }}>(press RUN to compute the reflection)</div>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: "var(--s-2)", marginTop: "var(--s-3)", alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-mute)" }}>α =</span>
        {[1, 2, 4, 6, 8].map((a) => (
          <button key={a} onClick={() => setAlpha(a)} style={{ padding: "3px 8px", fontFamily: "var(--font-mono)", fontSize: "11px", background: a === alpha ? "var(--bg-2)" : "transparent", color: a === alpha ? "var(--fg)" : "var(--fg-dim)", border: a === alpha ? "1px solid var(--accent)" : "var(--border-hair)", cursor: "pointer" }}>
            {a}
          </button>
        ))}
        <button onClick={run} style={{ padding: "4px 12px", fontFamily: "var(--font-mono)", fontSize: "11px", background: "var(--accent)", color: "var(--bg-0)", border: "none", cursor: "pointer", marginLeft: "var(--s-2)" }}>RUN</button>
      </div>
      <div style={{ marginTop: "var(--s-3)", display: "flex", gap: "var(--s-2)", flexWrap: "wrap" }}>
        {contradictionPairs.map((p) => {
          const active = p.id === pair.id;
          return (
            <button key={p.id} onClick={() => setPair(p.id)} style={{ padding: "3px 6px", fontFamily: "var(--font-mono)", fontSize: "9px", border: active ? "1px solid var(--accent)" : "var(--border-hair)", background: active ? "var(--bg-2)" : "transparent", color: "var(--danger)", cursor: "pointer" }}>{p.id.replace("ce-pair-", "")}</button>
          );
        })}
      </div>
      <div style={{ marginTop: "var(--s-3)", padding: "var(--s-2)", border: "var(--border-hair)", background: "var(--bg-1)", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-dim)" }}>
        Refl<sub>ĉ</sub>(v) = v − 2(v · ĉ)ĉ &nbsp; (CE3 Definition 2)<br />
        α = 2 → {(PARADOX_AGGREGATES.reflection.alpha2RecoveryRate * 100).toFixed(1)}% recovery on test set<br />
        α = 8 → up to {(PARADOX_AGGREGATES.reflection.alpha8RecoveryCeiling * 100).toFixed(0)}% ceiling
      </div>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "13px", color: "var(--fg-dim)", maxWidth: "640px", marginTop: "var(--s-3)" }}>
        Reflection across the contradiction direction converts a sentence into (approximately) its logical opposite, using no generative model. The retrieval stage replaces the generated vector with the nearest actual sentence in the corpus.
      </p>
    </div>
  );
}
