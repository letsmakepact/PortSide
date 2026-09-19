/**
 * Lightweight, in-memory sliding-window rate limiter for PortSide API endpoints.
 * Protects against brute-force attacks, credential stuffing, and endpoint spam.
 */

interface RateLimitRecord {
  timestamps: number[];
  lastCleanup: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic cleanup of stale IP/key records every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastGlobalCleanup = Date.now();

function cleanupStaleRecords(now: number, maxWindowMs: number) {
  if (now - lastGlobalCleanup < CLEANUP_INTERVAL_MS) return;
  lastGlobalCleanup = now;

  for (const [key, record] of rateLimitStore.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < maxWindowMs);
    if (record.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSec: number;
  resetTime: number;
}

/**
 * Check if a request action is permitted under sliding window constraints.
 *
 * @param key Unique rate limit key (e.g. "login:192.168.1.5" or "register:user@email.com")
 * @param limit Maximum allowed requests within the time window
 * @param windowMs Time window duration in milliseconds (default: 60,000ms = 1 minute)
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs = 60 * 1000
): RateLimitResult {
  const now = Date.now();
  cleanupStaleRecords(now, windowMs);

  let record = rateLimitStore.get(key);
  if (!record) {
    record = { timestamps: [], lastCleanup: now };
    rateLimitStore.set(key, record);
  }

  // Filter timestamps within the current sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  const currentCount = record.timestamps.length;
  const oldestTimestamp = record.timestamps[0] || now;
  const resetTime = oldestTimestamp + windowMs;
  const retryAfterSec = Math.max(1, Math.ceil((resetTime - now) / 1000));

  if (currentCount >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      retryAfterSec,
      resetTime,
    };
  }

  record.timestamps.push(now);

  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - record.timestamps.length),
    retryAfterSec: 0,
    resetTime,
  };
}

/**
 * Extract client IP address safely from standard proxy headers.
 */
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}
