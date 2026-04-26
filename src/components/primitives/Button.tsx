import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "solid" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";
type ButtonTone = "neutral" | "accent" | "danger";

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  tone?: ButtonTone;
  loading?: boolean;
  children: ReactNode;
};

export default function Button({
  variant = "outline",
  size = "md",
  tone = "neutral",
  loading = false,
  className,
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const cls = [
    "p-btn",
    `p-btn--${variant}`,
    `p-btn--${size}`,
    `p-btn--${tone}`,
    loading ? "p-btn--loading" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      type={rest.type ?? "button"}
      className={cls}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? "..." : children}
    </button>
  );
}
