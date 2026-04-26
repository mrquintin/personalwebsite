import type { CSSProperties, ReactNode } from "react";

type SpaceStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
type Align = "start" | "center" | "end" | "baseline" | "stretch";
type Justify = "start" | "center" | "end" | "space-between" | "space-around";

type ClusterProps = {
  children: ReactNode;
  gap?: SpaceStep;
  align?: Align;
  justify?: Justify;
  as?: "div" | "section" | "nav" | "header" | "footer" | "ul" | "ol";
  className?: string;
  style?: CSSProperties;
};

export default function Cluster({
  children,
  gap = 3,
  align = "center",
  justify = "start",
  as: Tag = "div",
  className,
  style,
}: ClusterProps) {
  return (
    <Tag
      className={className}
      style={{
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        gap: `var(--s-${gap})`,
        alignItems: align,
        justifyContent: justify,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
