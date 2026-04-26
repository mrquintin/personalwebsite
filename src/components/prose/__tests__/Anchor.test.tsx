import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Anchor from "../Anchor";

describe("Anchor", () => {
  it("renders an h2 with the given id", () => {
    const { container } = render(<Anchor id="approach">Approach</Anchor>);
    const h = container.querySelector("h2")! as HTMLElement;
    expect(h).not.toBeNull();
    expect(h.id).toBe("approach");
  });

  it("renders a leading section sigil and the label", () => {
    render(<Anchor id="goals">Goals</Anchor>);
    expect(screen.getByText("§")).toBeTruthy();
    expect(screen.getByText("Goals")).toBeTruthy();
  });

  it("renders a copy-link button targeting the anchor", () => {
    render(<Anchor id="why">Why</Anchor>);
    const btn = screen.getByRole("button", { name: /copy link to why/i });
    expect(btn.textContent).toBe("#");
  });
});
