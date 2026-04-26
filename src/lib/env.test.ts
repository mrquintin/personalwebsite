import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// These tests stub process.env and globalThis.window before importing
// `./env`, so each scenario gets a fresh module with its own validation
// cache. We use vi.resetModules() in beforeEach to guarantee that.

const SERVER_DEFAULTS = {
  ANTHROPIC_API_KEY: "sk-ant-test",
  POSTGRES_URL: "postgres://user:pw@host:5432/db",
  POSTGRES_URL_NON_POOLING: "postgres://user:pw@host:5432/db?direct=1",
  KV_REST_API_URL: "https://kv.example.com",
  KV_REST_API_TOKEN: "kv-test-token",
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
};

function stubAll(values: Record<string, string>) {
  for (const [k, v] of Object.entries(values)) {
    vi.stubEnv(k, v);
  }
}

function simulateServer() {
  // jsdom defines `window`; setting it to undefined makes
  // `typeof window === "undefined"` true, which is the runtime probe
  // the env module uses to detect a server context.
  vi.stubGlobal("window", undefined);
}

describe("env", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("returns typed values from process.env on the server", async () => {
    simulateServer();
    stubAll(SERVER_DEFAULTS);
    const { env } = await import("./env");
    expect(env.ANTHROPIC_API_KEY).toBe("sk-ant-test");
    expect(env.POSTGRES_URL).toBe("postgres://user:pw@host:5432/db");
    expect(env.NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3000");
  });

  it("applies defaults for unset tunables", async () => {
    simulateServer();
    stubAll(SERVER_DEFAULTS);
    const { env } = await import("./env");
    expect(env.LLM_MODEL).toBe("claude-opus-4-7");
    expect(env.LLM_RATE_LIMIT_HOUR).toBe(20);
    expect(env.LLM_RATE_LIMIT_DAY).toBe(100);
    expect(env.EMBEDDER).toBe("voyage");
  });

  it("coerces numeric tunables from string env values", async () => {
    simulateServer();
    stubAll({
      ...SERVER_DEFAULTS,
      LLM_RATE_LIMIT_HOUR: "5",
      LLM_RATE_LIMIT_DAY: "50",
    });
    const { env } = await import("./env");
    expect(env.LLM_RATE_LIMIT_HOUR).toBe(5);
    expect(env.LLM_RATE_LIMIT_DAY).toBe(50);
  });

  it("throws a clear error naming a missing required var", async () => {
    simulateServer();
    // Stub every required var EXCEPT ANTHROPIC_API_KEY so it fails to parse.
    stubAll({
      POSTGRES_URL: SERVER_DEFAULTS.POSTGRES_URL,
      POSTGRES_URL_NON_POOLING: SERVER_DEFAULTS.POSTGRES_URL_NON_POOLING,
      KV_REST_API_URL: SERVER_DEFAULTS.KV_REST_API_URL,
      KV_REST_API_TOKEN: SERVER_DEFAULTS.KV_REST_API_TOKEN,
      NEXT_PUBLIC_SITE_URL: SERVER_DEFAULTS.NEXT_PUBLIC_SITE_URL,
    });
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    const { env } = await import("./env");
    expect(() => env.ANTHROPIC_API_KEY).toThrow(/ANTHROPIC_API_KEY/);
  });

  it("rejects non-URL values for KV_REST_API_URL", async () => {
    simulateServer();
    stubAll({ ...SERVER_DEFAULTS, KV_REST_API_URL: "not-a-url" });
    const { env } = await import("./env");
    expect(() => env.KV_REST_API_URL).toThrow(/KV_REST_API_URL/);
  });

  it("refuses to read server-only vars from a client context", async () => {
    // Do NOT call simulateServer(): jsdom keeps `window` defined, which
    // is exactly the situation a "use client" file would hit at runtime.
    stubAll(SERVER_DEFAULTS);
    const { env } = await import("./env");
    expect(() => env.ANTHROPIC_API_KEY).toThrow(/client context/i);
    expect(() => env.POSTGRES_URL).toThrow(/client context/i);
  });

  it("allows NEXT_PUBLIC_ vars from a client context", async () => {
    // No simulateServer(): we are pretending to run in the browser.
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");
    const { env } = await import("./env");
    expect(env.NEXT_PUBLIC_SITE_URL).toBe("https://example.com");
  });

  it("returns undefined for unknown property access", async () => {
    simulateServer();
    stubAll(SERVER_DEFAULTS);
    const { env } = await import("./env");
    // @ts-expect-error — intentional probe of an undeclared key
    expect(env.NOT_A_REAL_VAR).toBeUndefined();
  });
});
