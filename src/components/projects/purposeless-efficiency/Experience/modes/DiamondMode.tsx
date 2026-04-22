"use client";
import type { ExperienceContext } from "@/lib/experience-config";
import { DIAMOND_CASES } from "@/lib/prp/diamondCases";
import { usePrp } from "@/stores/prpExperience";

export default function DiamondMode({ ctx }: { ctx: ExperienceContext; regime: string }) {
  const activeCaseId = usePrp((s) => s.diamond.activeCaseId);
  const activeStep = usePrp((s) => s.diamond.activeStep);
  const currentWalk = usePrp((s) => s.diamond.currentWalk);
  const pickCase = usePrp((s) => s.pickCase);
  const setStepInput = usePrp((s) => s.setStepInput);
  const stepBack = usePrp((s) => s.stepBack);
  const stepNext = usePrp((s) => s.stepNext);
  const submitWalk = usePrp((s) => s.submitWalk);
  const acceptWalk = usePrp((s) => s.acceptWalk);
  const dissentWalk = usePrp((s) => s.dissentWalk);
  const redoWalk = usePrp((s) => s.redoWalk);
  const setMode = usePrp((s) => s.setMode);
  const setSelectedClaimId = usePrp((s) => s.setSelectedClaimId);

  const activeCase = activeCaseId ? DIAMOND_CASES.find((c) => c.id === activeCaseId) : null;
  const showReveal = currentWalk?.completedAt != null;

  if (!activeCase) {
    return (
      <div style={{ padding: "var(--s-4)" }}>
        <header style={{ marginBottom: "var(--s-4)", fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--fg-mute)" }}>
          Six cases the book treats. Pick one and walk the method.
        </header>
        <div style={{
          display: "grid", gap: "var(--s-3)",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        }}>
          {DIAMOND_CASES.map((c) => (
            <button key={c.id} type="button" onClick={() => { pickCase(c.id); ctx.announce(`Walking case: ${c.title}`); }}
              style={{
                textAlign: "left", padding: "var(--s-3)",
                border: "var(--border-hair)", background: "var(--bg-1)", cursor: "pointer",
              }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)", letterSpacing: "0.1em" }}>
                {c.difficulty}
              </div>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "18px", margin: "4px 0 8px" }}>{c.title}</h3>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--fg-dim)", margin: "4px 0" }}>
                A. {c.apparentClaimA}
              </p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--fg-dim)", margin: "4px 0" }}>
                B. {c.apparentClaimB}
              </p>
              <div style={{ marginTop: "var(--s-2)", display: "flex", gap: "4px", flexWrap: "wrap" }}>
                {c.tagClaimIds.map((id) => (
                  <span key={id} style={{ fontFamily: "var(--font-mono)", fontSize: "9px", padding: "2px 4px", color: "var(--accent-dim)", border: "var(--border-hair)" }}>{id}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (showReveal && currentWalk) {
    const step1Match = currentWalk.step1Choice != null && activeCase.step1Options[currentWalk.step1Choice]?.isBookFraming;
    const step2Match = currentWalk.step2Verdict === activeCase.bookWalk.step2.verdict;
    return (
      <div style={{ padding: "var(--s-4)" }}>
        <header style={{ marginBottom: "var(--s-4)" }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "22px", margin: 0 }}>{activeCase.title}</h2>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--fg-mute)", marginTop: "4px" }}>
            Your walk and the book&apos;s walk, side by side. The book&apos;s view is one view.
          </p>
        </header>
        <div style={{ display: "grid", gap: "var(--s-4)", gridTemplateColumns: ctx.hostWidthPx >= 800 ? "1fr 1fr" : "1fr" }}>
          <div>
            <h3 style={colHead}>YOUR WALK</h3>
            <Field label="Step 1 — Identify">{currentWalk.step1Choice != null ? activeCase.step1Options[currentWalk.step1Choice]?.label : "—"}</Field>
            <Field label={`Step 2 — ${currentWalk.step2Verdict ?? "—"}`}>{currentWalk.step2Justification || "—"}</Field>
            <Field label="Step 3 — Reconstruct">{currentWalk.step3Reconstruction || "—"}</Field>
            <Field label="Step 4 — Consequences">
              <ul>{currentWalk.step4Consequences.filter(Boolean).map((c, i) => <li key={i} style={consBullet}>· {c}</li>)}</ul>
            </Field>
          </div>
          <div>
            <h3 style={colHead}>THE BOOK&apos;S WALK</h3>
            <Field label="Step 1 — Identify">{activeCase.bookWalk.step1}</Field>
            <Field label={`Step 2 — ${activeCase.bookWalk.step2.verdict}`}>{activeCase.bookWalk.step2.justification}</Field>
            <Field label="Step 3 — Reconstruct">{activeCase.bookWalk.step3}</Field>
            <Field label="Step 4 — Consequences">
              <ul>{activeCase.bookWalk.step4.map((c, i) => <li key={i} style={consBullet}>· {c}</li>)}</ul>
            </Field>
          </div>
        </div>

        <div style={{ marginTop: "var(--s-4)", padding: "var(--s-3)", border: "var(--border-hair)",
                       fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--fg-dim)" }}>
          <div>Step 1: {step1Match ? "matches" : "differs"}.</div>
          <div>Step 2 verdict: {step2Match ? "same" : `different (you: ${currentWalk.step2Verdict ?? "—"}, book: ${activeCase.bookWalk.step2.verdict})`}.</div>
          <div>Steps 3 and 4 are not adjudicated here.</div>
        </div>

        <footer style={{ marginTop: "var(--s-4)", display: "flex", flexWrap: "wrap", gap: "8px" }}>
          <button type="button" style={btn} onClick={() => acceptWalk()}>accept</button>
          <button type="button" style={btn} onClick={() => dissentWalk()}>dissent</button>
          <button type="button" style={btn} onClick={() => redoWalk()}>redo</button>
          {activeCase.tagClaimIds[0] && (
            <button type="button" style={btn}
              onClick={() => { setSelectedClaimId(activeCase.tagClaimIds[0]); setMode("ontology"); }}>
              open in ontology · {activeCase.tagClaimIds[0]}
            </button>
          )}
          {activeCase.objectionRef && (
            <button type="button" style={btn}
              onClick={() => setMode("objections")}>open in objections · {activeCase.objectionRef}</button>
          )}
          <button type="button" style={btn} onClick={() => pickCase("")}>pick another case</button>
        </footer>
      </div>
    );
  }

  // Stepper
  const w = currentWalk!;
  const canAdvance = activeStep !== 4 || w.step4Consequences.some((s) => s.trim().length > 0);

  return (
    <div style={{ padding: "var(--s-4)" }}>
      <header style={{ marginBottom: "var(--s-3)" }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "22px", margin: 0 }}>{activeCase.title}</h2>
        <div style={{ display: "flex", gap: "8px", marginTop: "var(--s-3)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
          {[1, 2, 3, 4].map((s) => (
            <span key={s} style={{
              padding: "4px 10px", border: "var(--border-hair)",
              color: s === activeStep ? "var(--accent)" : s < activeStep ? "var(--fg)" : "var(--fg-mute)",
              background: s === activeStep ? "var(--bg-3)" : "transparent",
            }}>STEP {s}</span>
          ))}
        </div>
      </header>

      {activeStep === 1 && (
        <Step title="STEP 1. IDENTIFY THE CONTRADICTION">
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--fg-dim)", marginBottom: "var(--s-3)" }}>
            <p style={{ margin: "4px 0" }}>A. {activeCase.apparentClaimA}</p>
            <p style={{ margin: "4px 0" }}>B. {activeCase.apparentClaimB}</p>
          </div>
          <fieldset>
            <legend style={legend}>What, precisely, is the contradiction?</legend>
            {activeCase.step1Options.map((o, i) => (
              <label key={i} style={radioRow}>
                <input type="radio" name="s1" checked={w.step1Choice === i}
                  onChange={() => setStepInput(1, i)} />
                <span>{o.label}</span>
              </label>
            ))}
          </fieldset>
        </Step>
      )}

      {activeStep === 2 && (
        <Step title="STEP 2. DISSOLVE OR DECLARE">
          <fieldset>
            <legend style={legend}>Verdict</legend>
            {(["DISSOLVE", "DECLARE"] as const).map((v) => (
              <label key={v} style={radioRow}>
                <input type="radio" name="s2" checked={w.step2Verdict === v}
                  onChange={() => setStepInput(2, { verdict: v, justification: w.step2Justification })} />
                <span>{v}</span>
              </label>
            ))}
          </fieldset>
          <label style={{ display: "block", marginTop: "var(--s-3)" }}>
            <span style={legend}>Justification (1–3 sentences)</span>
            <textarea
              value={w.step2Justification}
              onChange={(e) => setStepInput(2, { verdict: w.step2Verdict ?? "DISSOLVE", justification: e.target.value })}
              maxLength={400} rows={4} style={textarea} />
          </label>
        </Step>
      )}

      {activeStep === 3 && (
        <Step title="STEP 3. RECONSTRUCT">
          <div style={{ marginBottom: "var(--s-2)" }}>
            <span style={legend}>Templates (click to prefill)</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
              {activeCase.step3Templates.map((t, i) => (
                <button key={i} type="button" onClick={() => setStepInput(3, t)}
                  style={{
                    textAlign: "left", padding: "6px 8px", border: "var(--border-hair)",
                    background: "transparent", cursor: "pointer",
                    color: "var(--fg-dim)", fontFamily: "var(--font-mono)", fontSize: "12px",
                  }}>{t}</button>
              ))}
            </div>
          </div>
          <textarea value={w.step3Reconstruction}
            onChange={(e) => setStepInput(3, e.target.value)}
            maxLength={300} rows={3} style={textarea}
            placeholder="Single-sentence reconstruction" />
        </Step>
      )}

      {activeStep === 4 && (
        <Step title="STEP 4. TRACE CONSEQUENCES">
          <span style={legend}>At least one consequence required</span>
          {[0, 1, 2].map((i) => (
            <textarea key={i}
              value={w.step4Consequences[i]}
              onChange={(e) => {
                const next = [...w.step4Consequences] as [string, string, string];
                next[i] = e.target.value;
                setStepInput(4, next);
              }}
              maxLength={300} rows={2} style={{ ...textarea, marginTop: "var(--s-2)" }}
              placeholder={`Consequence ${i + 1}`} />
          ))}
        </Step>
      )}

      <footer style={{ marginTop: "var(--s-4)", display: "flex", gap: "8px" }}>
        <button type="button" style={btn} onClick={stepBack} disabled={activeStep <= 1}>back</button>
        {activeStep < 4 ? (
          <button type="button" style={btn} onClick={stepNext}>next</button>
        ) : (
          <button type="button" style={btn} onClick={() => { submitWalk(); ctx.announce("Walk submitted. Reveal open."); }}
            disabled={!canAdvance}>submit walk</button>
        )}
        <button type="button" style={btn} onClick={() => pickCase("")}>cancel</button>
      </footer>
    </div>
  );
}

const btn: React.CSSProperties = {
  fontFamily: "var(--font-mono)", fontSize: "11px", padding: "4px 10px",
  border: "var(--border-hair)", background: "transparent", color: "var(--fg)",
  cursor: "pointer", letterSpacing: "0.06em", textTransform: "uppercase",
};
const legend: React.CSSProperties = {
  fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)",
  letterSpacing: "0.12em", display: "block",
};
const textarea: React.CSSProperties = {
  width: "100%", padding: "6px", border: "var(--border-hair)",
  background: "var(--bg-0)", color: "var(--fg)",
  fontFamily: "var(--font-mono)", fontSize: "13px", marginTop: "4px",
};
const radioRow: React.CSSProperties = {
  display: "flex", gap: "8px", padding: "4px 0",
  fontFamily: "var(--font-mono)", fontSize: "13px", cursor: "pointer",
};
const colHead: React.CSSProperties = {
  fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-mute)",
  letterSpacing: "0.12em", marginBottom: "var(--s-2)",
};
const consBullet: React.CSSProperties = { fontFamily: "var(--font-mono)", fontSize: "12px", padding: "2px 0" };

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ border: "var(--border-hair)", padding: "var(--s-3)" }}>
      <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "14px", letterSpacing: "0.08em",
                    textTransform: "uppercase", margin: "0 0 var(--s-3) 0" }}>
        {title}
      </h3>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "var(--s-3)" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)",
                     letterSpacing: "0.12em", marginBottom: "4px" }}>{label}</div>
      <div className="prp-prose" style={{ fontSize: "13px", maxWidth: "100%" }}>
        {typeof children === "string" ? <p>{children}</p> : children}
      </div>
    </div>
  );
}
