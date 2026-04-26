/* ---------------------------------------------------------------------------
 * streamReader — suite 19/P03
 * Consumes an SSE response body and yields parsed { event, data } frames.
 * Frames follow the spec emitted by /api/chat:
 *   event: <name>\ndata: <payload>\n\n
 * --------------------------------------------------------------------------- */

export type SseFrame = {
  event: string;
  data: string;
};

export async function* streamReader(
  response: Response,
): AsyncGenerator<SseFrame, void, void> {
  if (!response.body) {
    throw new Error("response has no body");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE frames are separated by a blank line. Some servers emit \r\n.
      let sepIndex: number;
      while ((sepIndex = findFrameBoundary(buffer)) !== -1) {
        const rawFrame = buffer.slice(0, sepIndex);
        // Advance past the boundary. The boundary is either \n\n (2) or
        // \r\n\r\n (4); detect which by inspecting the buffer.
        const boundaryLen = buffer.startsWith("\r\n\r\n", sepIndex)
          ? 4
          : buffer[sepIndex] === "\n" && buffer[sepIndex + 1] === "\n"
            ? 2
            : 2;
        buffer = buffer.slice(sepIndex + boundaryLen);
        const frame = parseFrame(rawFrame);
        if (frame) yield frame;
      }
    }

    // Flush any final frame the server didn't terminate with a blank line.
    buffer += decoder.decode();
    const trimmed = buffer.replace(/[\r\n]+$/, "");
    if (trimmed.length > 0) {
      const frame = parseFrame(trimmed);
      if (frame) yield frame;
    }
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // releaseLock can throw if the stream was cancelled.
    }
  }
}

function findFrameBoundary(buf: string): number {
  const lf = buf.indexOf("\n\n");
  const crlf = buf.indexOf("\r\n\r\n");
  if (lf === -1) return crlf;
  if (crlf === -1) return lf;
  return Math.min(lf, crlf);
}

function parseFrame(raw: string): SseFrame | null {
  if (!raw) return null;
  const lines = raw.split(/\r?\n/);
  let event = "message";
  const dataLines: string[] = [];
  for (const line of lines) {
    if (!line || line.startsWith(":")) continue;
    const colon = line.indexOf(":");
    const field = colon === -1 ? line : line.slice(0, colon);
    let value = colon === -1 ? "" : line.slice(colon + 1);
    if (value.startsWith(" ")) value = value.slice(1);
    if (field === "event") event = value;
    else if (field === "data") dataLines.push(value);
  }
  if (dataLines.length === 0 && event === "message") return null;
  return { event, data: dataLines.join("\n") };
}
