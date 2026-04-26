import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Badge from "../Badge";

describe("Badge", () => {
  it("renders with default tone=neutral", () => {
    render(<Badge>live</Badge>);
    const el = screen.getByText("live");
    expect(el.className).toContain("p-badge");
    expect(el.className).toContain("p-badge--neutral");
  });

  it.each(["neutral", "accent", "warn", "ok"] as const)("renders tone=%s", (tone) => {
    render(<Badge tone={tone}>{tone}</Badge>);
    const el = screen.getByText(tone);
    expect(el.className).toContain(`p-badge--${tone}`);
  });

  it("supports keyboard focus when given tabIndex", () => {
    render(<Badge tabIndex={0}>focusable</Badge>);
    const el = screen.getByText("focusable") as HTMLElement;
    el.focus();
    expect(document.activeElement).toBe(el);
  });
});
