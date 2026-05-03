// Typed, validated access to environment variables.
//
// Why this file exists:
//   - One zod schema per "audience" (server vs client) so we can fail fast
//     with a clear error naming the missing variable.
//   - A Proxy gates every property access. Server-only keys throw if read
//     from a client context, which prevents accidental client-bundle leaks
//     even if a `"use client"` module imports `env`.
//   - Validation is memoized — the schemas run on first access and the
//     parsed result is cached. This keeps module load itself cheap (so
//     this file can be imported from edge/middleware) while still giving
//     a clear startup error the moment an env var is needed.
//
// Convention: nothing else in the app should read process.env directly.

import { z } from "zod";

const optionalSecret = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().min(1).optional(),
);

const ServerEnvSchema = z.object({
  ANTHROPIC_API_KEY: optionalSecret,
  VOYAGE_API_KEY: optionalSecret,
  OPENAI_API_KEY: optionalSecret,
  EMBEDDER: z.enum(["voyage", "openai"]).default("voyage"),
  LLM_PROVIDER: z.enum(["anthropic", "openai"]).default("anthropic"),
  POSTGRES_URL: z.string().min(1, "POSTGRES_URL is required"),
  POSTGRES_URL_NON_POOLING: z
    .string()
    .min(1, "POSTGRES_URL_NON_POOLING is required"),
  KV_REST_API_URL: z.string().url("KV_REST_API_URL must be a URL"),
  KV_REST_API_TOKEN: z.string().min(1, "KV_REST_API_TOKEN is required"),
  LLM_MODEL: z.string().min(1).default("claude-opus-4-7"),
  OPENAI_MODEL: z.string().min(1).default("gpt-5"),
  LLM_RATE_LIMIT_HOUR: z.coerce.number().int().positive().default(20),
  LLM_RATE_LIMIT_DAY: z.coerce.number().int().positive().default(100),
}).superRefine((value, ctx) => {
  if (value.LLM_PROVIDER === "anthropic" && !value.ANTHROPIC_API_KEY) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["ANTHROPIC_API_KEY"],
      message: "ANTHROPIC_API_KEY is required when LLM_PROVIDER=anthropic",
    });
  }
  if (value.LLM_PROVIDER === "openai" && !value.OPENAI_API_KEY) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["OPENAI_API_KEY"],
      message: "OPENAI_API_KEY is required when LLM_PROVIDER=openai",
    });
  }
  if (value.EMBEDDER === "voyage" && !value.VOYAGE_API_KEY) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["VOYAGE_API_KEY"],
      message: "VOYAGE_API_KEY is required when EMBEDDER=voyage",
    });
  }
  if (value.EMBEDDER === "openai" && !value.OPENAI_API_KEY) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["OPENAI_API_KEY"],
      message: "OPENAI_API_KEY is required when EMBEDDER=openai",
    });
  }
});

const ClientEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url("NEXT_PUBLIC_SITE_URL must be a URL")
    .default("http://localhost:3000"),
});

type ServerEnv = z.infer<typeof ServerEnvSchema>;
type ClientEnv = z.infer<typeof ClientEnvSchema>;
export type Env = ServerEnv & ClientEnv;

const SERVER_ONLY_KEYS = new Set<keyof ServerEnv>([
  "ANTHROPIC_API_KEY",
  "VOYAGE_API_KEY",
  "OPENAI_API_KEY",
  "EMBEDDER",
  "LLM_PROVIDER",
  "POSTGRES_URL",
  "POSTGRES_URL_NON_POOLING",
  "KV_REST_API_URL",
  "KV_REST_API_TOKEN",
  "LLM_MODEL",
  "OPENAI_MODEL",
  "LLM_RATE_LIMIT_HOUR",
  "LLM_RATE_LIMIT_DAY",
]);

const isServerContext = (): boolean => typeof window === "undefined";

let serverCache: ServerEnv | undefined;
let clientCache: ClientEnv | undefined;

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const name = issue.path.join(".") || "(root)";
      return `${name}: ${issue.message}`;
    })
    .join("; ");
}

function readServer(): ServerEnv {
  if (!isServerContext()) {
    throw new Error(
      "Refusing to read server-only env vars in a client context. " +
        "Only NEXT_PUBLIC_* variables are safe in the browser bundle.",
    );
  }
  if (serverCache) return serverCache;
  const result = ServerEnvSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(
      `Invalid server environment variables: ${formatIssues(result.error)}`,
    );
  }
  serverCache = result.data;
  return serverCache;
}

function readClient(): ClientEnv {
  if (clientCache) return clientCache;
  const raw = {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  };
  const result = ClientEnvSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(
      `Invalid client environment variables: ${formatIssues(result.error)}`,
    );
  }
  clientCache = result.data;
  return clientCache;
}

export const env: Env = new Proxy({} as Env, {
  get(_target, prop) {
    if (typeof prop !== "string") return undefined;
    if (prop.startsWith("NEXT_PUBLIC_")) {
      return readClient()[prop as keyof ClientEnv];
    }
    if (SERVER_ONLY_KEYS.has(prop as keyof ServerEnv)) {
      return readServer()[prop as keyof ServerEnv];
    }
    return undefined;
  },
  has(_target, prop) {
    if (typeof prop !== "string") return false;
    return (
      prop.startsWith("NEXT_PUBLIC_") ||
      SERVER_ONLY_KEYS.has(prop as keyof ServerEnv)
    );
  },
});

// Test-only: reset the memoized validation result so unit tests can mutate
// process.env between cases without re-importing the module.
export function __resetEnvCacheForTests(): void {
  serverCache = undefined;
  clientCache = undefined;
}
