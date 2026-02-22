import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const rateLimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
});

export const otpVerifyRateLimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"),
});