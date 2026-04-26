import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

type SurfaceTone = "base" | "mute" | "raise";
type SpacingToken = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type SurfaceProps = HTMLAttributes<HTMLElement> & {
  tone?: SurfaceTone;
  padding?: SpacingToken;
  border?: boolean;
  children: ReactNode;
};

export default function Surface({
  tone = "base",
  padding = 5,
  border = false,
  className,
  style,
  children,
  ...rest
}: SurfaceProps) {
  const cls = [
    "p-surface",
    `p-surface--${tone}`,
    border ? "p-surface--bordered" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const mergedStyle: CSSProperties = {
    padding: `var(--s-${padding})`,
    ...style,
  };

  return (
    <section className={cls} style={mergedStyle} {...rest}>
      {children}
    </section>
  );
}
