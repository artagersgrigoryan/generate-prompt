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

export const anonLimit: Limiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "1 h"), prefix: "rl:anon" })
  : inMemoryLimiter(5, 60 * 60 * 1000);

export const authLimit: Limiter = redis
  ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, "1 h"), prefix: "rl:auth" })
  : inMemoryLimiter(20, 60 * 60 * 1000);

export { inMemoryLimiter };

const FREE_LIMIT_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

export async function getAnonFreeCount(ip: string): Promise<number> {
  if (!redis) return 0;
  const val = await redis.get<number>(`free:anon:${ip}`);
  return val ?? 0;
}

export async function incrAnonFreeCount(ip: string): Promise<void> {
  if (!redis) return;
  const pipe = redis.pipeline();
  pipe.incr(`free:anon:${ip}`);
  pipe.expire(`free:anon:${ip}`, FREE_LIMIT_TTL_SECONDS);
  await pipe.exec();
}
