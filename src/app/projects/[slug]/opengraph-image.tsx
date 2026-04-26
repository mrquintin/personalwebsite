import { ImageResponse } from "next/og";
import identity from "@/content/about/identity";
import { getProjectMetadata } from "@/lib/projects/loader";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Project — Michael Quintin";

const BG = "#0c0e10";
const FG = "#e8e6e1";
const ACCENT = "#c9a96e";

const STATUS_LABEL: Record<string, string> = {
  exploration: "exploration",
  "in-progress": "in progress",
  shipped: "shipped",
};

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = await getProjectMetadata(slug);
  const title = meta?.title ?? "Project";
  const tagline = meta?.tagline ?? "";
  const status = meta ? STATUS_LABEL[meta.status] ?? meta.status : "";

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
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 28,
            color: ACCENT,
            letterSpacing: "0.04em",
          }}
        >
          <span>{identity.name.toLowerCase()}</span>
          {status ? (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 18px",
                border: `1px solid ${ACCENT}`,
                borderRadius: 999,
                fontSize: 22,
                color: ACCENT,
                textTransform: "lowercase",
                letterSpacing: "0.06em",
              }}
            >
              {status}
            </span>
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            maxWidth: "92%",
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
            {title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 40,
              lineHeight: 1.25,
              color: FG,
            }}
          >
            {tagline}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            fontSize: 56,
            color: ACCENT,
          }}
        >
          ↗
        </div>
      </div>
    ),
    size,
  );
}
