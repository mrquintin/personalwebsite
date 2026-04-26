"use client";

import { useEffect, useState } from "react";

export type ColorSwatchProps = {
  token: string;
  description?: string;
  pairs?: string[];
};

type Rgb = { r: number; g: number; b: number };

function hexToRgb(hex: string): Rgb | null {
  let h = hex.replace("#", "").trim();
  if (h.length === 8) h = h.slice(0, 6);
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (h.length !== 6) return null;
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function parseColor(value: string): Rgb | null {
  const v = value.trim();
  if (v.startsWith("#")) return hexToRgb(v);
  const m = v.match(/^rgba?\(([^)]+)\)$/i);
  if (m) {
    const parts = m[1].split(",").map((p) => parseFloat(p.trim()));
    if (parts.length >= 3) return { r: parts[0], g: parts[1], b: parts[2] };
  }
  return null;
}

function relativeLuminance({ r, g, b }: Rgb): number {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

function readToken(name: string): string {
  if (typeof window === "undefined") return "";
  const v = getComputedStyle(document.documentElement).getPropertyValue(name);
  return v.trim();
}

export default function ColorSwatch({
  token,
  description,
  pairs = ["--bg", "--bg-mute"],
}: ColorSwatchProps) {
  const [value, setValue] = useState<string>("");
  const [pairValues, setPairValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const read = () => {
      setValue(readToken(token));
      const next: Record<string, string> = {};
      for (const p of pairs) next[p] = readToken(p);
      setPairValues(next);
    };
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => obs.disconnect();
  }, [token, pairs]);

  const fgRgb = parseColor(value);
  return (
    <div
      style={{
        border: "var(--border-hair)",
        background: "var(--bg-raise)",
      }}
    >
      <div
        style={{
          height: 56,
          background: `var(${token})`,
          borderBottom: "var(--border-hair)",
        }}
        aria-hidden="true"
      />
      <div
        style={{
          padding: "var(--s-3)",
          fontFamily: "var(--t-mono)",
          fontSize: "var(--t-sm-size)",
          lineHeight: "var(--t-sm-lh)",
        }}
      >
        <div style={{ color: "var(--fg)" }}>{token}</div>
        <div style={{ color: "var(--fg-mute)", marginTop: "var(--s-1)" }}>
          {value || "—"}
        </div>
        {description ? (
          <div
            style={{
              color: "var(--fg-faint)",
              marginTop: "var(--s-1)",
              fontSize: "var(--t-sm-size)",
            }}
          >
            {description}
          </div>
        ) : null}
        <ul
          style={{
            margin: "var(--s-3) 0 0",
            padding: 0,
            listStyle: "none",
            color: "var(--fg-mute)",
            display: "grid",
            gap: 2,
          }}
        >
          {pairs.map((p) => {
            const bg = parseColor(pairValues[p] ?? "");
            const ratio = fgRgb && bg ? contrast(fgRgb, bg).toFixed(2) : "—";
            return (
              <li key={p}>
                vs {p}: <span style={{ color: "var(--fg)" }}>{ratio}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
