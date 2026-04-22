import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Michael Quintin";

export default function OG() {
  return new ImageResponse(
    (
      <div style={{
        width: "100%", height: "100%",
        background: "#1f1f1f", color: "#eaeaea",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: 64,
        fontFamily: "monospace",
      }}>
        <div style={{ fontSize: 24, color: "#888" }}>michael quintin</div>
        <div style={{ fontSize: 96, lineHeight: 1, color: "#fff" }}>
          ABT · About
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 22, color: "#888" }}>personalwebsite-beta-nine.vercel.app</div>
          <div style={{ width: 240, height: 6, background: "#d18b3a" }} />
        </div>
      </div>
    ),
    size,
  );
}
