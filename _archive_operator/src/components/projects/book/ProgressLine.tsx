type Props = { words: number; target: number; msVersion: number };

function bar(pct: number, width = 30): string {
  const filled = Math.round((pct / 100) * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}

export default function ProgressLine({ words, target, msVersion }: Props) {
  const pct = Math.round((words / target) * 100);
  return (
    <div style={{
      fontFamily: "var(--font-mono)", color: "var(--fg)",
      borderTop: "var(--border-hair)", borderBottom: "var(--border-hair)",
      padding: "var(--s-3) 0", margin: "var(--s-6) 0",
    }}>
      {bar(pct)} {" "}
      <span>{words.toLocaleString()} / {target.toLocaleString()} words</span>
      <span style={{ color: "var(--fg-mute)" }}> · ms v{msVersion}</span>
    </div>
  );
}
