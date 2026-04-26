import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import Aside from "../Aside";

describe("Aside", () => {
  it("renders a Surface with mute tone, border, and padding=5", () => {
    const { container } = render(<Aside tone="note">copy</Aside>);
    const surface = container.querySelector("section.p-surface")!;
    expect(surface).not.toBeNull();
    expect(surface.className).toContain("p-surface--mute");
    expect(surface.className).toContain("p-surface--bordered");
    expect((surface as HTMLElement).style.padding).toContain("--s-5");
    expect(surface.className).toContain("p-aside");
  });

  it.each([
    ["note", "NOTE"],
    ["warn", "WARN"],
    ["voice", "VOICE"],
  ] as const)("renders tone=%s with label %s", (tone, label) => {
    const { container } = render(<Aside tone={tone}>x</Aside>);
    const lbl = container.querySelector(".p-aside__label")! as HTMLElement;
    expect(lbl.textContent).toBe(label);
    expect(lbl.dataset.tone).toBe(tone);
    expect(container.querySelector(`.p-aside--${tone}`)).not.toBeNull();
  });

  it("defaults to note tone", () => {
    const { container } = render(<Aside>x</Aside>);
    const lbl = container.querySelector(".p-aside__label")! as HTMLElement;
    expect(lbl.textContent).toBe("NOTE");
  });

  it("renders body content", () => {
    const { container } = render(
      <Aside tone="voice">first-person commentary</Aside>,
    );
    const body = container.querySelector(".p-aside__body")!;
    expect(body.textContent).toBe("first-person commentary");
  });
});
