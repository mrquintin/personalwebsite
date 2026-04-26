/* ---------------------------------------------------------------------------
 * markdownRenderer — suite 19/P02
 * Tiny markdown subset → React tree (no HTML injection, no scripts).
 *
 * Supported subset:
 *   - paragraphs (blank-line separated)
 *   - emphasis  *foo*  /  **foo**
 *   - inline code  `foo`
 *   - fenced code blocks ```lang … ```
 *   - unordered lists  - foo
 *   - ordered lists    1. foo
 *   - links            [text](url)
 *   - inline citations [c1] → <sup><a href="#cite-c1">[c1]</a></sup>
 *
 * Headings (#, ##, …) are intentionally NOT rendered as <h*> — chat answers
 * should remain prose. They render as a bold paragraph instead.
 *
 * Output is constructed entirely via React.createElement; nothing flows
 * through dangerouslySetInnerHTML.
 * --------------------------------------------------------------------------- */

import { createElement, Fragment, type ReactNode } from "react";

type Block =
  | { type: "p"; text: string }
  | { type: "heading"; text: string; level: number }
  | { type: "code"; lang?: string; content: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

const RE_FENCE_OPEN = /^```\s*(\S*)\s*$/;
const RE_FENCE_CLOSE = /^```\s*$/;
const RE_HEADING = /^(#{1,6})\s+(.+)$/;
const RE_UL = /^-\s+/;
const RE_OL = /^\d+\.\s+/;

function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    const fence = line.match(RE_FENCE_OPEN);
    if (fence) {
      const lang = fence[1] || undefined;
      const content: string[] = [];
      i++;
      while (i < lines.length && !RE_FENCE_CLOSE.test(lines[i])) {
        content.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing fence
      blocks.push({ type: "code", lang, content: content.join("\n") });
      continue;
    }

    const heading = line.match(RE_HEADING);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2] });
      i++;
      continue;
    }

    if (RE_UL.test(line)) {
      const items: string[] = [];
      while (i < lines.length && RE_UL.test(lines[i])) {
        items.push(lines[i].replace(RE_UL, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (RE_OL.test(line)) {
      const items: string[] = [];
      while (i < lines.length && RE_OL.test(lines[i])) {
        items.push(lines[i].replace(RE_OL, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    const para: string[] = [];
    while (i < lines.length) {
      const l = lines[i];
      if (l.trim() === "") break;
      if (RE_FENCE_OPEN.test(l)) break;
      if (RE_HEADING.test(l)) break;
      if (RE_UL.test(l)) break;
      if (RE_OL.test(l)) break;
      para.push(l);
      i++;
    }
    blocks.push({ type: "p", text: para.join(" ") });
  }

  return blocks;
}

let inlineKeyCounter = 0;
function nextKey(): string {
  inlineKeyCounter += 1;
  return `mi-${inlineKeyCounter}`;
}

function parseInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let buf = "";
  let i = 0;

  const flush = () => {
    if (buf) {
      out.push(buf);
      buf = "";
    }
  };

  while (i < text.length) {
    const ch = text[i];

    if (ch === "`") {
      const end = text.indexOf("`", i + 1);
      if (end !== -1) {
        flush();
        out.push(
          createElement(
            "code",
            { key: nextKey(), className: "md-code" },
            text.slice(i + 1, end),
          ),
        );
        i = end + 1;
        continue;
      }
    }

    if (ch === "*" && text[i + 1] === "*") {
      const end = text.indexOf("**", i + 2);
      if (end !== -1 && end > i + 2) {
        flush();
        out.push(
          createElement(
            "strong",
            { key: nextKey() },
            ...parseInline(text.slice(i + 2, end)),
          ),
        );
        i = end + 2;
        continue;
      }
    }

    if (ch === "*") {
      const end = text.indexOf("*", i + 1);
      if (end !== -1 && end > i + 1 && text[end + 1] !== "*") {
        flush();
        out.push(
          createElement(
            "em",
            { key: nextKey() },
            ...parseInline(text.slice(i + 1, end)),
          ),
        );
        i = end + 1;
        continue;
      }
    }

    if (ch === "[") {
      const rest = text.slice(i);

      const cite = rest.match(/^\[(c\d+)\]/);
      if (cite) {
        flush();
        const id = cite[1];
        out.push(
          createElement(
            "sup",
            { key: nextKey(), className: "md-cite" },
            createElement(
              "a",
              { href: `#cite-${id}` },
              `[${id}]`,
            ),
          ),
        );
        i += cite[0].length;
        continue;
      }

      const link = rest.match(/^\[([^\]]+)\]\(([^)\s]+)\)/);
      if (link) {
        flush();
        out.push(
          createElement(
            "a",
            { key: nextKey(), href: link[2], className: "md-link" },
            ...parseInline(link[1]),
          ),
        );
        i += link[0].length;
        continue;
      }
    }

    buf += ch;
    i++;
  }

  flush();
  return out;
}

function renderBlock(b: Block, idx: number): ReactNode {
  const key = `mb-${idx}`;
  switch (b.type) {
    case "p":
      return createElement(
        "p",
        { key, className: "md-p" },
        ...parseInline(b.text),
      );
    case "heading":
      return createElement(
        "p",
        { key, className: "md-p md-p--heading", "data-md-heading": b.level },
        createElement("strong", null, ...parseInline(b.text)),
      );
    case "code":
      return createElement(
        "pre",
        { key, className: "md-pre" },
        createElement(
          "code",
          {
            className: "md-codeblock",
            "data-lang": b.lang ?? null,
          },
          b.content,
        ),
      );
    case "ul":
      return createElement(
        "ul",
        { key, className: "md-ul" },
        ...b.items.map((it, j) =>
          createElement(
            "li",
            { key: `${key}-${j}`, className: "md-li" },
            ...parseInline(it),
          ),
        ),
      );
    case "ol":
      return createElement(
        "ol",
        { key, className: "md-ol" },
        ...b.items.map((it, j) =>
          createElement(
            "li",
            { key: `${key}-${j}`, className: "md-li" },
            ...parseInline(it),
          ),
        ),
      );
  }
}

export function renderMarkdown(src: string): ReactNode {
  inlineKeyCounter = 0;
  const blocks = parseBlocks(src);
  return createElement(
    Fragment,
    null,
    ...blocks.map((b, i) => renderBlock(b, i)),
  );
}
