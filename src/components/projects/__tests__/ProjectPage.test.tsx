import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import ProjectPage from "../ProjectPage";
import { generateStaticParams } from "@/app/projects/[slug]/page";

// suite 16/P10 — ProjectPage unit tests.
// notFound() throws a NEXT_NOT_FOUND error in next/navigation; we mock it
// here so we can assert the unknown-slug branch deterministically.
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

describe("ProjectPage", () => {
  it("renders notFound for an unknown slug", async () => {
    await expect(ProjectPage({ slug: "not-a-real-slug" })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
  });

  it.each([
    { slug: "hivemind", title: "Hivemind" },
    { slug: "purposeless-efficiency", title: "Purposeless Efficiency" },
    { slug: "theseus", title: "Theseus" },
  ])(
    "loads metadata, presentation slot, body slot, and links slot for $slug",
    async ({ slug, title }) => {
      const tree = await ProjectPage({ slug });
      const { container } = render(tree);

      // metadata title rendered into <h1>
      const h1 = container.querySelector("h1");
      expect(h1?.textContent).toContain(title);

      // presentation, body, related links are <section> children of the
      // article shell. The presentation slot is optional — every slug
      // currently ships with at least body + links sections, plus the
      // footer "ask my LLM" CTA.
      const sections = container.querySelectorAll(
        "article.ps-shell section",
      );
      expect(sections.length).toBeGreaterThanOrEqual(2);

      // footer CTA points at /chat
      const cta = container.querySelector(
        'footer.ps-shell-footer a[href="/chat"]',
      );
      expect(cta).not.toBeNull();
      expect(cta?.textContent).toContain(`ask my LLM about ${title}`);
    },
  );

  it("generateStaticParams returns three known slugs", () => {
    const params = generateStaticParams();
    const slugs = params.map((p) => p.slug).sort();
    expect(slugs).toEqual([
      "hivemind",
      "purposeless-efficiency",
      "theseus",
    ]);
  });
});
