import { kv } from "@vercel/kv";
import { Ratelimit } from "@upstash/ratelimit";

export async function getRatelimitResponse(
  ip: string,
): Promise<Response | null> {
  if (
    process.env.NODE_ENV !== "development" &&
    process.env.KV_REST_API_URL &&
    process.env.KV_REST_API_TOKEN
  ) {
    const ratelimit = new Ratelimit({
      redis: kv,
      limiter: Ratelimit.slidingWindow(500, "1 d"),
    });

    const { success, limit, reset, remaining } = await ratelimit.limit(
      `ownai_ratelimit_${ip}`,
    );

    if (!success) {
      return new Response("You have reached your request limit for the day.", {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      });
    }
  }
  return null;
}
