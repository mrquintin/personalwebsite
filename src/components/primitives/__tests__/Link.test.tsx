import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Link from "../Link";

describe("Link", () => {
  it("renders with default props (underline, internal)", () => {
    render(<Link href="/about">About</Link>);
    const a = screen.getByRole("link", { name: "About" });
    expect(a.getAttribute("href")).toBe("/about");
    expect(a.className).toContain("p-link");
    expect(a.className).toContain("p-link--underline");
    expect(a.getAttribute("target")).toBeNull();
  });

  it("renders subtle variant", () => {
    render(
      <Link href="/x" variant="subtle">
        x
      </Link>,
    );
    const a = screen.getByRole("link", { name: "x" });
    expect(a.className).toContain("p-link--subtle");
  });

  it("external link gets target=_blank, rel=noopener noreferrer, and ↗ glyph", () => {
    render(
      <Link href="https://example.com" external>
        Example
      </Link>,
    );
    const a = screen.getByRole("link");
    expect(a.getAttribute("target")).toBe("_blank");
    expect(a.getAttribute("rel")).toBe("noopener noreferrer");
    expect(a.textContent).toContain("↗");
    const ext = a.querySelector(".p-link__ext");
    expect(ext).not.toBeNull();
    expect(ext?.getAttribute("aria-hidden")).toBe("true");
  });

  it("supports keyboard focus", () => {
    render(<Link href="/about">About</Link>);
    const a = screen.getByRole("link");
    a.focus();
    expect(document.activeElement).toBe(a);
  });
});
