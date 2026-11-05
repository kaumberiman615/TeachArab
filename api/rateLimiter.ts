import { AI_CONFIG } from './config.js';

interface UserUsage {
  timestamps: number[];
}

// In-memory store for user rate limits
const usageStore = new Map<string, UserUsage>();

/**
 * Clean up timestamps older than 24 hours
 */
function cleanOldTimestamps(timestamps: number[], now: number): number[] {
  const cutoff = now - AI_CONFIG.RATE_LIMITS.WINDOW_DAY_MS;
  return timestamps.filter((t) => t > cutoff);
}

export interface RateLimitResult {
  allowed: boolean;
  remainingHourly: number;
  remainingDaily: number;
  message?: string;
}

/**
 * Check if the user is within rate limits (10/hour, 30/day)
 */
export function checkRateLimit(userId: string): RateLimitResult {
  const now = Date.now();
  let usage = usageStore.get(userId);

  if (!usage) {
    usage = { timestamps: [] };
    usageStore.set(userId, usage);
  } else {
    usage.timestamps = cleanOldTimestamps(usage.timestamps, now);
  }

  const oneHourAgo = now - AI_CONFIG.RATE_LIMITS.WINDOW_HOUR_MS;
  const hourlyCount = usage.timestamps.filter((t) => t > oneHourAgo).length;
  const dailyCount = usage.timestamps.length;

  const remainingHourly = Math.max(0, AI_CONFIG.RATE_LIMITS.MAX_HOURLY - hourlyCount);
  const remainingDaily = Math.max(0, AI_CONFIG.RATE_LIMITS.MAX_DAILY - dailyCount);

  if (hourlyCount >= AI_CONFIG.RATE_LIMITS.MAX_HOURLY) {
    return {
      allowed: false,
      remainingHourly: 0,
      remainingDaily,
      message: 'Batas penggunaan tercapai: maksimal 10 permintaan per jam. Silakan coba lagi nanti.',
    };
  }

  if (dailyCount >= AI_CONFIG.RATE_LIMITS.MAX_DAILY) {
    return {
      allowed: false,
      remainingHourly,
      remainingDaily: 0,
      message: 'Batas penggunaan harian tercapai: maksimal 30 permintaan per hari. Silakan coba lagi besok.',
    };
  }

  return {
    allowed: true,
    remainingHourly,
    remainingDaily,
  };
}

/**
 * Record a successful AI generation request
 */
export function recordRateLimitUsage(userId: string): RateLimitResult {
  const now = Date.now();
  let usage = usageStore.get(userId);

  if (!usage) {
    usage = { timestamps: [] };
    usageStore.set(userId, usage);
  }

  usage.timestamps.push(now);
  usage.timestamps = cleanOldTimestamps(usage.timestamps, now);

  const oneHourAgo = now - AI_CONFIG.RATE_LIMITS.WINDOW_HOUR_MS;
  const hourlyCount = usage.timestamps.filter((t) => t > oneHourAgo).length;
  const dailyCount = usage.timestamps.length;

  return {
    allowed: true,
    remainingHourly: Math.max(0, AI_CONFIG.RATE_LIMITS.MAX_HOURLY - hourlyCount),
    remainingDaily: Math.max(0, AI_CONFIG.RATE_LIMITS.MAX_DAILY - dailyCount),
  };
}

/**
 * Get current quota status for a user without recording a request
 */
export function getRateLimitStatus(userId: string): { remainingHourly: number; remainingDaily: number } {
  const now = Date.now();
  const usage = usageStore.get(userId);
  if (!usage) {
    return {
      remainingHourly: AI_CONFIG.RATE_LIMITS.MAX_HOURLY,
      remainingDaily: AI_CONFIG.RATE_LIMITS.MAX_DAILY,
    };
  }

  const validTimestamps = cleanOldTimestamps(usage.timestamps, now);
  const oneHourAgo = now - AI_CONFIG.RATE_LIMITS.WINDOW_HOUR_MS;
  const hourlyCount = validTimestamps.filter((t) => t > oneHourAgo).length;
  const dailyCount = validTimestamps.length;

  return {
    remainingHourly: Math.max(0, AI_CONFIG.RATE_LIMITS.MAX_HOURLY - hourlyCount),
    remainingDaily: Math.max(0, AI_CONFIG.RATE_LIMITS.MAX_DAILY - dailyCount),
  };
}
