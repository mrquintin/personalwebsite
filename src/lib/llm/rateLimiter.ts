/**
 * Sliding-window rate limiter backed by Upstash Redis (Vercel KV-compatible).
 *
 * Two windows are checked on each call: per-hour and per-day. A request is
 * allowed only if BOTH windows have headroom. If either is exhausted, the
 * request is denied and `resetMs` reports the soonest window that frees up.
 *
 * Storage model (per window): sorted set keyed by
 *     ratelimit:<key>:<windowName>
 * with score = timestamp ms and member = unique nonce. Stale entries
 * (score < now - windowMs) are pruned on every call.
 */
import { Redis } from "@upstash/redis";

export const ANON_KEY = "anon";

export interface RateLimitOptions {
  hourLimit?: number;
  dayLimit?: number;
  /** Cap applied when no IP could be derived (key === ANON_KEY). */
  anonHourLimit?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: { hour: number; day: number };
  /** Milliseconds until the first window has headroom again. */
  resetMs: number;
  /** Which limit was tripped, if any. */
  limited?: "hour" | "day";
}

export interface RateLimiterStore {
  /**
   * Records a hit (if allowed) and returns the count of entries currently
   * inside the window. The store itself does not enforce limits — that's
   * done by the caller, which can choose not to record when denied.
   */
  hit(
    bucket: string,
    windowMs: number,
    nowMs: number,
    record: boolean
  ): Promise<{ count: number; oldestMs: number | null }>;
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const DEFAULT_HOUR = 20;
const DEFAULT_DAY = 100;
const DEFAULT_ANON_HOUR = 5;

let cachedStore: RateLimiterStore | null = null;

/**
 * Returns the IP key for a request. Reads x-forwarded-for first; if absent,
 * falls back to the provided `fallbackIp`. Returns ANON_KEY when nothing is
 * available — callers should use a tighter cap for that bucket.
 */
export function deriveKey(
  headers: Headers | Record<string, string | undefined>,
  fallbackIp?: string | null
): string {
  const get =
    headers instanceof Headers
      ? (h: string) => headers.get(h)
      : (h: string) => headers[h.toLowerCase()] ?? headers[h];
  const xff = get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = get("x-real-ip");
  if (real) return real.trim();
  if (fallbackIp) return fallbackIp;
  return ANON_KEY;
}

export function setRateLimiterStore(store: RateLimiterStore | null): void {
  cachedStore = store;
}

export function getRateLimiterStore(): RateLimiterStore {
  if (cachedStore) return cachedStore;
  cachedStore = createUpstashStore();
  return cachedStore;
}

export async function checkRateLimit(
  key: string,
  opts: RateLimitOptions = {},
  deps: { store?: RateLimiterStore; now?: () => number } = {}
): Promise<RateLimitResult> {
  const store = deps.store ?? getRateLimiterStore();
  const now = (deps.now ?? Date.now)();

  const isAnon = key === ANON_KEY;
  const hourLimit = isAnon
    ? (opts.anonHourLimit ?? DEFAULT_ANON_HOUR)
    : (opts.hourLimit ?? DEFAULT_HOUR);
  const dayLimit = opts.dayLimit ?? DEFAULT_DAY;

  // Probe both windows without recording first.
  const hourProbe = await store.hit(
    bucketName(key, "hour"),
    HOUR_MS,
    now,
    false
  );
  const dayProbe = await store.hit(bucketName(key, "day"), DAY_MS, now, false);

  const hourOver = hourProbe.count >= hourLimit;
  const dayOver = dayProbe.count >= dayLimit;

  if (hourOver || dayOver) {
    const limited: "hour" | "day" = hourOver ? "hour" : "day";
    const resetMs = computeResetMs(
      limited === "hour" ? hourProbe.oldestMs : dayProbe.oldestMs,
      limited === "hour" ? HOUR_MS : DAY_MS,
      now
    );
    return {
      allowed: false,
      remaining: {
        hour: Math.max(0, hourLimit - hourProbe.count),
        day: Math.max(0, dayLimit - dayProbe.count),
      },
      resetMs,
      limited,
    };
  }

  // Allowed: record the hit in both windows.
  const hourFinal = await store.hit(bucketName(key, "hour"), HOUR_MS, now, true);
  const dayFinal = await store.hit(bucketName(key, "day"), DAY_MS, now, true);

  return {
    allowed: true,
    remaining: {
      hour: Math.max(0, hourLimit - hourFinal.count),
      day: Math.max(0, dayLimit - dayFinal.count),
    },
    resetMs: computeResetMs(hourFinal.oldestMs, HOUR_MS, now),
  };
}

function bucketName(key: string, window: "hour" | "day"): string {
  return `ratelimit:${key}:${window}`;
}

function computeResetMs(
  oldestMs: number | null,
  windowMs: number,
  now: number
): number {
  if (oldestMs == null) return 0;
  const reset = oldestMs + windowMs - now;
  return reset > 0 ? reset : 0;
}

/**
 * Upstash-backed store. Reads connection info from
 * KV_REST_API_URL/KV_REST_API_TOKEN (Vercel KV) or
 * UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN. If none is available,
 * falls back to an in-memory store so local dev doesn't hard-fail; production
 * should always have credentials configured.
 */
export function createUpstashStore(): RateLimiterStore {
  const url =
    process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "";
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "";

  if (!url || !token) {
    return createMemoryStore();
  }

  const redis = new Redis({ url, token });

  return {
    async hit(bucket, windowMs, nowMs, record) {
      const cutoff = nowMs - windowMs;
      await redis.zremrangebyscore(bucket, 0, cutoff);
      if (record) {
        const member = `${nowMs}-${Math.random().toString(36).slice(2, 8)}`;
        await redis.zadd(bucket, { score: nowMs, member });
        await redis.pexpire(bucket, windowMs);
      }
      const count = (await redis.zcard(bucket)) ?? 0;
      const oldest = (await redis.zrange(bucket, 0, 0, {
        withScores: true,
      })) as Array<string | number> | null;
      let oldestMs: number | null = null;
      if (oldest && oldest.length >= 2) {
        const score = Number(oldest[1]);
        if (Number.isFinite(score)) oldestMs = score;
      }
      return { count, oldestMs };
    },
  };
}

/**
 * In-memory fallback store. Process-local; do NOT use in serverless
 * production where instances can be recycled per request.
 */
export function createMemoryStore(): RateLimiterStore {
  const buckets = new Map<string, number[]>();
  return {
    async hit(bucket, windowMs, nowMs, record) {
      const cutoff = nowMs - windowMs;
      const arr = (buckets.get(bucket) ?? []).filter((t) => t > cutoff);
      if (record) arr.push(nowMs);
      arr.sort((a, b) => a - b);
      buckets.set(bucket, arr);
      return {
        count: arr.length,
        oldestMs: arr.length > 0 ? arr[0] : null,
      };
    },
  };
}
