import type { CSSProperties, ReactNode } from "react";
import styles from "./Container.module.css";

type ContainerSize = "narrow" | "base" | "wide";

type ContainerProps = {
  children: ReactNode;
  size?: ContainerSize;
  as?: "div" | "section" | "article" | "main" | "header" | "footer";
  className?: string;
  style?: CSSProperties;
  role?: string;
  "aria-label"?: string;
};

export default function Container({
  children,
  size = "base",
  as: Tag = "div",
  className,
  style,
  role,
  "aria-label": ariaLabel,
}: ContainerProps) {
  const cls = [styles.container, styles[size], className]
    .filter(Boolean)
    .join(" ");
  return (
    <Tag className={cls} style={style} role={role} aria-label={ariaLabel}>
      {children}
    </Tag>
  );
}
