import { ImageResponse } from "next/og";
import identity from "@/content/about/identity";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `About — ${identity.name}`;

const BG = "#0c0e10";
const FG = "#e8e6e1";
const ACCENT = "#c9a96e";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: BG,
          color: FG,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 96,
            lineHeight: 1.05,
            color: FG,
            letterSpacing: "-0.01em",
          }}
        >
          {identity.name}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 56,
            lineHeight: 1.2,
            color: FG,
            maxWidth: "90%",
          }}
        >
          {identity.tagline}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 26,
            color: ACCENT,
            letterSpacing: "0.04em",
          }}
        >
          <span>about</span>
          <span style={{ fontSize: 56 }}>↗</span>
        </div>
      </div>
    ),
    size,
  );
}
