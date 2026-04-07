// Simple in-memory rate limiter for payment endpoints
// WARNING: This rate limiter has the following limitations:
// 1. State is reset on server restart
// 2. Does not work across multiple server instances (load balancing)
// 3. For production with multiple instances, consider using Redis or a distributed cache
//
// Production alternatives:
// - Redis with @upstash/redis and @upstash/ratelimit
// - Vercel KV for serverless deployments
// - Database-backed rate limiting for persistent state

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = `payment:${identifier}`;
  
  // Clean up expired entries
  if (rateLimitStore.size > 1000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k);
      }
    }
  }
  
  const entry = rateLimitStore.get(key);
  
  if (!entry || entry.resetTime < now) {
    // First request or window expired
    const resetTime = now + windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }
  
  if (entry.count >= maxRequests) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }
  
  // Increment counter
  entry.count++;
  rateLimitStore.set(key, entry);
  
  return { 
    allowed: true, 
    remaining: maxRequests - entry.count, 
    resetTime: entry.resetTime 
  };
}

export function getRateLimitHeaders(result: ReturnType<typeof checkRateLimit>) {
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
  };
}