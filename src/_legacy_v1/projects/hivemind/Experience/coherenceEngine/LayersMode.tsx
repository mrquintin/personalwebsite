"use client";
import { useEffect } from "react";
import type { ExperienceContext } from "@/lib/experience-config";
import { useCe } from "@/stores/coherenceEngineExperience";
import { ARGUMENT_FIXTURES, AG_WEIGHTS, LAYER_INFO, findFixture, type AntiGamingKey } from "@/lib/coherenceEngine/arguments";

export default function LayersMode({ ctx, regime }: { ctx: ExperienceContext; regime: "narrow" | "standard" | "wide" }) {
  const fixId = useCe((s) => s.layers.activeFixtureId);
  const selLayer = useCe((s) => s.layers.selectedLayer);
  const agOn = useCe((s) => s.layers.antiGamingEnabled);
  const fusionOn = useCe((s) => s.layers.fusionEnabled);
  const drawerOpen = useCe((s) => s.layers.fusionDrawerOpen);
  const setFix = useCe((s) => s.setActiveFixture);
  const setSel = useCe((s) => s.setSelectedLayer);
  const tAG = useCe((s) => s.toggleAntiGaming);
  const tFus = useCe((s) => s.toggleFusion);
  const setDrawer = useCe((s) => s.setFusionDrawerOpen);

  const fixture = findFixture(fixId);

  // composite calculation given current toggles
  const ls = fixture.layerScores;
  const s3Effective = fusionOn ? ls.s3.score : fixture.fusion.s3BeforeFusion;
  const beforeAG = 0.30 * ls.s1.score + 0.20 * ls.s2.score + 0.20 * s3Effective + 0.15 * ls.s4.score + 0.15 * ls.s5.score;
  const composite = agOn ? beforeAG * fixture.antiGaming.score : beforeAG;

  // keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "1") { setFix("a-coherent"); ctx.announce("Fixture: coherent argument."); }
      else if (e.key === "2") { setFix("a-contradictory"); ctx.announce("Fixture: contradictory argument."); }
      else if (e.key === "3") { setFix("a-mixed"); ctx.announce("Fixture: mixed argument."); }
      else if (e.key === "f") { tFus(); }
      else if (e.key === "g") { tAG(); }
      else if (e.key === "Escape" && drawerOpen) { setDrawer(false); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setFix, tFus, tAG, drawerOpen, setDrawer, ctx]);

  const isWide = regime === "wide";
  const grid = isWide ? "30% 45% 25%" : "1fr";

  return (
    <div role="tabpanel" aria-label="Layer Scoring Lab" style={{ padding: "var(--s-3)", display: "grid", gridTemplateColumns: grid, gap: "var(--s-3)", overflow: "auto" }}>
      {/* ARGUMENT PANE */}
      <section aria-label="Argument fixture" style={{ borderRight: isWide ? "var(--border-hair)" : undefined, paddingRight: isWide ? "var(--s-3)" : 0 }}>
        <div style={{ display: "flex", gap: "var(--s-2)", marginBottom: "var(--s-3)", flexWrap: "wrap" }}>
          {ARGUMENT_FIXTURES.map((f, i) => {
            const active = f.id === fixId;
            return (
              <button key={f.id} onClick={() => { setFix(f.id); ctx.announce(`Fixture: ${f.label}.`); }}
                style={{
                  padding: "6px 10px", fontFamily: "var(--font-mono)", fontSize: "11px",
                  background: active ? "var(--bg-2)" : "transparent", color: active ? "var(--fg)" : "var(--fg-dim)",
                  border: active ? "1px solid var(--accent)" : "var(--border-hair)", cursor: "pointer",
                }}>
                <span style={{ color: "var(--accent)" }}>{i + 1}</span> {f.label}
              </button>
            );
          })}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)", marginBottom: "var(--s-2)" }}>{fixture.topic}</div>
        <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
          {fixture.propositions.map((p) => (
            <li key={p.id} style={{ display: "grid", gridTemplateColumns: "32px 70px 60px 1fr", gap: "8px", padding: "4px 0", fontSize: "12px", borderBottom: "var(--border-hair)" }}>
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent-dim)" }}>{p.id}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", textTransform: "uppercase", color: "var(--fg-mute)", letterSpacing: "0.08em" }}>{p.type}</span>
              <span aria-hidden="true" style={{ alignSelf: "center" }}>
                <span style={{ display: "inline-block", height: "4px", width: `${p.importance * 50}px`, background: "var(--accent-dim)" }} />
              </span>
              <span style={{ fontFamily: "var(--font-serif)", color: "var(--fg)" }}>{p.text}</span>
            </li>
          ))}
        </ol>
        <div style={{ marginTop: "var(--s-3)", fontSize: "10px", color: "var(--fg-mute)", fontFamily: "var(--font-mono)" }}>
          relations: {fixture.relations.length}
          <ul style={{ listStyle: "none", padding: 0, margin: "var(--s-1) 0 0 0" }}>
            {fixture.relations.map((r, i) => (
              <li key={i} style={{ color: r.relationType === "attacks" ? "var(--danger)" : r.relationType === "qualifies" ? "var(--fg-dim)" : "var(--fg-dim)" }}>
                {r.sourceId} → {r.targetId} [{r.relationType} {r.strength.toFixed(2)}]
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* LAYER BREAKDOWN */}
      <section aria-label="Layer breakdown" role="group" style={{ display: "flex", flexDirection: "column", gap: "var(--s-2)" }}>
        <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-mute)", letterSpacing: "0.08em", margin: 0 }}>FIVE LAYERS</h3>
        {LAYER_INFO.map((info) => {
          const lr = (ls as unknown as Record<string, { score: number; weight: number; warnings?: string[]; details: Record<string, unknown> }>)[info.key];
          const score = info.key === "s3" && fusionOn ? ls.s3.score : info.key === "s3" ? fixture.fusion.s3BeforeFusion : lr.score;
          const isSel = selLayer === info.n;
          return (
            <div key={info.key} role="button" tabIndex={0} onClick={() => setSel(isSel ? null : info.n as 1 | 2 | 3 | 4 | 5)}
              style={{ padding: "8px 10px", border: isSel ? "1px solid var(--accent)" : "var(--border-hair)", background: isSel ? "var(--bg-2)" : "var(--bg-1)", cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--fg)" }}>S{info.n} {info.name}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)" }}>w = {info.weight.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", gap: "var(--s-2)", alignItems: "center", marginTop: "4px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "16px", color: "var(--fg-hi)" }} aria-live="polite">{score.toFixed(2)}</span>
                <div aria-hidden="true" style={{ flex: 1, display: "flex", gap: "2px" }}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <span key={i} style={{ flex: 1, height: "6px", background: i < Math.round(score * 6) ? "var(--accent)" : "var(--bg-3)" }} />
                  ))}
                </div>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)", marginTop: "4px" }}>
                {info.key === "s1" && `${(ls.s1.details).pairsFlagged}/${(ls.s1.details).pairsChecked}  backend=${(ls.s1.details).backend}`}
                {info.key === "s2" && `|E_g|=${(ls.s2.details).groundedExtensionSize}/${(ls.s2.details).totalArguments}  cycles=${(ls.s2.details).cycleCount}  depth=${(ls.s2.details).maxSupportDepth}`}
                {info.key === "s3" && (
                  <>
                    {`c̄=${(ls.s3.details).meanCosine.toFixed(2)}  ρ=${(ls.s3.details).suspiciousFraction.toFixed(2)}  H̄=${(ls.s3.details).hoyerMean.toFixed(2)}`}
                    {fusionOn && fixture.fusion.trigger !== "none" && (
                      <button onClick={(e) => { e.stopPropagation(); setDrawer(true); }} style={{ marginLeft: "8px", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--accent)", background: "transparent", border: "var(--border-hair)", padding: "1px 4px", cursor: "pointer" }}>
                        fusion × {fixture.fusion.fusionCoefficient.toFixed(2)}
                      </button>
                    )}
                  </>
                )}
                {info.key === "s4" && `ratio=${(ls.s4.details).ratio.toFixed(2)}  L_joint=${(ls.s4.details).lJoint}  ΣL_i=${(ls.s4.details).lSum}`}
                {info.key === "s5" && `κ=${(ls.s5.details).connectivityKappa.toFixed(2)}  π_iso=${(ls.s5.details).isolationPenalty.toFixed(2)}  π_cyc=${(ls.s5.details).circularityPenalty.toFixed(2)}  β_d=${(ls.s5.details).depthBonus.toFixed(2)}`}
              </div>
              {lr.warnings && lr.warnings.map((w, i) => (
                <div key={i} style={{ marginTop: "4px", fontSize: "10px", color: "var(--accent-dim)", fontFamily: "var(--font-mono)" }}>! {w}</div>
              ))}
            </div>
          );
        })}
      </section>

      {/* COMPOSITE METER + ANTI-GAMING */}
      <section aria-label="Composite and anti-gaming" style={{ display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
        <div role="status" aria-live="polite" style={{ padding: "var(--s-3)", border: "var(--border-hair)", background: "var(--bg-1)" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-mute)", marginBottom: "4px" }}>
            Coh(Γ) = Σ w<sub>i</sub> · S<sub>i</sub>{agOn && " · a"}
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "28px", color: "var(--fg-hi)" }}>{composite.toFixed(3)}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)", marginTop: "4px" }}>
            before fusion: {fixture.compositeBeforeFusion.toFixed(3)}<br />
            before anti-gaming: {beforeAG.toFixed(3)}
          </div>
          {/* stacked bar */}
          <div aria-hidden="true" style={{ display: "flex", marginTop: "var(--s-2)", height: "8px", background: "var(--bg-3)" }}>
            {LAYER_INFO.map((info) => {
              const sc = info.key === "s3" && fusionOn ? ls.s3.score : info.key === "s3" ? fixture.fusion.s3BeforeFusion : (ls as unknown as Record<string, { score: number }>)[info.key].score;
              return <span key={info.key} style={{ width: `${sc * info.weight * 100}%`, background: "var(--accent)" }} title={`S${info.n} ${(sc * info.weight).toFixed(3)}`} />;
            })}
          </div>
          <div style={{ marginTop: "var(--s-3)", fontFamily: "var(--font-serif)", fontSize: "11px", color: "var(--fg-dim)", fontStyle: "italic" }}>
            This measures self-consistency, not truth. A coherent argument can be false.
          </div>
        </div>

        {/* anti-gaming */}
        <div style={{ padding: "var(--s-3)", border: "var(--border-hair)", background: "var(--bg-1)", opacity: agOn ? 1 : 0.4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--s-2)" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg)" }}>ANTI-GAMING</span>
            <button onClick={tAG} style={{ fontFamily: "var(--font-mono)", fontSize: "10px", padding: "2px 6px", background: "transparent", border: "var(--border-hair)", color: "var(--fg-dim)", cursor: "pointer" }}>
              {agOn ? "on" : "off"}
            </button>
          </div>
          {(Object.keys(AG_WEIGHTS) as AntiGamingKey[]).map((k) => {
            const sig = fixture.antiGaming.signals[k];
            const weighted = sig * AG_WEIGHTS[k];
            return (
              <div key={k} style={{ display: "grid", gridTemplateColumns: "1fr 60px 50px 60px", gap: "6px", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-dim)", marginBottom: "3px", alignItems: "center" }}>
                <span style={{ fontSize: "9px" }}>{k}</span>
                <div aria-hidden="true" style={{ height: "6px", background: "var(--bg-3)" }}>
                  <div style={{ width: `${weighted * 200}%`, maxWidth: "100%", height: "100%", background: "var(--accent-dim)" }} />
                </div>
                <span>{sig.toFixed(2)}</span>
                <span style={{ color: "var(--fg-mute)" }}>w={AG_WEIGHTS[k].toFixed(2)}</span>
              </div>
            );
          })}
          <div style={{ borderTop: "var(--border-hair)", marginTop: "var(--s-2)", paddingTop: "var(--s-2)", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-dim)" }}>
            raw weighted sum: {fixture.antiGaming.rawSum.toFixed(3)} <span title="The five internal weights deliberately sum to 1.15, not 1.0. The clamp floor cannot reach 1 if all five gaming signals fire at full strength. Source: CE2 §4.2." style={{ color: "var(--fg-mute)", textDecoration: "underline dotted", cursor: "help" }}>(weights sum 1.15 &gt; 1 by design)</span><br />
            a = clamp(1.0 − Σ w·s, 0.0, 1.0) = {fixture.antiGaming.score.toFixed(3)}
          </div>
        </div>
      </section>

      {drawerOpen && (
        <div role="dialog" aria-label="Cross-layer fusion" onClick={() => setDrawer(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--s-4)" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px", width: "100%", padding: "var(--s-4)", border: "var(--border-hair)", background: "var(--bg-1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--s-2)" }}>
              <h4 style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--fg)" }}>CROSS-LAYER FUSION</h4>
              <button onClick={() => setDrawer(false)} style={{ background: "transparent", border: "var(--border-hair)", color: "var(--fg-dim)", padding: "2px 6px", cursor: "pointer", fontFamily: "var(--font-mono)" }}>esc</button>
            </div>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "13px", color: "var(--fg-dim)", lineHeight: 1.5 }}>
              Fusion applies between the per-layer scores and the final composite. It can REDUCE a layer&apos;s score but never inflate one. The only fusion rule active in the shipped engine: a high-confidence finding in S1 (contradiction) dampens S3 (embedding), because embedding coherence rewards topical unity, and contradictory claims tend to be topically unified while being logically opposed. The dampening is a bounded multiplicative adjustment. Source: CE2 §4.1.
            </p>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-dim)", borderTop: "var(--border-hair)", paddingTop: "var(--s-2)" }}>
              S3 before fusion: {fixture.fusion.s3BeforeFusion.toFixed(3)}<br />
              S3 after fusion: {fixture.fusion.s3AfterFusion.toFixed(3)}<br />
              fusion coefficient: {fixture.fusion.fusionCoefficient.toFixed(2)}<br />
              trigger: {fixture.fusion.trigger}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
