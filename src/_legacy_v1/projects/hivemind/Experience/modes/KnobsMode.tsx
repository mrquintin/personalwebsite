"use client";
import type { ExperienceContext } from "@/lib/experience-config";
import { useHvm, runIdForTuple } from "@/stores/hivemindExperience";
import { lookupOutcome, type KnobOutcome, type KnobTuple } from "@/lib/hivemind/knobMatrix";

const SUFF_VALS = [1, 2, 3, 4] as const;
const FEAS_VALS = [40, 55, 70, 85] as const;
const DENS_VALS = [600, 1200, 2400, 4800] as const;

export default function KnobsMode({ ctx, regime }: { ctx: ExperienceContext; regime: "narrow" | "standard" | "wide" }) {
  const k = useHvm((s) => s.knobs);
  const setKnob = useHvm((s) => s.setKnob);
  const reset = useHvm((s) => s.resetKnobs);
  const setSuff = useHvm((s) => s.setSufficiency);
  const setFeas = useHvm((s) => s.setFeasibility);
  const setMode = useHvm((s) => s.setMode);

  const current = lookupOutcome(k.current);
  const previous = k.previous ? lookupOutcome(k.previous) : null;
  const canSendToTheater = k.current.density === 1200;

  function send(knobName: keyof KnobTuple, val: number) {
    setKnob(knobName, val);
    ctx.announce(`${knobName} set to ${val}.`);
  }

  function sendToTheater() {
    setSuff(k.current.sufficiency);
    setFeas(k.current.feasibility);
    setMode("theater");
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: regime === "wide" ? "40% 60%" : "1fr",
      gap: "var(--s-4)", padding: "var(--s-4)",
    }}>
      {/* KnobPanel */}
      <section>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--s-3)" }}>
          <h3 style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.12em",
                        color: "var(--fg-mute)", margin: 0 }}>KNOBS</h3>
          <button type="button" onClick={reset} style={btn}>RESET</button>
        </header>

        <Knob name="SUFFICIENCY" subtitle="halt when unique clusters ≤ this"
          values={SUFF_VALS} current={k.current.sufficiency}
          onChange={(v) => send("sufficiency", v)} format={(v) => String(v)} />

        <Knob name="FEASIBILITY" subtitle="veto if average practicality score < this"
          values={FEAS_VALS} current={k.current.feasibility}
          onChange={(v) => send("feasibility", v)} format={(v) => String(v)} />

        <Knob name="DENSITY"
          subtitle="approximate KB tokens per theory agent; sets the resolution of the network, not the agent count directly"
          values={DENS_VALS} current={k.current.density}
          onChange={(v) => send("density", v)}
          format={(v) => v >= 1000 ? `~${(v / 1000).toFixed(1)}k` : `~${v}`} />

        <details style={{ marginTop: "var(--s-4)" }}>
          <summary style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-mute)", cursor: "pointer", letterSpacing: "0.1em" }}>
            FIRM-SET CALIBRATIONS (not client-adjustable)
          </summary>
          <ul style={{ marginTop: "var(--s-2)", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-dim)" }}>
            <li>Theory-agent stubbornness</li>
            <li>Monitor similarity threshold</li>
            <li>Practicality severity</li>
          </ul>
        </details>
      </section>

      {/* OutcomeMatrix */}
      <section>
        <p style={{ fontFamily: "var(--font-serif)", fontSize: "12px", fontStyle: "italic",
                    color: "var(--fg-dim)", marginBottom: "var(--s-3)" }}>
          Precomputed outcomes, not live computation. Each cell of the 4×4×4 matrix was authored against a single scoped problem to show how the knobs shift the shape of the output.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "var(--s-2)" }}>
          <Tile label="AGENTS" value={current.agentCount} />
          <Tile label="DEBATE ROUNDS" value={current.debateRounds} />
          <Tile label="CLUSTERS" value={current.finalClusterCount} />
          <Tile label="VERDICT" value={current.verdict} color={current.verdict === "PASSED" ? "var(--ok)" : "var(--danger)"} />
          <Tile label="RESTARTS" value={current.restartCycles} />
          <Tile label="OUTPUT SIZE" value={current.outputSize} />
          <Tile label="DURATION" value={`${current.virtualDurationSec}s`} />
        </div>

        <Sparkline points={current.sparkline} />

        {current.note && (
          <p style={{ marginTop: "var(--s-2)", fontFamily: "var(--font-serif)", fontStyle: "italic",
                      fontSize: "12px", color: "var(--fg-dim)" }}>
            {current.note}
          </p>
        )}

        <DeltaReadout previous={previous} current={current} />

        <button type="button" onClick={sendToTheater}
          disabled={!canSendToTheater}
          title={!canSendToTheater ? "The theater's authored run fixture covers density ~1.2k only. Set DENSITY to ~1.2k to enable this." : undefined}
          style={{
            marginTop: "var(--s-3)", padding: "6px 12px",
            fontFamily: "var(--font-mono)", fontSize: "11px",
            border: "var(--border-hair)",
            background: canSendToTheater ? "var(--bg-3)" : "transparent",
            color: canSendToTheater ? "var(--accent)" : "var(--fg-mute)",
            cursor: canSendToTheater ? "pointer" : "not-allowed",
          }}>
          SEND TO THEATER → {runIdForTuple(k.current)}
        </button>
      </section>
    </div>
  );
}

const btn: React.CSSProperties = {
  fontFamily: "var(--font-mono)", fontSize: "11px",
  padding: "4px 10px", border: "var(--border-hair)",
  background: "transparent", color: "var(--fg)", cursor: "pointer",
  letterSpacing: "0.1em",
};

function Knob<T extends number>({
  name, subtitle, values, current, onChange, format,
}: {
  name: string; subtitle: string;
  values: readonly T[]; current: T;
  onChange: (v: T) => void; format: (v: T) => string;
}) {
  return (
    <fieldset style={{ marginBottom: "var(--s-4)", border: 0, padding: 0 }}>
      <legend style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-mute)", letterSpacing: "0.1em" }}>
        {name} <span style={{ color: "var(--fg)", fontSize: "13px", marginLeft: 6 }}>{format(current)}</span>
      </legend>
      <div role="radiogroup" aria-label={name} style={{ display: "flex", gap: "6px", marginTop: 6 }}>
        {values.map((v) => (
          <button key={String(v)} type="button" role="radio"
            aria-checked={v === current}
            onClick={() => onChange(v)}
            style={{
              flex: 1, padding: "6px 8px",
              border: "var(--border-hair)",
              background: v === current ? "var(--bg-3)" : "transparent",
              color: v === current ? "var(--accent)" : "var(--fg-dim)",
              fontFamily: "var(--font-mono)", fontSize: "11px", cursor: "pointer",
            }}>
            {format(v)}
          </button>
        ))}
      </div>
      <p style={{ marginTop: 6, fontFamily: "var(--font-serif)", fontSize: "12px", color: "var(--fg-dim)" }}>{subtitle}</p>
    </fieldset>
  );
}

function Tile({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ padding: "var(--s-3)", border: "var(--border-hair)" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)", letterSpacing: "0.1em" }}>{label}</div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "16px", color: color ?? "var(--fg)", marginTop: 4 }}>{String(value)}</div>
    </div>
  );
}

function Sparkline({ points }: { points: Array<{ round: number; clusterCount: number }> }) {
  if (points.length === 0) return null;
  const max = Math.max(...points.map((p) => p.clusterCount));
  const w = 160, h = 40, pad = 4;
  const xStep = (w - 2 * pad) / Math.max(1, points.length - 1);
  const yScale = (v: number) => h - pad - (v / max) * (h - 2 * pad);
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${pad + i * xStep} ${yScale(p.clusterCount)}`).join(" ");
  return (
    <svg width={w} height={h} style={{ marginTop: "var(--s-3)" }} aria-label="cluster count by round">
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth="1" />
      {points.map((p, i) => (
        <circle key={i} cx={pad + i * xStep} cy={yScale(p.clusterCount)} r={2} fill="var(--accent)" />
      ))}
    </svg>
  );
}

function DeltaReadout({ previous, current }: { previous: KnobOutcome | null; current: KnobOutcome }) {
  if (!previous) {
    return (
      <p style={{ marginTop: "var(--s-3)", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-mute)" }}>
        —   no prior state
      </p>
    );
  }
  const a = current.agentCount - previous.agentCount;
  const r = current.debateRounds - previous.debateRounds;
  const c = current.finalClusterCount - previous.finalClusterCount;
  const v = current.verdict === previous.verdict ? "same"
          : `${previous.verdict} → ${current.verdict}`;
  const sign = (n: number) => n >= 0 ? `+${n}` : `${n}`;
  return (
    <p style={{ marginTop: "var(--s-3)", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg)" }}>
      Δ   agents {sign(a)}   rounds {sign(r)}   clusters {sign(c)}   verdict {v}
    </p>
  );
}
