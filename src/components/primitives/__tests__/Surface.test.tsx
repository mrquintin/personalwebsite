import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import Surface from "../Surface";

describe("Surface", () => {
  it("renders <section> with default tone=base, padding=5, no border", () => {
    const { container } = render(<Surface>hello</Surface>);
    const el = container.querySelector("section")!;
    expect(el).not.toBeNull();
    expect(el.className).toContain("p-surface");
    expect(el.className).toContain("p-surface--base");
    expect(el.className).not.toContain("p-surface--bordered");
    expect(el.style.padding).toContain("--s-5");
  });

  it.each(["base", "mute", "raise"] as const)("renders tone=%s", (tone) => {
    const { container } = render(<Surface tone={tone}>x</Surface>);
    const el = container.querySelector("section")!;
    expect(el.className).toContain(`p-surface--${tone}`);
  });

  it("applies border when border=true", () => {
    const { container } = render(<Surface border>x</Surface>);
    const el = container.querySelector("section")!;
    expect(el.className).toContain("p-surface--bordered");
  });

  it("applies padding token", () => {
    const { container } = render(<Surface padding={3}>x</Surface>);
    const el = container.querySelector("section")!;
    expect(el.style.padding).toContain("--s-3");
  });

  it("supports keyboard focus when given tabIndex", () => {
    const { container } = render(
      <Surface tabIndex={0}>focusable</Surface>,
    );
    const el = container.querySelector("section")! as HTMLElement;
    el.focus();
    expect(document.activeElement).toBe(el);
  });
});
