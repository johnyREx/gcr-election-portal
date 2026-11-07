import { createHmac } from "node:crypto";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// =====================================================
// ENVIRONMENT CONFIGURATION
// =====================================================

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const securitySecret = process.env.ELECTION_SERVER_SECRET;

const redis =
  redisUrl && redisToken
    ? new Redis({
        url: redisUrl,
        token: redisToken,
      })
    : null;

// =====================================================
// RATE LIMIT CONFIGURATION
// =====================================================

type RateLimitType =
  | "voter-client"
  | "voter-credential"
  | "admin-client"
  | "admin-credential";

type RateLimitResult = {
  allowed: boolean;
  reason?: "RATE_LIMITED" | "RATE_LIMIT_UNAVAILABLE";
  retryAfterSeconds?: number;
};

function createLimiter(
  requests: number,
  window: Parameters<typeof Ratelimit.slidingWindow>[1],
  prefix: string
): Ratelimit | null {
  if (!redis) {
    return null;
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix,
    analytics: false,
  });
}

const limiters: Record<RateLimitType, Ratelimit | null> = {
  "voter-client": createLimiter(
    10,
    "1 m",
    "acgc:security:voter-client"
  ),

  "voter-credential": createLimiter(
    5,
    "5 m",
    "acgc:security:voter-credential"
  ),

  "admin-client": createLimiter(
    10,
    "5 m",
    "acgc:security:admin-client"
  ),

  "admin-credential": createLimiter(
    5,
    "5 m",
    "acgc:security:admin-credential"
  ),
};

// =====================================================
// HASH IDENTIFIERS
// =====================================================

function hashIdentifier(value: string): string {
  if (!securitySecret || securitySecret.length < 32) {
    throw new Error(
      "ELECTION_SERVER_SECRET is not configured."
    );
  }

  return createHmac("sha256", securitySecret)
    .update(value, "utf8")
    .digest("hex");
}

// =====================================================
// CHECK RATE LIMIT
// =====================================================

export async function checkRateLimit(
  type: RateLimitType,
  identifier: string
): Promise<RateLimitResult> {
  const limiter = limiters[type];

  if (!limiter || !identifier.trim()) {
    return {
      allowed: false,
      reason: "RATE_LIMIT_UNAVAILABLE",
    };
  }

  try {
    const hashedIdentifier = hashIdentifier(
      `${type}:${identifier}`
    );

    const result = await limiter.limit(
      hashedIdentifier
    );

    if (!result.success) {
      return {
        allowed: false,
        reason: "RATE_LIMITED",
        retryAfterSeconds: Math.max(
          1,
          Math.ceil(
            (result.reset - Date.now()) / 1000
          )
        ),
      };
    }

    return {
      allowed: true,
    };
  } catch (error) {
    console.error(
      "Redis rate-limit check failed:",
      error instanceof Error
        ? error.message
        : "Unknown error"
    );

    // Fail closed.
    return {
      allowed: false,
      reason: "RATE_LIMIT_UNAVAILABLE",
    };
  }
}

// =====================================================
// CHECK MULTIPLE RATE LIMITS
// =====================================================

export async function checkMultipleRateLimits(
  checks: Array<{
    type: RateLimitType;
    identifier: string;
  }>
): Promise<RateLimitResult> {
  // Sequential checks avoid unnecessary Redis calls
  // after a limit has already been exceeded.

  for (const check of checks) {
    const result = await checkRateLimit(
      check.type,
      check.identifier
    );

    if (!result.allowed) {
      return result;
    }
  }

  return {
    allowed: true,
  };
}