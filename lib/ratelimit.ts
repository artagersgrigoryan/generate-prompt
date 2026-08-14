import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type Limiter = { limit(key: string): Promise<{ success: boolean; reset: number }> };

function inMemoryLimiter(max: number, windowMs: number): Limiter {
  const store = new Map<string, number[]>();
  return {
    async limit(key: string) {
      const now = Date.now();
      const hits = (store.get(key) ?? []).filter((t) => now - t < windowMs);
      if (hits.length >= max) {
        return { success: false, reset: Math.min(...hits) + windowMs };
      }
      hits.push(now);
      store.set(key, hits);
      return { success: true, reset: now + windowMs };
    },
  };
}

const redis = process.env.UPSTASH_REDIS_REST_URL ? Redis.fromEnv() : null;

// Upstash being configured is not the same as Upstash being reachable: a
// deleted database or a network blip makes every limit() call reject. Since
// limit() is awaited before any real work happens, an unguarded rejection
// takes down the whole request. Degrade to the in-memory limiter instead —
// rate limiting is a safeguard, not a reason to drop the user's request.
function withFallback(primary: Limiter, fallback: Limiter): Limiter {
  return {
    async limit(key: string) {
      try {
        return await primary.limit(key);
      } catch (e) {
        console.error("[RateLimit] Redis unavailable, using in-memory limiter:", e);
        return fallback.limit(key);
      }
    },
  };
}

export const anonLimit: Limiter = redis
  ? withFallback(
      new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "1 h"), prefix: "rl:anon" }),
      inMemoryLimiter(5, 60 * 60 * 1000)
    )
  : inMemoryLimiter(5, 60 * 60 * 1000);

export const authLimit: Limiter = redis
  ? withFallback(
      new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, "1 h"), prefix: "rl:auth" }),
      inMemoryLimiter(20, 60 * 60 * 1000)
    )
  : inMemoryLimiter(20, 60 * 60 * 1000);

export { inMemoryLimiter };

const FREE_LIMIT_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

export async function getAnonFreeCount(ip: string): Promise<number> {
  if (!redis) return 0;
  try {
    const val = await redis.get<number>(`free:anon:${ip}`);
    return val ?? 0;
  } catch (e) {
    // Same reasoning as the limiter: this is awaited before the request does
    // any work, so a Redis outage must not turn into a failed generation.
    console.error("[FreeLimit] Redis unavailable, treating count as 0:", e);
    return 0;
  }
}

export async function incrAnonFreeCount(ip: string): Promise<void> {
  if (!redis) return;
  const pipe = redis.pipeline();
  pipe.incr(`free:anon:${ip}`);
  pipe.expire(`free:anon:${ip}`, FREE_LIMIT_TTL_SECONDS);
  await pipe.exec();
}
