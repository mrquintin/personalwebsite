import type { CSSProperties, ReactNode } from "react";

type SpaceStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

type StackProps = {
  children: ReactNode;
  gap?: SpaceStep;
  as?: "div" | "section" | "article" | "ul" | "ol" | "nav" | "header" | "footer" | "main";
  className?: string;
  style?: CSSProperties;
};

export default function Stack({
  children,
  gap = 4,
  as: Tag = "div",
  className,
  style,
}: StackProps) {
  return (
    <Tag
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: `var(--s-${gap})`,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
