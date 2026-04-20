"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { COPY } from "@/content/microcopy";
import progress from "@/content/projects/purposeless-efficiency/progress";

function formatBreadcrumb(path: string): string {
  if (path === "/") return "~/index";
  const parts = path.split("/").filter(Boolean);
  return "~/" + parts.join("/") + "/README";
}

function utcNow(): string {
  const d = new Date();
  return d.toISOString().slice(11, 19) + " UTC";
}

type Props = { buildVersion: string };

export default function StatusBar({ buildVersion }: Props) {
  const path = usePathname() ?? "/";
  const [time, setTime] = useState(() => (typeof window === "undefined" ? "--:--:-- UTC" : utcNow()));
  const [tickerIdx, setTickerIdx] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setTime(utcNow()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTickerIdx((i) => (i + 1) % COPY.ticker.length), 8000);
    return () => clearInterval(t);
  }, []);

  // session resumed flash
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const wasShown = sessionStorage.getItem("operator.boot.shown");
      if (wasShown === "true") {
        setFlash(COPY.sessionResumed);
        const t = setTimeout(() => setFlash(null), 800);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  return (
    <footer
      className="status-bar"
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        height: "var(--statusbar-h)",
        background: "var(--bg-0)",
        borderTop: "var(--border-hair)",
        color: "var(--fg-mute)",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--t-xs-size)",
        lineHeight: "var(--statusbar-h)",
        zIndex: "var(--z-statusbar)" as unknown as number,
        display: "flex",
        gap: "var(--s-4)",
        padding: "0 var(--s-4)",
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
    >
      <span style={{ color: "var(--fg-dim)" }}>{formatBreadcrumb(path)}</span>
      <span aria-hidden="true">│</span>
      <span>{time}</span>
      <span aria-hidden="true">│</span>
      <span style={{ color: "var(--fg-dim)" }}>
        {(() => {
          if (flash) return flash;
          if (path === "/purposeless-efficiency") {
            const pct = Math.round((progress.words / progress.target) * 100);
            return `PRP · ${progress.words.toLocaleString()} / ${progress.target.toLocaleString()} (${pct}%)`;
          }
          return COPY.ticker[tickerIdx];
        })()}
      </span>
      <span style={{ marginLeft: "auto" }}>
        <span>{COPY.paletteHint}</span>
        <span aria-hidden="true" style={{ margin: "0 var(--s-3)" }}>│</span>
        <span>{COPY.helpHint}</span>
        <span aria-hidden="true" style={{ margin: "0 var(--s-3)" }}>│</span>
        <span>v{buildVersion}</span>
      </span>
    </footer>
  );
}
