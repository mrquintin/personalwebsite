"use client";

import { useState } from "react";
import Button from "@/components/primitives/Button";

export type MotionDemoProps = {
  token: string;
  durationMs: number;
  description: string;
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function MotionDemo({
  token,
  durationMs,
  description,
}: MotionDemoProps) {
  const [playing, setPlaying] = useState(false);
  const reduced = typeof window !== "undefined" && prefersReducedMotion();
  const effective = reduced ? 0 : durationMs;

  function play() {
    setPlaying(false);
    requestAnimationFrame(() => {
      setPlaying(true);
      window.setTimeout(() => setPlaying(false), Math.max(effective, 16));
    });
  }

  return (
    <div
      style={{
        border: "var(--border-hair)",
        background: "var(--bg-raise)",
        padding: "var(--s-4)",
        display: "grid",
        gridTemplateRows: "auto 80px auto",
        gap: "var(--s-3)",
      }}
    >
      <header
        style={{
          fontFamily: "var(--t-mono)",
          fontSize: "var(--t-sm-size)",
          lineHeight: "var(--t-sm-lh)",
        }}
      >
        <div style={{ color: "var(--fg)" }}>{token}</div>
        <div style={{ color: "var(--fg-mute)" }}>{durationMs}ms</div>
        <div
          style={{
            color: "var(--fg-faint)",
            marginTop: "var(--s-1)",
          }}
        >
          {description}
        </div>
      </header>
      <div
        style={{
          position: "relative",
          background: "var(--bg-mute)",
          border: "1px solid var(--line)",
          overflow: "hidden",
        }}
        aria-hidden="true"
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 8,
            width: 24,
            height: 24,
            marginTop: -12,
            background: "var(--accent)",
            transform: playing ? "translateX(calc(100% + 200px))" : "translateX(0)",
            opacity: playing ? 1 : 0.6,
            transition: `transform ${effective}ms var(--ease-out), opacity ${effective}ms var(--ease-out)`,
          }}
        />
      </div>
      <Button onClick={play} variant="outline" size="sm" tone="accent">
        play
      </Button>
    </div>
  );
}
