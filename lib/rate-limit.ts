/**
 * In-memory rate limiter: max 20 requests per minute per IP.
 * Used in production middleware. For multi-instance deployments,
 * consider @upstash/ratelimit + Redis for distributed limits.
 */

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 20;

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}

function cleanup(): void {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) store.delete(key);
  }
}

export function checkRateLimit(request: Request): { allowed: boolean; remaining: number; resetIn: number } {
  maybeCleanup();
  const ip = getClientIp(request);
  const now = Date.now();

  let entry = store.get(ip);

  if (!entry) {
    entry = { count: 1, resetAt: now + WINDOW_MS };
    store.set(ip, entry);
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetIn: WINDOW_MS };
  }

  if (now >= entry.resetAt) {
    entry = { count: 1, resetAt: now + WINDOW_MS };
    store.set(ip, entry);
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetIn: WINDOW_MS };
  }

  entry.count += 1;

  if (entry.count > MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now };
  }

  return {
    allowed: true,
    remaining: MAX_REQUESTS - entry.count,
    resetIn: entry.resetAt - now,
  };
}

// Run cleanup occasionally (every ~100th check) to avoid unbounded growth
let checkCount = 0;
function maybeCleanup(): void {
  checkCount++;
  if (checkCount % 100 === 0) cleanup();
}
