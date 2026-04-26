import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SimplePresentation from "../SimplePresentation";
import type { Phase } from "../types";

function makePhases(count: number): Phase[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `p${i + 1}`,
    heading: `Heading ${i + 1}`,
    body: <p>Body {i + 1}</p>,
  }));
}

function mockReducedMotion(reduced: boolean) {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: reduced && query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

describe("SimplePresentation", () => {
  beforeEach(() => {
    // Use reduced-motion mock so transitions are instant in tests.
    mockReducedMotion(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders phase 1 by default", () => {
    render(<SimplePresentation id="d1" title="Demo" phases={makePhases(3)} />);
    expect(screen.getByText("Heading 1")).toBeTruthy();
    expect(screen.getByText("phase 1 of 3")).toBeTruthy();
    expect(screen.getByRole("region", { name: "Demo" })).toBeTruthy();
  });

  it("disables previous on first phase and next on last phase", () => {
    render(<SimplePresentation id="d1" title="Demo" phases={makePhases(3)} />);
    const prev = screen.getByRole("button", { name: /previous/i });
    expect(prev.hasAttribute("disabled")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByText("phase 3 of 3")).toBeTruthy();
    const nextBtn = screen.getByRole("button", { name: /next/i });
    expect(nextBtn.hasAttribute("disabled")).toBe(true);
  });

  it("navigates with click on next/previous", () => {
    render(<SimplePresentation id="d1" title="Demo" phases={makePhases(4)} />);
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText("Heading 2")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /previous/i }));
    expect(screen.getByText("Heading 1")).toBeTruthy();
  });

  it("navigates with arrow keys", () => {
    render(<SimplePresentation id="d1" title="Demo" phases={makePhases(4)} />);
    const region = screen.getByRole("region", { name: "Demo" });
    fireEvent.keyDown(region, { key: "ArrowRight" });
    expect(screen.getByText("Heading 2")).toBeTruthy();
    fireEvent.keyDown(region, { key: "ArrowRight" });
    expect(screen.getByText("Heading 3")).toBeTruthy();
    fireEvent.keyDown(region, { key: "ArrowLeft" });
    expect(screen.getByText("Heading 2")).toBeTruthy();
  });

  it("jumps to phase via 1..5 keys", () => {
    render(<SimplePresentation id="d1" title="Demo" phases={makePhases(5)} />);
    const region = screen.getByRole("region", { name: "Demo" });
    fireEvent.keyDown(region, { key: "4" });
    expect(screen.getByText("Heading 4")).toBeTruthy();
    fireEvent.keyDown(region, { key: "1" });
    expect(screen.getByText("Heading 1")).toBeTruthy();
  });

  it("jumps to phase via dot click", () => {
    render(<SimplePresentation id="d1" title="Demo" phases={makePhases(4)} />);
    const dots = screen.getAllByRole("tab");
    expect(dots).toHaveLength(4);
    fireEvent.click(dots[2]);
    expect(screen.getByText("Heading 3")).toBeTruthy();
    expect(dots[2].getAttribute("aria-selected")).toBe("true");
  });

  it("throws when phases.length < 3", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(<SimplePresentation id="d1" title="Demo" phases={makePhases(2)} />),
    ).toThrow(/phases\.length must be 3-5/);
    errorSpy.mockRestore();
  });

  it("throws when phases.length > 5", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(<SimplePresentation id="d1" title="Demo" phases={makePhases(6)} />),
    ).toThrow(/phases\.length must be 3-5/);
    errorSpy.mockRestore();
  });

  it("moves focus to the phase heading on advance", () => {
    render(<SimplePresentation id="d1" title="Demo" phases={makePhases(3)} />);
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    const heading = screen.getByText("Heading 2");
    expect(document.activeElement).toBe(heading);
  });

  it("phase region has aria-live polite", () => {
    const { container } = render(
      <SimplePresentation id="d1" title="Demo" phases={makePhases(3)} />,
    );
    const live = container.querySelector('[aria-live="polite"]');
    expect(live).toBeTruthy();
  });
});
