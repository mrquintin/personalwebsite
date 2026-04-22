import type { WorkflowStep } from "@/content/projects/hivemind/workflow";

export default function WorkflowStrip({ steps }: { steps: WorkflowStep[] }) {
  return (
    <div
      style={{
        display: "flex", gap: "var(--s-5)",
        overflowX: "auto", scrollSnapType: "x mandatory",
        paddingBottom: "var(--s-3)",
      }}
    >
      {steps.map((s) => (
        <div
          key={s.n}
          style={{
            scrollSnapAlign: "start",
            minWidth: 240, flex: "0 0 240px",
            border: "var(--border-hair)", padding: "var(--s-4)",
            fontFamily: "var(--font-mono)",
          }}
        >
          <div style={{ color: "var(--accent-dim)" }}>{String(s.n).padStart(2, "0")}</div>
          <div style={{ color: "var(--fg)", margin: "var(--s-2) 0" }}>{s.label}</div>
          <div style={{ color: "var(--fg-dim)", fontSize: "var(--t-xs-size)" }}>{s.blurb}</div>
          <div style={{ marginTop: "var(--s-3)", color: "var(--fg-mute)", fontSize: "var(--t-xxs-size)" }}>
            {s.inputs ? `> ${s.inputs} ` : ""}{s.outputs ? `< ${s.outputs}` : ""}
          </div>
        </div>
      ))}
    </div>
  );
}
