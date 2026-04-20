"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SCENARIOS, type Scenario } from "@/lib/scenarios";
import DemoGraph, { type Phase } from "./DemoGraph";

type TranscriptEntry = {
  actor: string;
  kind: "initial" | "critique" | "revision" | "monitor" | "practicality";
  body: string;
  meta?: string;
  tint: "paper" | "theory" | "monitor" | "pragma" | "veto";
};

const STEP_INITIAL = 1200;
const STEP_CRITIQUE = 900;
const STEP_REVISE = 1100;
const STEP_PRAGMA = 900;

export default function HivemindDemo() {
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id);
  const scenario: Scenario = useMemo(
    () => SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0],
    [scenarioId],
  );

  const [sufficiency, setSufficiency] = useState(2);
  const [feasibility, setFeasibility] = useState(80);

  const [phase, setPhase] = useState<Phase>("idle");
  const [activeTheoristIdx, setActiveTheoristIdx] = useState<number | null>(null);
  const [activeCritique, setActiveCritique] = useState<{ fromId: string; toId: string } | null>(null);
  const [activePragmaIdx, setActivePragmaIdx] = useState<number | null>(null);
  const [uniqueCount, setUniqueCount] = useState<number>(scenario.theorists.length);
  const [feasibilityAvg, setFeasibilityAvg] = useState<number>(0);
  const [verdict, setVerdict] = useState<"PASS" | "VETO" | null>(null);
  const [running, setRunning] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const transcriptBoxRef = useRef<HTMLDivElement | null>(null);

  // reset on scenario change
  useEffect(() => { reset(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [scenarioId]);
  useEffect(() => { return () => clearAllTimers(); }, []);

  useEffect(() => {
    if (transcriptBoxRef.current) {
      transcriptBoxRef.current.scrollTop = transcriptBoxRef.current.scrollHeight;
    }
  }, [transcript]);

  function clearAllTimers() {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }
  function schedule(fn: () => void, delay: number) {
    const t = setTimeout(fn, delay);
    timersRef.current.push(t);
  }
  function reset() {
    clearAllTimers();
    setRunning(false);
    setPhase("idle");
    setActiveTheoristIdx(null);
    setActiveCritique(null);
    setActivePragmaIdx(null);
    setUniqueCount(scenario.theorists.length);
    setFeasibilityAvg(0);
    setVerdict(null);
    setTranscript([]);
  }

  function push(entry: TranscriptEntry) {
    setTranscript((t) => [...t, entry]);
  }

  function run() {
    reset();
    setRunning(true);

    let t = 0;

    // INITIAL
    setPhase("initial");
    scenario.theorists.forEach((th, i) => {
      schedule(() => {
        setActiveTheoristIdx(i);
        const sol = scenario.initialSolutions[th.id];
        push({
          actor: th.name,
          kind: "initial",
          body: sol.text,
          meta: sol.rationale,
          tint: "theory",
        });
      }, t);
      t += STEP_INITIAL;
    });
    schedule(() => setActiveTheoristIdx(null), t);

    // CRITIQUE
    schedule(() => setPhase("critique"), t);
    scenario.critiques.forEach((c) => {
      schedule(() => {
        setActiveCritique({ fromId: c.fromId, toId: c.toId });
        const fromName = scenario.theorists.find((x) => x.id === c.fromId)?.name ?? c.fromId;
        const toName   = scenario.theorists.find((x) => x.id === c.toId)?.name ?? c.toId;
        push({
          actor: fromName,
          kind: "critique",
          body: c.text,
          meta: `→ ${toName}`,
          tint: "paper",
        });
      }, t);
      t += STEP_CRITIQUE;
    });
    schedule(() => setActiveCritique(null), t);

    // REVISE
    schedule(() => setPhase("revise"), t);
    scenario.theorists.forEach((th, i) => {
      schedule(() => {
        setActiveTheoristIdx(i);
        const sol = scenario.revisedSolutions[th.id];
        push({
          actor: th.name,
          kind: "revision",
          body: sol.text,
          meta: sol.rationale,
          tint: "theory",
        });
      }, t);
      t += STEP_REVISE;
    });
    schedule(() => setActiveTheoristIdx(null), t);

    // AGGREGATE
    schedule(() => setPhase("aggregate"), t);
    const start = scenario.theorists.length;
    const end = scenario.aggregate.length;
    const drops = Math.max(1, start - end);
    for (let k = 0; k < drops; k++) {
      const next = start - k - 1;
      schedule(() => setUniqueCount(next), t);
      t += 350;
    }
    scenario.aggregate.forEach((agg) => {
      schedule(() => {
        push({
          actor: "MONITOR",
          kind: "monitor",
          body: agg.text,
          meta: `supporters: ${agg.supporters.join(", ")}`,
          tint: "monitor",
        });
      }, t);
      t += 700;
    });

    // PRACTICALITY
    schedule(() => setPhase("practicality"), t);
    const allScores: number[] = [];
    scenario.aggregate.forEach((agg) => {
      const scores = scenario.practicalityScores[agg.id] ?? [];
      scores.forEach((s, i) => {
        schedule(() => {
          setActivePragmaIdx(i);
          allScores.push(s.score);
          const avg = allScores.reduce((a, b) => a + b, 0) / allScores.length;
          setFeasibilityAvg(avg);
          const prag = scenario.pragmas.find((x) => x.id === s.pragmaId);
          push({
            actor: prag?.label ?? s.pragmaId,
            kind: "practicality",
            body: s.note,
            meta: `${agg.id} · score ${s.score}`,
            tint: "pragma",
          });
        }, t);
        t += STEP_PRAGMA;
      });
    });
    schedule(() => setActivePragmaIdx(null), t);

    // VERDICT
    schedule(() => {
      setPhase("verdict");
      const avg = allScores.reduce((a, b) => a + b, 0) / allScores.length;
      const v = avg >= feasibility ? "PASS" : "VETO";
      setVerdict(v);
      push({
        actor: "MONITOR",
        kind: "monitor",
        body: v === "PASS"
          ? `Average feasibility ${avg.toFixed(0)} ≥ threshold ${feasibility}. Verdict: PASS.`
          : `Average feasibility ${avg.toFixed(0)} < threshold ${feasibility}. Verdict: VETO. Process regenerates.`,
        tint: v === "PASS" ? "pragma" : "veto",
      });
    }, t);
    t += 700;

    schedule(() => {
      setPhase("done");
      setRunning(false);
    }, t);
  }

  function stop() {
    clearAllTimers();
    setRunning(false);
  }

  const totalDuration = (() => {
    const initial = STEP_INITIAL * scenario.theorists.length;
    const crit = STEP_CRITIQUE * scenario.critiques.length;
    const rev = STEP_REVISE * scenario.theorists.length;
    const pragmas = scenario.aggregate.reduce(
      (acc, a) => acc + (scenario.practicalityScores[a.id]?.length ?? 0) * STEP_PRAGMA, 0,
    );
    return Math.round((initial + crit + rev + pragmas + 2000) / 1000);
  })();

  return (
    <section id="demo" className="border-t border-ink-500">
      <div className="mx-auto max-w-72rem px-6 py-24">
        <div className="eyebrow">THE DEMO</div>
        <h2 className="display text-display-lg mt-4 max-w-[24ch]">
          Watch the Hivemind
          <br />
          <span className="display-italic text-theory">deliberate.</span>
        </h2>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div>
            <label className="eyebrow block mb-2">Scenario</label>
            <select
              value={scenarioId}
              onChange={(e) => setScenarioId(e.target.value)}
              className="w-full bg-ink-800 border border-ink-500 text-paper text-sm px-3 py-2 rounded focus:outline-none focus:border-theory"
            >
              {SCENARIOS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <p className="mt-2 text-xs text-paper-dim leading-relaxed">{scenario.prompt}</p>
          </div>

          <div>
            <label className="eyebrow block mb-2">Sufficiency: {sufficiency}</label>
            <input
              type="range" min={1} max={scenario.theorists.length} step={1}
              value={sufficiency} onChange={(e) => setSufficiency(Number(e.target.value))}
              className="w-full accent-theory"
            />
            <p className="mt-2 text-xs text-paper-dim">Halt when unique solutions ≤ this value.</p>
          </div>

          <div>
            <label className="eyebrow block mb-2">Feasibility: {feasibility}</label>
            <input
              type="range" min={60} max={95} step={1}
              value={feasibility} onChange={(e) => setFeasibility(Number(e.target.value))}
              className="w-full accent-pragma"
            />
            <p className="mt-2 text-xs text-paper-dim">Average practicality must meet this to PASS.</p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-12">
          <div className="md:col-span-8">
            <DemoGraph
              scenario={scenario}
              phase={phase}
              activeTheoristIdx={activeTheoristIdx}
              activeCritique={activeCritique}
              activePragmaIdx={activePragmaIdx}
              uniqueCount={uniqueCount}
              feasibilityAvg={feasibilityAvg}
              feasibilityThreshold={feasibility}
              verdict={verdict}
            />

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {!running ? (
                <button onClick={run}
                        className="bg-paper text-ink-900 text-sm px-5 py-2 rounded-full hover:opacity-90 transition-opacity">
                  Run deliberation
                </button>
              ) : (
                <button onClick={stop}
                        className="bg-veto text-ink-900 text-sm px-5 py-2 rounded-full hover:opacity-90 transition-opacity">
                  Stop
                </button>
              )}
              <button onClick={reset}
                      className="text-sm text-paper-muted border border-ink-500 px-4 py-2 rounded-full hover:border-paper-muted transition-colors">
                Reset
              </button>
              <span className="ml-auto font-mono text-xs uppercase tracking-wider text-paper-dim">
                ≈ {totalDuration}s total
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-xs font-mono uppercase tracking-wider text-paper-dim">
              <Legend color="#c4b6e0" label="theorist" />
              <Legend color="#7ba8c9" label="monitor" />
              <Legend color="#e0a674" label="pragma" />
              <Legend color="#cc6b6b" label="veto" />
            </div>
          </div>

          <div className="md:col-span-4">
            <div className="border border-ink-500 rounded-2xl bg-ink-800 h-[560px] flex flex-col">
              <div className="px-4 py-3 border-b border-ink-500">
                <div className="eyebrow">Transcript</div>
              </div>
              <div ref={transcriptBoxRef} className="flex-1 overflow-y-auto divide-y divide-ink-500">
                {transcript.length === 0 && (
                  <div className="p-6 text-sm text-paper-dim">
                    Press <span className="text-paper">Run deliberation</span> to begin.
                  </div>
                )}
                <AnimatePresence initial={false}>
                  {transcript.map((e, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18 }}
                      className="px-4 py-3"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-wider"
                              style={{ color: tintColor(e.tint) }}>{e.actor}</span>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-paper-dim">{e.kind}</span>
                      </div>
                      <p className="mt-1 text-sm text-paper leading-snug">{e.body}</p>
                      {e.meta && (
                        <p className="mt-1 text-xs text-paper-dim italic">{e.meta}</p>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {phase === "done" && (
          <div className="mt-10 border border-theory-dim rounded-2xl p-6 bg-ink-800">
            <div className="eyebrow eyebrow-accent">FINAL OUTPUT</div>
            <ul className="mt-4 space-y-6">
              {scenario.aggregate.map((agg) => (
                <li key={agg.id} className="border-t border-ink-500 pt-4">
                  <p className="display text-2xl text-paper">{agg.text}</p>
                  <p className="mt-2 text-paper-muted text-sm leading-relaxed">{agg.combinedRationale}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {agg.supporters.map((s) => (
                      <span key={s} className="font-mono text-[10px] uppercase tracking-wider text-paper-dim border border-ink-500 px-2 py-1 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

function tintColor(t: TranscriptEntry["tint"]): string {
  switch (t) {
    case "theory":  return "#c4b6e0";
    case "monitor": return "#7ba8c9";
    case "pragma":  return "#e0a674";
    case "veto":    return "#cc6b6b";
    default:        return "#efe9dc";
  }
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-block w-2 h-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
