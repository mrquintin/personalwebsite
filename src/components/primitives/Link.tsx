import NextLink from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type LinkVariant = "underline" | "subtle";

export type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children"> & {
  href: string;
  children: ReactNode;
  variant?: LinkVariant;
  external?: boolean;
};

export default function Link({
  href,
  children,
  variant = "underline",
  external = false,
  className,
  ...rest
}: LinkProps) {
  const cls = ["p-link", `p-link--${variant}`, className].filter(Boolean).join(" ");

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
        {...rest}
      >
        {children}
        <span aria-hidden="true" className="p-link__ext">
          {"↗"}
        </span>
      </a>
    );
  }

  return (
    <NextLink href={href} className={cls} {...rest}>
      {children}
    </NextLink>
  );
}
