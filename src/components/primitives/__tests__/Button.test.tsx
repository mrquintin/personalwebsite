import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Button from "../Button";

describe("Button", () => {
  it("renders with default props (outline / md / neutral)", () => {
    render(<Button>Run</Button>);
    const btn = screen.getByRole("button", { name: "Run" });
    expect(btn.className).toContain("p-btn");
    expect(btn.className).toContain("p-btn--outline");
    expect(btn.className).toContain("p-btn--md");
    expect(btn.className).toContain("p-btn--neutral");
    expect(btn.getAttribute("type")).toBe("button");
  });

  it.each(["solid", "outline", "ghost"] as const)("renders variant=%s", (variant) => {
    render(<Button variant={variant}>{variant}</Button>);
    const btn = screen.getByRole("button", { name: variant });
    expect(btn.className).toContain(`p-btn--${variant}`);
  });

  it.each(["sm", "md", "lg"] as const)("renders size=%s", (size) => {
    render(<Button size={size}>{size}</Button>);
    const btn = screen.getByRole("button", { name: size });
    expect(btn.className).toContain(`p-btn--${size}`);
  });

  it.each(["neutral", "accent", "danger"] as const)("renders tone=%s", (tone) => {
    render(<Button tone={tone}>{tone}</Button>);
    const btn = screen.getByRole("button", { name: tone });
    expect(btn.className).toContain(`p-btn--${tone}`);
  });

  it("renders ellipsis (not spinner) when loading", () => {
    render(<Button loading>Save</Button>);
    const btn = screen.getByRole("button");
    expect(btn.textContent).toBe("...");
    expect(btn.getAttribute("aria-busy")).toBe("true");
    expect(btn.hasAttribute("disabled")).toBe(true);
    expect(btn.querySelector("svg")).toBeNull();
  });

  it("focuses on keyboard focus (focus-visible simulated)", () => {
    render(<Button>Focus me</Button>);
    const btn = screen.getByRole("button", { name: "Focus me" });
    btn.focus();
    expect(document.activeElement).toBe(btn);
  });
});
