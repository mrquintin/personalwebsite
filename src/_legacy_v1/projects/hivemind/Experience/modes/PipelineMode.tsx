"use client";
import type { ExperienceContext } from "@/lib/experience-config";
import { useHvm } from "@/stores/hivemindExperience";
import { PIPELINE_STAGES, SAMPLE_DOCS, EMBEDDING_CLOUD_POINTS, type EmbeddingCloudPoint } from "@/lib/hivemind/pipeline";

const POINT_COLOR: Record<EmbeddingCloudPoint["docType"], string> = {
  framework: "var(--accent)",
  practicality: "var(--accent-dim)",
  simulation_description: "var(--ok)",
};

export default function PipelineMode({ ctx, regime }: { ctx: ExperienceContext; regime: "narrow" | "standard" | "wide" }) {
  const stageId = useHvm((s) => s.pipeline.activeStageId);
  const sampleId = useHvm((s) => s.pipeline.activeSampleId);
  const pointId = useHvm((s) => s.pipeline.activePointId);
  const setStage = useHvm((s) => s.activatePipelineStage);
  const setSample = useHvm((s) => s.setPipelineSample);
  const setPoint = useHvm((s) => s.setPipelinePoint);
  const openInMode = useHvm((s) => s.openInMode);

  const stage = PIPELINE_STAGES.find((s) => s.id === stageId)!;
  const sample = SAMPLE_DOCS.find((d) => d.id === sampleId)!;
  const stageSample = sample.stageSamples[stageId];

  return (
    <div style={{ padding: "var(--s-3)", display: "flex", flexDirection: "column", gap: "var(--s-3)" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: regime === "wide" ? "auto 1fr" : "1fr",
        gap: "var(--s-3)", alignItems: "start",
      }}>
        <DocumentCassette sample={sample} onChange={(id) => { setSample(id); ctx.announce(`Sample: ${id}.`); }} />

        {/* Stage rail */}
        <ol style={{
          display: "flex",
          flexDirection: regime === "narrow" ? "column" : "row",
          flexWrap: "wrap", gap: "8px",
        }}>
          {PIPELINE_STAGES.map((s) => {
            const active = s.id === stageId;
            return (
              <li key={s.id} style={{ flex: regime === "narrow" ? "1" : "1 1 120px" }}>
                <button type="button" onClick={() => { setStage(s.id); ctx.announce(`Stage ${s.id} ${s.name} expanded.`); }}
                  style={{
                    width: "100%", textAlign: "left", padding: "var(--s-2)",
                    border: "var(--border-hair)",
                    borderTop: active ? "1px solid var(--accent)" : "var(--border-hair)",
                    borderLeft: active ? "2px solid var(--accent)" : "var(--border-hair)",
                    background: active ? "var(--bg-2)" : "transparent",
                    color: "var(--fg)", cursor: "pointer",
                  }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)" }}>
                    {s.phase === "ingest" ? "INGEST" : "QUERY"} · {s.id}
                  </div>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: "13px" }}>{s.name}</div>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Active stage detail */}
      <article style={{ border: "var(--border-hair)", padding: "var(--s-3)" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)" }}>
              STAGE {stage.id} · {stage.phase === "ingest" ? "INGEST TIME (once per document)" : "QUERY TIME (every analysis)"}
            </div>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", margin: "4px 0" }}>{stage.name}</h3>
          </div>
          <code style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-dim)" }}>{stage.sourceFilePath}</code>
        </header>

        <p style={{ fontFamily: "var(--font-serif)", fontSize: "13px", color: "var(--fg-dim)", marginTop: 4 }}>{stage.oneLiner}</p>

        <Section title="INPUT">
          <Pre>{stringify(stageSample.input)}</Pre>
        </Section>
        <Section title="OUTPUT">
          <Pre>{stringify(stageSample.output)}</Pre>
        </Section>
        <Section title="THE ONE DECISION">
          <p style={{ fontFamily: "var(--font-serif)", fontSize: "13px", color: "var(--fg)" }}>{stage.theOneDecision}</p>
        </Section>
        {stage.configConstants && (
          <Section title="CONFIG CONSTANTS">
            <ul style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>
              {stage.configConstants.map((c) => (
                <li key={c.key}><span style={{ color: "var(--accent-dim)" }}>{c.key}</span> = <span style={{ color: "var(--fg)" }}>{c.value}</span></li>
              ))}
            </ul>
          </Section>
        )}
        {stage.crossRef && (
          <Section title="WHERE IT SURFACES IN THE PRODUCT">
            <p style={{ fontFamily: "var(--font-serif)", fontSize: "13px", color: "var(--fg-dim)" }}>{stage.crossRef.hint}</p>
            <button type="button"
              onClick={() => openInMode(stage.crossRef!.mode, stage.crossRef!.refId)}
              style={{
                marginTop: 6, fontFamily: "var(--font-mono)", fontSize: "10px",
                color: "var(--accent)", border: "var(--border-hair)",
                padding: "3px 6px", background: "transparent", cursor: "pointer", letterSpacing: "0.1em",
              }}>
              OPEN IN {stage.crossRef.mode.toUpperCase()}
            </button>
          </Section>
        )}

        {stage.id === 5 && (
          <EmbeddingCloud activeId={pointId} onSelect={(id) => { setPoint(id); }} />
        )}
      </article>
    </div>
  );
}

function DocumentCassette({ sample, onChange }: { sample: typeof SAMPLE_DOCS[number]; onChange: (id: typeof SAMPLE_DOCS[number]["id"]) => void }) {
  return (
    <div style={{ padding: "var(--s-3)", border: "var(--border-hair)", minWidth: 200 }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)", letterSpacing: "0.1em" }}>
        DOCUMENT
      </div>
      <select value={sample.id} onChange={(e) => onChange(e.target.value as typeof SAMPLE_DOCS[number]["id"])}
        style={{
          marginTop: 4, padding: "4px", background: "var(--bg-0)", color: "var(--fg)",
          border: "var(--border-hair)", fontFamily: "var(--font-mono)", fontSize: "12px", width: "100%",
        }}>
        {SAMPLE_DOCS.map((d) => (
          <option key={d.id} value={d.id}>{d.documentType} — {d.filename}</option>
        ))}
      </select>
      <div style={{ marginTop: 6, fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--fg-dim)" }}>
        {sample.sizeLabel} · type: {sample.documentType}
      </div>
    </div>
  );
}

function EmbeddingCloud({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  return (
    <div style={{ marginTop: "var(--s-4)" }}>
      <Section title="EMBEDDING CLOUD (ILLUSTRATIVE)">
        <svg viewBox="0 0 100 90" width="100%" style={{ maxWidth: 320, border: "var(--border-hair)" }} role="img" aria-label="precomputed chunk embedding cloud">
          {EMBEDDING_CLOUD_POINTS.map((p) => (
            <g key={p.id} role="button" tabIndex={0}
              onClick={() => onSelect(p.id)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(p.id); } }}
              style={{ cursor: "pointer" }}>
              <circle cx={p.x} cy={p.y} r={p.id === activeId ? 1.8 : 1.2}
                fill={p.id === activeId ? "var(--fg)" : POINT_COLOR[p.docType]}
                stroke={p.id === activeId ? "var(--accent)" : "none"}
                strokeWidth={p.id === activeId ? 0.4 : 0} />
            </g>
          ))}
        </svg>
        <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "12px", color: "var(--fg-dim)", marginTop: 6 }}>
          Precomputed projection of 30 sample chunk embeddings. Panel does not run MiniLM or dimensionality reduction.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: "var(--s-3)" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--fg-mute)", letterSpacing: "0.12em", marginBottom: 4 }}>{title}</div>
      {children}
    </section>
  );
}

function Pre({ children }: { children: React.ReactNode }) {
  return (
    <pre style={{
      fontFamily: "var(--font-mono)", fontSize: "11px",
      background: "var(--bg-0)", border: "var(--border-hair)",
      padding: "var(--s-2)", whiteSpace: "pre-wrap", color: "var(--fg-dim)", margin: 0,
    }}>{children}</pre>
  );
}

function stringify(v: string | Array<string | number>): string {
  if (Array.isArray(v)) return v.map(String).join("\n");
  return v;
}
