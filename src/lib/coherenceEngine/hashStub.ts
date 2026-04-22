// Pure helpers for canonical JSON serialization and SHA-256.
// No third-party hash library. crypto.subtle in the browser; Node fallback
// is here so SSR (next build) does not crash.

export function canonicalJson(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("canonicalJson: non-finite number");
    return numberCanonical(value);
  }
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return "[" + value.map(canonicalJson).join(",") + "]";
  }
  if (typeof value === "object") {
    const v = value as Record<string, unknown>;
    const keys = Object.keys(v).sort();
    return "{" + keys.map((k) => JSON.stringify(k) + ":" + canonicalJson(v[k])).join(",") + "}";
  }
  throw new Error("canonicalJson: unsupported value type " + typeof value);
}

function numberCanonical(n: number): string {
  if (Object.is(n, -0)) return "0";
  if (Number.isInteger(n)) return n.toString();
  // strip trailing zeros from a fixed-point if applicable; otherwise let the
  // default toString handle it. JSON does not allow leading "+" or trailing ".".
  return n.toString();
}

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  // browser
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", data);
    return bufferToHex(new Uint8Array(buf));
  }
  // node fallback (used during SSR / build)
  const nodeCrypto = await import("crypto");
  const h = nodeCrypto.createHash("sha256");
  h.update(input);
  return h.digest("hex");
}

function bufferToHex(buf: Uint8Array): string {
  let s = "";
  for (let i = 0; i < buf.length; i++) {
    s += buf[i].toString(16).padStart(2, "0");
  }
  return s;
}

export function omitField<T extends Record<string, unknown>>(obj: T, key: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(obj)) if (k !== key) out[k] = obj[k];
  return out;
}
