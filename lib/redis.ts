import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

<<<<<<< HEAD
export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// General rate limiter (kept for backwards compatibility)
export const rateLimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
});

// Issue #13 fix: separate OTP send rate limiter — 5 sends per 15 minutes per email
export const otpSendRateLimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
});

// Issue #14 fix: separate OTP verify rate limiter — 10 attempts per hour per email
export const otpVerifyRateLimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"),
});
=======
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
>>>>>>> 82d1c9168819be76a06979fc555fa3d2d3adeb9b
