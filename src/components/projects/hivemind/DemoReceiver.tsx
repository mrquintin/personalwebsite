"use client";
import type { DemoSource } from "@/content/projects/hivemind/demo";

export default function DemoReceiver({ source }: { source: DemoSource }) {
  if (source.kind === "video") {
    return (
      <div style={{ aspectRatio: "16/9", border: "var(--border-hair)" }}>
        <video src={source.src} poster={source.poster} muted autoPlay loop playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }
  if (source.kind === "iframe") {
    return (
      <div style={{ aspectRatio: "16/9", border: "var(--border-hair)" }}>
        <iframe src={source.src} title="Hivemind demo" style={{ width: "100%", height: "100%", border: 0 }} />
      </div>
    );
  }
  return (
    <div
      role="figure"
      aria-label="demo pending"
      style={{
        aspectRatio: "16/9",
        border: "var(--border-hair)",
        display: "grid", placeItems: "center",
        fontFamily: "var(--font-mono)", color: "var(--fg-mute)",
        textAlign: "center", whiteSpace: "pre",
      }}
    >
{`┌───────────────────────────────────────────────────────┐
│                                                       │
│                ${source.message.padEnd(40, " ")}│
│                                                       │
│   (this surface will mount a live iframe or           │
│    looping walkthrough when available)                │
│                                                       │
└───────────────────────────────────────────────────────┘`}
    </div>
  );
}
