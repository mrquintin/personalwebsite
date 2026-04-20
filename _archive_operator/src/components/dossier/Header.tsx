import ClassificationBanner from "./ClassificationBanner";
import type { Classification } from "@/lib/dossier/types";

type Props = {
  code: string;
  title: string;
  tagline: string;
  breadcrumb: string;
  classification?: Classification;
  rightAction?: React.ReactNode;
};

export default function DossierHeader({
  code, title, tagline, breadcrumb, classification = "public", rightAction,
}: Props) {
  return (
    <header className="dossier-header">
      <div className="dossier-rule">
        <span style={{ fontFamily: "var(--font-mono)" }}>
          ─── DOSSIER :: <span style={{ color: "var(--fg-dim)" }}>{code}</span>
          {" · "}
          <span className="dossier-title">{title}</span>
        </span>
        <ClassificationBanner value={classification} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span className="dossier-bread" style={{ fontFamily: "var(--font-mono)" }}>{breadcrumb}</span>
        {rightAction && <div data-affordance>{rightAction}</div>}
      </div>
      <div className="dossier-sub">{tagline}</div>
    </header>
  );
}
