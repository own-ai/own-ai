import { kv } from "@vercel/kv";
import { Ratelimit } from "@upstash/ratelimit";

/**
 * Enables a sliding window rate limiting of 60 events in 10 minutes.
 * @param id A unique identifier for the person or source to be limited.
 * @returns false (not rejected) or the number of seconds until the limit resets
 */
export async function ratelimit(id: string): Promise<false | number> {
  if (
    process.env.NODE_ENV === "development" ||
    !process.env.KV_REST_API_URL ||
    !process.env.KV_REST_API_TOKEN
  ) {
    return false;
  }

  const ratelimit = new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(60, "10m"),
  });

  const { success, reset } = await ratelimit.limit(`ratelimit_${id}`);
  return success ? false : (reset - Date.now()) / 1000;
}
