import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { renderMarkdown } from "./markdownRenderer.js";

function html(src: string): string {
  return renderToStaticMarkup(renderMarkdown(src) as React.ReactElement);
}

describe("markdownRenderer", () => {
  it("renders a single paragraph", () => {
    const out = html("hello world");
    expect(out).toContain("<p");
    expect(out).toContain("hello world");
    expect(out).toContain("md-p");
  });

  it("splits paragraphs on a blank line", () => {
    const out = html("first para\n\nsecond para");
    const paras = out.match(/<p[^>]*class="md-p"/g) ?? [];
    expect(paras.length).toBe(2);
    expect(out).toContain("first para");
    expect(out).toContain("second para");
  });

  it("renders **strong** and *emphasis*", () => {
    const out = html("a **bold** and *italic* word");
    expect(out).toContain("<strong>bold</strong>");
    expect(out).toContain("<em>italic</em>");
  });

  it("renders inline `code`", () => {
    const out = html("use `npm install` to setup");
    expect(out).toMatch(/<code[^>]*class="md-code">npm install<\/code>/);
  });

  it("renders fenced code blocks with language", () => {
    const out = html("```ts\nconst x = 1;\n```");
    expect(out).toContain("<pre");
    expect(out).toMatch(/data-lang="ts"/);
    expect(out).toContain("const x = 1;");
  });

  it("renders unordered lists", () => {
    const out = html("- first\n- second\n- third");
    expect(out).toContain("<ul");
    const items = out.match(/<li[^>]*>/g) ?? [];
    expect(items.length).toBe(3);
    expect(out).toContain("first");
    expect(out).toContain("third");
  });

  it("renders ordered lists", () => {
    const out = html("1. alpha\n2. beta");
    expect(out).toContain("<ol");
    const items = out.match(/<li[^>]*>/g) ?? [];
    expect(items.length).toBe(2);
    expect(out).toContain("alpha");
    expect(out).toContain("beta");
  });

  it("renders inline links", () => {
    const out = html("see [docs](https://example.com/x) for more");
    expect(out).toMatch(/<a[^>]*href="https:\/\/example\.com\/x"/);
    expect(out).toContain(">docs</a>");
  });

  it("renders citation markers as superscript anchor", () => {
    const out = html("a fact [c1] and another [c2]");
    expect(out).toMatch(/<sup[^>]*class="md-cite">\s*<a href="#cite-c1">\[c1\]<\/a>\s*<\/sup>/);
    expect(out).toContain('href="#cite-c2"');
  });

  it("treats headings as bold paragraphs (no <h1>)", () => {
    const out = html("# Big Title\n\nbody text");
    expect(out).not.toMatch(/<h1[\s>]/);
    expect(out).toContain("md-p--heading");
    expect(out).toContain("<strong>Big Title</strong>");
  });

  it("does not execute or pass through raw HTML", () => {
    const malicious = "hello <script>alert(1)</script> world";
    const out = html(malicious);
    expect(out).not.toContain("<script>");
    // The angle brackets must be entity-escaped in the rendered output.
    expect(out).toContain("&lt;script&gt;");
  });

  it("escapes HTML inside fenced code blocks", () => {
    const out = html("```\n<script>x</script>\n```");
    expect(out).not.toContain("<script>x</script>");
    expect(out).toContain("&lt;script&gt;");
  });

  it("returns a renderable React node", () => {
    const node = renderMarkdown("plain text");
    expect(node).toBeDefined();
    const s = renderToStaticMarkup(node as React.ReactElement);
    expect(s).toContain("plain text");
  });

  it("handles mixed inline (bold + code + cite + link)", () => {
    const out = html("**bold** with `code` and [link](https://x.io) and [c3] cite");
    expect(out).toContain("<strong>bold</strong>");
    expect(out).toContain('<code class="md-code">code</code>');
    expect(out).toMatch(/<a[^>]*href="https:\/\/x\.io"/);
    expect(out).toContain('href="#cite-c3"');
  });
});
