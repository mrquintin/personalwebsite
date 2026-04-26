import { countTokens, getTokenizer } from "@anthropic-ai/tokenizer";

export type Chunk = {
  text: string;
  charStart: number;
  charEnd: number;
  heading?: string;
  section?: string;
};

export interface ChunkOptions {
  targetTokens?: number;
  overlapTokens?: number;
  format?: "md" | "txt" | "transcript";
}

interface Block {
  type: "heading" | "paragraph" | "codefence";
  text: string;
  charStart: number;
  charEnd: number;
  level?: number;
  headingText?: string;
}

interface TranscriptMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface TranscriptDoc {
  messages: TranscriptMessage[];
}

const DEFAULT_TARGET_TOKENS = 600;
const DEFAULT_OVERLAP_TOKENS = 80;

export function chunkDocument(
  content: string,
  opts: ChunkOptions = {}
): Chunk[] {
  const targetTokens = opts.targetTokens ?? DEFAULT_TARGET_TOKENS;
  const overlapTokens = opts.overlapTokens ?? DEFAULT_OVERLAP_TOKENS;
  const format = opts.format ?? "md";

  if (format === "transcript") {
    return chunkTranscript(content, targetTokens);
  }
  return chunkMarkdown(content, targetTokens, overlapTokens, format);
}

function computeLineOffsets(content: string): number[] {
  const offsets: number[] = [0];
  for (let i = 0; i < content.length; i++) {
    if (content[i] === "\n") offsets.push(i + 1);
  }
  return offsets;
}

function parseBlocks(content: string, format: "md" | "txt"): Block[] {
  const lines = content.split("\n");
  const lineOffsets = computeLineOffsets(content);
  const blocks: Block[] = [];

  const isFence = (line: string) =>
    format === "md" && /^(\s*)(```+|~~~+)/.test(line);
  const isHeading = (line: string) =>
    format === "md" && /^#{1,6}\s+\S/.test(line);

  const lineEnd = (idx: number): number => {
    if (idx + 1 < lineOffsets.length) {
      return lineOffsets[idx + 1] - 1;
    }
    return content.length;
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (isFence(line)) {
      const fenceMatch = line.match(/^\s*(```+|~~~+)/)!;
      const fence = fenceMatch[1];
      const startOff = lineOffsets[i];
      i++;
      while (
        i < lines.length &&
        !new RegExp(`^\\s*${fence}\\s*$`).test(lines[i])
      ) {
        i++;
      }
      let endOff: number;
      if (i < lines.length) {
        endOff = lineEnd(i);
        i++;
      } else {
        endOff = content.length;
      }
      blocks.push({
        type: "codefence",
        text: content.slice(startOff, endOff),
        charStart: startOff,
        charEnd: endOff,
      });
      continue;
    }

    if (isHeading(line)) {
      const m = line.match(/^(#{1,6})\s+(.+?)\s*$/)!;
      const level = m[1].length;
      const headingText = m[2].trim();
      const startOff = lineOffsets[i];
      const endOff = lineEnd(i);
      blocks.push({
        type: "heading",
        text: line,
        charStart: startOff,
        charEnd: endOff,
        level,
        headingText,
      });
      i++;
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    const startOff = lineOffsets[i];
    let endIdx = i;
    while (
      endIdx < lines.length &&
      lines[endIdx].trim() !== "" &&
      !isFence(lines[endIdx]) &&
      !isHeading(lines[endIdx])
    ) {
      endIdx++;
    }
    const endOff = lineEnd(endIdx - 1);
    blocks.push({
      type: "paragraph",
      text: content.slice(startOff, endOff),
      charStart: startOff,
      charEnd: endOff,
    });
    i = endIdx;
  }

  return blocks;
}

function splitParagraphIntoSentences(block: Block): Block[] {
  const sentenceRegex = /[^.!?]+(?:[.!?]+(?=\s|$)|$)/g;
  const matches = block.text.match(sentenceRegex);
  if (!matches || matches.length <= 1) return [block];

  const result: Block[] = [];
  let cursor = block.charStart;
  for (const sent of matches) {
    const trimmedStart = sent.match(/^\s*/)![0].length;
    const trimmedEnd = sent.match(/\s*$/)![0].length;
    const text = sent.slice(trimmedStart, sent.length - trimmedEnd);
    if (text.length === 0) {
      cursor += sent.length;
      continue;
    }
    const start = cursor + trimmedStart;
    const end = start + text.length;
    result.push({
      type: "paragraph",
      text,
      charStart: start,
      charEnd: end,
    });
    cursor += sent.length;
  }
  return result.length > 0 ? result : [block];
}

function chunkMarkdown(
  content: string,
  targetTokens: number,
  overlapTokens: number,
  format: "md" | "txt"
): Chunk[] {
  const blocks = parseBlocks(content, format);
  if (blocks.length === 0) return [];

  const chunks: Chunk[] = [];
  let buffer: Block[] = [];
  let bufferTokens = 0;
  let sectionStack: string[] = [];
  let chunkSection: string[] | null = null;
  let chunkHeading: string | null = null;

  const flush = () => {
    if (buffer.length === 0) return;
    const charStart = buffer[0].charStart;
    const charEnd = buffer[buffer.length - 1].charEnd;
    const text = content.slice(charStart, charEnd);
    chunks.push({
      text,
      charStart,
      charEnd,
      heading: chunkHeading ?? undefined,
      section:
        chunkSection && chunkSection.length > 0
          ? chunkSection.filter(Boolean).join(" > ")
          : undefined,
    });
    buffer = [];
    bufferTokens = 0;
    chunkSection = null;
    chunkHeading = null;
  };

  const startChunkContext = (block: Block) => {
    chunkSection = sectionStack.filter(Boolean).slice();
    if (block.type === "heading" && block.headingText) {
      chunkHeading = block.headingText;
      const projected = sectionStack.slice(0, block.level! - 1);
      projected[block.level! - 1] = block.headingText;
      chunkSection = projected.filter(Boolean).slice();
    } else {
      chunkHeading =
        sectionStack.length > 0
          ? sectionStack[sectionStack.length - 1] ?? null
          : null;
    }
  };

  const addBlock = (block: Block) => {
    const blockTokens = countTokens(block.text);

    if (block.type === "heading" && buffer.length > 0) {
      flush();
    }

    if (block.type === "heading") {
      const level = block.level!;
      sectionStack = sectionStack.slice(0, level - 1);
      sectionStack[level - 1] = block.headingText!;
      sectionStack.length = level;
    }

    if (
      buffer.length > 0 &&
      bufferTokens + blockTokens > targetTokens
    ) {
      flush();
    }

    if (
      buffer.length === 0 &&
      block.type === "paragraph" &&
      blockTokens > targetTokens
    ) {
      const sentences = splitParagraphIntoSentences(block);
      if (sentences.length > 1) {
        for (const s of sentences) addBlock(s);
        return;
      }
    }

    if (buffer.length === 0) {
      startChunkContext(block);
    }
    buffer.push(block);
    bufferTokens += blockTokens;

    if (block.type === "heading" && block.headingText) {
      chunkHeading = block.headingText;
      chunkSection = sectionStack.filter(Boolean).slice();
    }
  };

  for (const block of blocks) {
    addBlock(block);
  }
  flush();

  if (overlapTokens > 0 && chunks.length > 1) {
    return applyOverlap(chunks, content, overlapTokens);
  }
  return chunks;
}

function takeLastTokensText(text: string, n: number): string {
  if (n <= 0 || text.length === 0) return "";
  const tok = getTokenizer();
  try {
    const ids = tok.encode(text.normalize("NFKC"), "all");
    if (ids.length <= n) return text;
    const lastIds = ids.slice(-n);
    const decoded = tok.decode(lastIds);
    return new TextDecoder().decode(decoded);
  } finally {
    tok.free();
  }
}

function applyOverlap(
  chunks: Chunk[],
  content: string,
  overlapTokens: number
): Chunk[] {
  const result: Chunk[] = [chunks[0]];
  for (let i = 1; i < chunks.length; i++) {
    const prev = chunks[i - 1];
    const cur = chunks[i];
    const overlap = takeLastTokensText(prev.text, overlapTokens);
    if (overlap.length > 0 && overlap.length < prev.text.length) {
      const newStart = prev.charEnd - overlap.length;
      const safeStart = Math.max(prev.charStart, Math.min(newStart, cur.charStart));
      const newText = content.slice(safeStart, cur.charEnd);
      result.push({
        ...cur,
        text: newText,
        charStart: safeStart,
      });
    } else {
      result.push(cur);
    }
  }
  return result;
}

function chunkTranscript(content: string, targetTokens: number): Chunk[] {
  let parsed: TranscriptDoc;
  try {
    parsed = JSON.parse(content) as TranscriptDoc;
  } catch (err) {
    throw new Error(
      `chunkDocument: transcript content must be JSON: ${(err as Error).message}`
    );
  }
  if (!parsed || !Array.isArray(parsed.messages)) {
    throw new Error(
      "chunkDocument: transcript JSON must have a `messages` array"
    );
  }
  const messages = parsed.messages;
  const chunks: Chunk[] = [];

  const formatMsg = (m: TranscriptMessage) => `${m.role}: ${m.content}`;
  const SEP = "\n\n";

  let i = 0;
  let runningOffset = 0;

  while (i < messages.length) {
    while (i < messages.length && messages[i].role !== "user") {
      runningOffset += formatMsg(messages[i]).length + SEP.length;
      i++;
    }
    if (i >= messages.length) break;

    const chunkStart = runningOffset;
    const heading = messages[i].content.slice(0, 60);
    const chunkMsgs: TranscriptMessage[] = [];
    let pairCount = 0;
    let tokens = 0;

    while (i < messages.length) {
      const msg = messages[i];

      if (msg.role === "user" && chunkMsgs.length > 0) {
        if (pairCount >= 3 || tokens >= targetTokens) {
          break;
        }
      }

      chunkMsgs.push(msg);
      const msgText = formatMsg(msg);
      tokens += countTokens(msgText);
      runningOffset += msgText.length + SEP.length;
      i++;

      if (
        msg.role === "assistant" &&
        chunkMsgs.length >= 2 &&
        chunkMsgs[chunkMsgs.length - 2].role === "user"
      ) {
        pairCount++;
        if (pairCount >= 3) break;
      }
    }

    const text = chunkMsgs.map(formatMsg).join(SEP);
    chunks.push({
      text,
      charStart: chunkStart,
      charEnd: chunkStart + text.length,
      heading,
    });
  }

  return chunks;
}
