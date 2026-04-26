import type { HTMLAttributes, ReactNode } from "react";

type BadgeTone = "neutral" | "accent" | "warn" | "ok";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  children: ReactNode;
};

export default function Badge({
  tone = "neutral",
  className,
  children,
  ...rest
}: BadgeProps) {
  const cls = ["p-badge", `p-badge--${tone}`, className].filter(Boolean).join(" ");
  return (
    <span className={cls} {...rest}>
      {children}
    </span>
  );
}
