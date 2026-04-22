"use client";
import { useEffect, useRef } from "react";
import type { ExperienceContext } from "@/lib/experience-config";
import { useHvm, currentTheaterRun } from "@/stores/hivemindExperience";
import { findRun, SUFFICIENCY_STEPS, FEASIBILITY_STEPS } from "@/lib/hivemind/theaterScript";

const BADGE_COLOR: Record<string, string> = {
  proposal: "var(--fg)", critique: "var(--accent-dim)", revision: "var(--fg)",
  cluster_formed: "var(--accent)", practicality_score: "var(--fg-dim)",
  veto: "var(--danger)", pass: "var(--ok)", output: "var(--ok)",
};

export default function TheaterMode({ ctx, regime }: { ctx: ExperienceContext; regime: "narrow" | "standard" | "wide" }) {
  const t = useHvm((s) => s.theater);
  const play = useHvm((s) => s.play);
  const pause = useHvm((s) => s.pause);
  const stepFwd = useHvm((s) => s.stepForward);
  const stepBack = useHvm((s) => s.stepBack);
  const jumpStart = useHvm((s) => s.jumpToStart);
  const jumpEnd = useHvm((s) => s.jumpToEnd);
  const setSpeed = useHvm((s) => s.setSpeed);
  const setSuff = useHvm((s) => s.setSufficiency);
  const setFeas = useHvm((s) => s.setFeasibility);
  const setFilter = useHvm((s) => s.setFilter);

  const run = currentTheaterRun();
  const event = run.events[t.cursor];
  const visibleEvents = run.events.slice(0, t.cursor + 1);
  const filtered = t.filterAgentId
    ? visibleEvents.filter((e) => e.speakerId === t.filterAgentId || e.targetSpeakerId === t.filterAgentId)
    : visibleEvents;

  // Scheduler — chained setTimeout
  const timer = useRef<number | null>(null);
  useEffect(() => {
    if (t.state !== "playing") return;
    const next = run.events[t.cursor + 1];
    if (!next) return;
    const delaySec = (next.tSec - (event?.tSec ?? 0)) / t.speed;
    timer.current = window.setTimeout(() => {
      const ended = (t.cursor + 1) === run.events.length - 1;
      stepFwd();
      if (ended) {
        ctx.announce("Deliberation complete. Final output ready.");
      }
    }, Math.max(120, delaySec * 1000));
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [t.state, t.cursor, t.speed, run, event, stepFwd, ctx]);

  // Keyboard shortcuts when in this mode
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === " ") { e.preventDefault(); t.state === "playing" ? pause() : play(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); stepFwd(); }
      else if (e.key === "ArrowLeft")  { e.preventDefault(); stepBack(); }
      else if (e.key === "Home")       { e.preventDefault(); jumpStart(); }
      else if (e.key === "End")        { e.preventDefault(); jumpEnd(); }
      else if (e.key === "1") setSpeed(1);
      else if (e.key === "2") setSpeed(2);
      else if (e.key === "4") setSpeed(4);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [t.state, play, pause, stepFwd, stepBack, jumpStart, jumpEnd, setSpeed]);

  const monitor = run.clusterSnapshots[run.clusterSnapshots.length - 1];
  const halted = visibleEvents.some((e) => e.type === "pass" || e.type === "veto");
  const verdictEvent = visibleEvents.find((e) => e.type === "pass" || e.type === "veto");
  const totalDur = run.durationSec;
  const cur = event?.tSec ?? 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: "12px", fontStyle: "italic",
                  color: "var(--fg-dim)", padding: "var(--s-3) var(--s-4)", margin: 0 }}>
        Authored problem for illustration. Hivemind does not run in this panel; the replay below is a recording of one complete deliberation under a pre-set knowledge base.
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: regime === "wide" ? "18% 1fr 22%" : regime === "standard" ? "1fr 1fr" : "1fr",
        gap: "var(--s-3)", flex: 1, padding: "0 var(--s-3) var(--s-3)", minHeight: 360, overflow: "hidden",
      }}>
        {/* AGENT STRIP */}
        <aside style={{ borderRight: regime === "wide" ? "var(--border-hair)" : "none",
                         padding: "var(--s-2)", minWidth: 120, overflow: "auto" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)",
                         letterSpacing: "0.12em", marginBottom: 6 }}>AGENTS</div>
          {run.agents.map((a) => {
            const lastEvent = visibleEvents.findLast?.((e) => e.speakerId === a.id);
            const status = !lastEvent ? "IDLE" : lastEvent.type === "proposal" ? "PROPOSING" : lastEvent.type === "critique" ? "CRITIQUING" : lastEvent.type === "revision" ? "REVISING" : "IDLE";
            const active = t.filterAgentId === a.id;
            return (
              <button key={a.id} type="button"
                onClick={() => setFilter(active ? null : a.id)}
                aria-pressed={active}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "var(--s-2)", margin: "4px 0",
                  border: active ? "1px solid var(--accent)" : "var(--border-hair)",
                  background: active ? "var(--bg-3)" : "transparent",
                  cursor: "pointer",
                }}>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: "13px", color: "var(--fg)" }}>{a.name}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)" }}>{a.framework}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", marginTop: 4, color: status === "IDLE" ? "var(--fg-mute)" : "var(--accent)" }}>
                  ● {status}
                </div>
              </button>
            );
          })}
        </aside>

        {/* STAGE */}
        <main style={{ overflow: "auto", padding: "var(--s-2)" }}>
          <ol style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {filtered.map((e, i) => {
              const isActive = e.id === event?.id;
              const agent = run.agents.find((a) => a.id === e.speakerId);
              return (
                <li key={e.id}
                  style={{
                    borderLeft: isActive ? "1px solid var(--accent)" : "1px solid transparent",
                    padding: "4px 8px",
                    background: isActive ? "var(--bg-2)" : "transparent",
                  }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "baseline", fontFamily: "var(--font-mono)", fontSize: "10px" }}>
                    <span style={{ color: BADGE_COLOR[e.type], textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      {e.type.replace("_", " ")}
                    </span>
                    <span style={{ color: "var(--fg-mute)" }}>R{e.round < 0 ? "-practice" : e.round}</span>
                    {agent && <span style={{ color: "var(--fg-dim)" }}>· {agent.name}</span>}
                    {!agent && e.speakerId === null && <span style={{ color: "var(--fg-dim)" }}>· monitor</span>}
                    {e.targetSpeakerId && <span style={{ color: "var(--fg-mute)" }}>→ {e.targetSpeakerId}</span>}
                  </div>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: "13px", color: "var(--fg)", marginTop: 2 }}>
                    {e.body}
                  </div>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li style={{ fontFamily: "var(--font-mono)", color: "var(--fg-mute)", padding: 8 }}>
                no events match the current filter
              </li>
            )}
          </ol>
        </main>

        {/* MONITOR + PRACTICALITY */}
        <aside style={{ borderLeft: regime === "wide" ? "var(--border-hair)" : "none",
                         padding: "var(--s-2)", overflow: "auto" }}>
          <section style={{ marginBottom: "var(--s-4)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)",
                           letterSpacing: "0.12em", marginBottom: 4 }}>MONITOR</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--fg)" }}>
              clusters: {monitor?.clusters.length ?? 0}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-dim)", marginTop: 4 }}>
              SUFFICIENCY: {t.sufficiencyValue}
            </div>
            <input type="range" min={1} max={4} step={1} value={t.sufficiencyValue}
              disabled={t.state === "playing"}
              onChange={(e) => setSuff(SUFFICIENCY_STEPS[parseInt(e.target.value, 10) - 1])}
              style={{ width: "100%" }} />
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)" }}>
              halt when unique clusters ≤ this
            </p>
          </section>

          <section>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)",
                           letterSpacing: "0.12em", marginBottom: 4,
                           opacity: halted ? 1 : 0.5 }}>PRACTICALITY</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-dim)", marginTop: 4 }}>
              FEASIBILITY: {t.feasibilityValue}
            </div>
            <input type="range" min={0} max={3} step={1}
              value={FEASIBILITY_STEPS.indexOf(t.feasibilityValue as 40 | 55 | 70 | 85)}
              disabled={t.state === "playing"}
              onChange={(e) => setFeas(FEASIBILITY_STEPS[parseInt(e.target.value, 10)])}
              style={{ width: "100%" }} />
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)" }}>
              veto if average score &lt; this
            </p>
            {verdictEvent && (
              <div style={{ marginTop: "var(--s-3)", fontFamily: "var(--font-mono)", fontSize: "12px",
                             color: verdictEvent.type === "pass" ? "var(--ok)" : "var(--danger)",
                             padding: "4px 8px", border: `1px solid currentColor` }}>
                VERDICT: {verdictEvent.type.toUpperCase()}
              </div>
            )}
            {halted && run.practicalityScores.length > 0 && (
              <ul style={{ marginTop: "var(--s-3)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                {run.practicalityScores.map((p, i) => (
                  <li key={i} style={{ color: "var(--fg-dim)", padding: "2px 0" }}>
                    {p.constraint} · {p.clusterId}: {p.score}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      {/* PLAYBACK CONTROLS */}
      <div style={{
        display: "flex", alignItems: "center", gap: "8px",
        padding: "var(--s-2) var(--s-3)", borderTop: "var(--border-hair)",
        fontFamily: "var(--font-mono)", fontSize: "11px",
      }}>
        <button type="button" onClick={jumpStart} aria-label="jump to start" style={btn}>«</button>
        <button type="button" onClick={stepBack} aria-label="step back" style={btn}>‹</button>
        {t.state === "playing"
          ? <button type="button" onClick={pause} style={btn}>pause</button>
          : <button type="button" onClick={play} style={btn}>play</button>}
        <button type="button" onClick={stepFwd} aria-label="step forward" style={btn}>›</button>
        <button type="button" onClick={jumpEnd} aria-label="jump to end" style={btn}>»</button>
        <span style={{ color: "var(--fg-mute)", marginLeft: 8 }}>
          {fmt(cur)} / {fmt(totalDur)}
        </span>
        <span style={{ marginLeft: "auto", display: "flex", gap: "4px" }}>
          {([1, 2, 4] as const).map((s) => (
            <button key={s} type="button" onClick={() => setSpeed(s)}
              aria-pressed={t.speed === s}
              style={{ ...btn, background: t.speed === s ? "var(--bg-3)" : "transparent",
                       color: t.speed === s ? "var(--accent)" : "var(--fg-mute)" }}>
              {s}x
            </button>
          ))}
        </span>
      </div>
    </div>
  );
}

const btn: React.CSSProperties = {
  fontFamily: "var(--font-mono)", fontSize: "11px",
  padding: "4px 8px", border: "var(--border-hair)",
  background: "transparent", color: "var(--fg)", cursor: "pointer",
};
function fmt(s: number): string {
  const m = Math.floor(s / 60), r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
}
