import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
}

interface RequestInfo {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (use Redis in production)
const requestStore = new Map<string, RequestInfo>();

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, info] of requestStore.entries()) {
    if (now > info.resetTime) {
      requestStore.delete(key);
    }
  }
}, 60000); // Cleanup every minute

export function createRateLimiter(config: RateLimitConfig) {
  const { windowMs, maxRequests, message = 'Too many requests, please try again later.' } = config;

  return function rateLimiter(request: NextRequest): NextResponse | null {
    const ip = getClientIP(request);
    const key = `${ip}:${request.nextUrl.pathname}`;
    const now = Date.now();

    const requestInfo = requestStore.get(key);

    if (!requestInfo || now > requestInfo.resetTime) {
      // First request or window expired
      requestStore.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return null; // Allow request
    }

    if (requestInfo.count >= maxRequests) {
      // Rate limit exceeded
      return NextResponse.json(
        { 
          error: message,
          retryAfter: Math.ceil((requestInfo.resetTime - now) / 1000),
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(requestInfo.resetTime).toISOString(),
            'Retry-After': Math.ceil((requestInfo.resetTime - now) / 1000).toString(),
          },
        }
      );
    }

    // Increment count
    requestInfo.count += 1;
    requestStore.set(key, requestInfo);

    return null; // Allow request
  };
}

function getClientIP(request: NextRequest): string {
  // Try to get real IP from various headers
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIP = request.headers.get('x-real-ip');
  const xClientIP = request.headers.get('x-client-ip');

  if (xForwardedFor) {
    // x-forwarded-for may contain multiple IPs, take the first one
    return xForwardedFor.split(',')[0].trim();
  }

  if (xRealIP) {
    return xRealIP;
  }

  if (xClientIP) {
    return xClientIP;
  }

  // Fallback to connection remote address
  return request.ip || 'unknown';
}

// Pre-configured rate limiters for different endpoints
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
});

export const alertRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10, // 10 alert sends per 15 minutes
  message: 'Too many alert requests. Please try again in 15 minutes.',
});

export const publicPageRateLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
  message: 'Too many requests to public pages. Please slow down.',
});

export const generalApiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  message: 'API rate limit exceeded. Please try again later.',
}); 