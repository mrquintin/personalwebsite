import type { Metadata } from "next";
import ColorSwatch from "@/components/styleguide/ColorSwatch";
import MotionDemo from "@/components/styleguide/MotionDemo";
import PrimitiveGallery from "@/components/styleguide/PrimitiveGallery";
import SpacingRuler from "@/components/styleguide/SpacingRuler";
import ThemeToggle from "@/components/styleguide/ThemeToggle";
import TypeSpecimen from "@/components/styleguide/TypeSpecimen";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const TYPE_ROLES: Array<{
  utility: string;
  size: string;
  lineHeight: string;
}> = [
  { utility: "t-headline", size: "48px", lineHeight: "56px" },
  { utility: "t-h1", size: "36px", lineHeight: "44px" },
  { utility: "t-h2", size: "28px", lineHeight: "36px" },
  { utility: "t-h3", size: "22px", lineHeight: "32px" },
  { utility: "t-prose", size: "16px", lineHeight: "26px" },
  { utility: "t-mono-body", size: "16px", lineHeight: "26px" },
  { utility: "t-meta", size: "13px", lineHeight: "20px" },
  { utility: "t-code", size: "13px", lineHeight: "20px" },
];

const COLOR_GROUPS: Array<{
  heading: string;
  tokens: Array<{ token: string; description?: string }>;
}> = [
  {
    heading: "surface",
    tokens: [
      { token: "--bg", description: "base background" },
      { token: "--bg-mute", description: "muted surface" },
      { token: "--bg-raise", description: "raised surface (cards)" },
      { token: "--bg-overlay", description: "modal overlay" },
    ],
  },
  {
    heading: "foreground",
    tokens: [
      { token: "--fg", description: "primary text" },
      { token: "--fg-mute", description: "secondary text" },
      { token: "--fg-faint", description: "tertiary text" },
      { token: "--fg-inverse", description: "text on accent surface" },
    ],
  },
  {
    heading: "borders + dividers",
    tokens: [
      { token: "--line", description: "hairline" },
      { token: "--line-strong", description: "emphatic border" },
    ],
  },
  {
    heading: "accent",
    tokens: [
      { token: "--accent", description: "primary accent" },
      { token: "--accent-mute", description: "hover wash" },
      { token: "--accent-fg", description: "text on accent" },
    ],
  },
  {
    heading: "status",
    tokens: [
      { token: "--warn", description: "warning" },
      { token: "--error", description: "error / danger" },
      { token: "--ok", description: "success" },
    ],
  },
];

const SPACING: Array<{ step: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10; pixels: number }> = [
  { step: 1, pixels: 4 },
  { step: 2, pixels: 8 },
  { step: 3, pixels: 12 },
  { step: 4, pixels: 16 },
  { step: 5, pixels: 24 },
  { step: 6, pixels: 32 },
  { step: 7, pixels: 48 },
  { step: 8, pixels: 64 },
  { step: 9, pixels: 96 },
  { step: 10, pixels: 128 },
];

const MOTION: Array<{ token: string; durationMs: number; description: string }> = [
  { token: "--d-instant", durationMs: 0, description: "Theme toggle, value swap." },
  { token: "--d-tap", durationMs: 80, description: "Button press feedback." },
  { token: "--d-fast", durationMs: 160, description: "Focus ring, hover state." },
  { token: "--d-norm", durationMs: 280, description: "Page transition fade." },
  { token: "--d-slow", durationMs: 480, description: "Chat message arrival." },
];

function SectionHeader({
  number,
  title,
  framing,
  children,
}: {
  number: string;
  title: string;
  framing: string;
  children?: React.ReactNode;
}) {
  return (
    <header
      style={{
        marginBottom: "var(--s-5)",
        paddingBottom: "var(--s-4)",
        borderBottom: "var(--border-hair)",
      }}
    >
      <div
        className="t-meta"
        style={{ marginBottom: "var(--s-2)" }}
      >
        {number}
      </div>
      <h2 className="t-h2" style={{ margin: 0 }}>
        {title}
      </h2>
      <p
        style={{
          fontFamily: "var(--t-serif)",
          fontSize: "var(--t-base-size)",
          lineHeight: "var(--t-base-lh)",
          color: "var(--fg-mute)",
          maxWidth: "var(--measure-prose)",
          marginTop: "var(--s-3)",
          marginBottom: 0,
        }}
      >
        {framing}
      </p>
      {children}
    </header>
  );
}

export default function StyleguidePage() {
  return (
    <div
      className="dossier"
      style={{ paddingTop: "var(--s-7)", paddingBottom: "var(--s-9)" }}
    >
      <header style={{ marginBottom: "var(--s-8)" }}>
        <div className="t-meta">design system reference</div>
        <h1 className="t-headline" style={{ margin: "var(--s-2) 0 0" }}>
          Styleguide
        </h1>
        <p
          style={{
            fontFamily: "var(--t-serif)",
            fontSize: "var(--t-md-size)",
            lineHeight: "var(--t-md-lh)",
            color: "var(--fg-mute)",
            maxWidth: "var(--measure-prose)",
            marginTop: "var(--s-4)",
          }}
        >
          Live reference for every type role, color pair, spacing increment,
          motion duration, and primitive in the v2 system. This page is a
          developer tool and is intentionally absent from the public navigation.
        </p>
      </header>

      <section
        id="typography"
        style={{ marginBottom: "var(--s-9)" }}
        aria-labelledby="sg-typography"
      >
        <SectionHeader
          number="01 / typography"
          title="Typography"
          framing="Two faces only — mono for technical content and headlines, serif for long-form prose. Each utility class below is a role, not a size: pick by intent (heading, prose, meta) per principle 6 (Mono is the body face for technical content; serif for long-form narrative)."
        />
        <div>
          {TYPE_ROLES.map((r) => (
            <TypeSpecimen
              key={r.utility}
              utility={r.utility}
              size={r.size}
              lineHeight={r.lineHeight}
            />
          ))}
        </div>
      </section>

      <section
        id="color"
        style={{ marginBottom: "var(--s-9)" }}
        aria-labelledby="sg-color"
      >
        <SectionHeader
          number="02 / color"
          title="Color"
          framing="Both palettes are designed, not derived. Toggle the theme to verify each token has a designed counterpart per principle 7 (Dark is default; light is supported). Contrast ratios below reference WCAG; 4.5:1 clears AA for normal text, 3:1 for large text."
        >
          <div style={{ marginTop: "var(--s-4)" }}>
            <ThemeToggle />
          </div>
        </SectionHeader>

        {COLOR_GROUPS.map((group) => (
          <div key={group.heading} style={{ marginBottom: "var(--s-6)" }}>
            <h3
              className="t-meta"
              style={{ marginBottom: "var(--s-3)" }}
            >
              {group.heading}
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "var(--s-3)",
              }}
            >
              {group.tokens.map((t) => (
                <ColorSwatch
                  key={t.token}
                  token={t.token}
                  description={t.description}
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      <section
        id="spacing"
        style={{ marginBottom: "var(--s-9)" }}
        aria-labelledby="sg-spacing"
      >
        <SectionHeader
          number="03 / spacing"
          title="Spacing"
          framing="A single 4-pixel-grid scale of ten increments. Vertical rhythm between content blocks is always a multiple of --s-2 (8px). Reaching for an off-grid value usually means the content needs different roles, not different spacing — supports principle 4 (Words over widgets)."
        />
        <div>
          {SPACING.map((s) => (
            <SpacingRuler key={s.step} step={s.step} pixels={s.pixels} />
          ))}
        </div>
      </section>

      <section
        id="motion"
        style={{ marginBottom: "var(--s-9)" }}
        aria-labelledby="sg-motion"
      >
        <SectionHeader
          number="04 / motion"
          title="Motion"
          framing="Five durations, three curves, no decoration. Every animation answers a state-change question per principle 8 (Motion is functional, never decorative). Under prefers-reduced-motion every duration token collapses to zero — the play buttons still work but the transition completes instantly per principle 10 (Reduced motion is a first-class path)."
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "var(--s-3)",
          }}
        >
          {MOTION.map((m) => (
            <MotionDemo
              key={m.token}
              token={m.token}
              durationMs={m.durationMs}
              description={m.description}
            />
          ))}
        </div>
      </section>

      <section
        id="primitives"
        style={{ marginBottom: "var(--s-9)" }}
        aria-labelledby="sg-primitives"
      >
        <SectionHeader
          number="05 / primitives"
          title="Primitives"
          framing="The five reusable components Button, Link, Surface, Card, and Badge — each rendered with every variant. New code should compose these rather than reach for new wrappers, supporting principle 4 (Words over widgets) by keeping the widget vocabulary small."
        />
        <PrimitiveGallery />
      </section>
    </div>
  );
}
