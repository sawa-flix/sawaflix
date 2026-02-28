import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = redisUrl && redisToken 
    ? new Redis({
        url: redisUrl,
        token: redisToken,
    })
    : null;

export const rateLimit = redis 
    ? new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(3, "1 h"),
    })
    : null;