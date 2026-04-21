// Manual OG image route — Next's metadata-file convention loader breaks
// on filesystem paths with an apostrophe ("Michael's MacBook Pro").
// Wired into <metadata.openGraph.images> in app/layout.tsx as /api/og.
import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%",
          background: "#0a0a0a",
          color: "#efe9dc",
          padding: 72,
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <svg width="36" height="36" viewBox="0 0 22 22" fill="none" stroke="#efe9dc" strokeWidth="1.2">
            <path d="M11 1 L20.09 6 L20.09 16 L11 21 L1.91 16 L1.91 6 Z"/>
            <circle cx="11" cy="11" r="1.4" fill="#efe9dc"/>
            <circle cx="6"  cy="7"  r="1.1" fill="#efe9dc"/>
            <circle cx="16" cy="7"  r="1.1" fill="#efe9dc"/>
            <circle cx="6"  cy="15" r="1.1" fill="#efe9dc"/>
            <circle cx="16" cy="15" r="1.1" fill="#efe9dc"/>
          </svg>
          <span style={{ fontSize: 28, letterSpacing: -0.6 }}>The Nash Lab</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 96, lineHeight: 1.0, letterSpacing: -2 }}>Strategic thinking,</span>
          <span style={{ fontSize: 96, lineHeight: 1.0, letterSpacing: -2, fontStyle: "italic", color: "#c4b6e0" }}>democratized.</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 22, color: "#8a857a", letterSpacing: 1 }}>nashlab.ai</span>
          <span style={{ fontSize: 16, color: "#8a857a", letterSpacing: 2, textTransform: "uppercase" }}>Hivemind</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
