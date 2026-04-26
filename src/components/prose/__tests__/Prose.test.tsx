import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import Prose from "../Prose";
import Anchor from "../Anchor";
import Aside from "../Aside";

describe("Prose", () => {
  it("renders a div with the t-prose class for max-width enforcement", () => {
    const { container } = render(
      <Prose>
        <p>copy</p>
      </Prose>,
    );
    const el = container.querySelector("div.t-prose")!;
    expect(el).not.toBeNull();
    expect(el.className).toContain("t-prose");
    expect(el.className).toContain("p-prose");
  });

  it("forwards extra className", () => {
    const { container } = render(<Prose className="extra">x</Prose>);
    const el = container.querySelector("div.t-prose")! as HTMLElement;
    expect(el.className).toContain("extra");
  });

  it("nests Anchor and Aside without throwing and preserves structure", () => {
    const { container } = render(
      <Prose>
        <p>intro</p>
        <Anchor id="approach">Approach</Anchor>
        <p>body</p>
        <Aside tone="note">side note</Aside>
        <p>outro</p>
      </Prose>,
    );
    const root = container.querySelector("div.p-prose")!;
    expect(root).not.toBeNull();
    expect(root.querySelector("h2#approach")).not.toBeNull();
    expect(root.querySelector(".p-aside")).not.toBeNull();
    // snapshot the structure to catch margin/rhythm regressions
    expect(root.innerHTML).toMatchSnapshot();
  });
});
