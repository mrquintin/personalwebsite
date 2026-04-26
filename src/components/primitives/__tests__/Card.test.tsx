import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Card from "../Card";

describe("Card", () => {
  it("renders title and body without href (no link)", () => {
    render(
      <Card title="Hivemind" meta="v2">
        Body copy
      </Card>,
    );
    expect(screen.getByText("Hivemind")).toBeTruthy();
    expect(screen.getByText("v2")).toBeTruthy();
    expect(screen.getByText("Body copy")).toBeTruthy();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("renders without meta", () => {
    render(<Card title="Solo">body</Card>);
    expect(screen.getByText("Solo")).toBeTruthy();
  });

  it("wraps the card in a Link when href is provided", () => {
    render(
      <Card href="/projects/hive" title="Hivemind">
        body
      </Card>,
    );
    const a = screen.getByRole("link");
    expect(a.getAttribute("href")).toBe("/projects/hive");
    const card = a.querySelector(".p-card")!;
    expect(card.className).toContain("p-card--link");
  });

  it("supports keyboard focus on the link variant", () => {
    render(
      <Card href="/x" title="t">
        b
      </Card>,
    );
    const a = screen.getByRole("link") as HTMLElement;
    a.focus();
    expect(document.activeElement).toBe(a);
  });
});
