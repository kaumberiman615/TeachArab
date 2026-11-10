import { AI_CONFIG } from './config.js';

interface IpUsage {
  timestamps: number[];
}

/**
 * Catatan penting:
 * Penghitung laju (rate limit) di memori (in-memory Map) ini tidak permanen di lingkungan serverless
 * atau saat proses server melakukan restart. Untuk persistensi penuh antar instance serverless,
 * penyimpanan terdistribusi seperti Redis atau Firestore dapat dihubungkan di masa mendatang.
 */
const ipUsageStore = new Map<string, IpUsage>();

/**
 * Bersihkan timestamp yang sudah lebih dari 24 jam
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
 * Periksa batas laju permintaan per IP (maksimal 10/jam dan 30/hari)
 */
export function checkRateLimit(ipAddress: string): RateLimitResult {
  const ip = ipAddress || 'unknown_ip';
  const now = Date.now();
  let usage = ipUsageStore.get(ip);

  if (!usage) {
    usage = { timestamps: [] };
    ipUsageStore.set(ip, usage);
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
      message: 'Batas permintaan terlampaui: maksimal 10 permintaan per jam. Silakan coba lagi nanti.',
    };
  }

  if (dailyCount >= AI_CONFIG.RATE_LIMITS.MAX_DAILY) {
    return {
      allowed: false,
      remainingHourly,
      remainingDaily: 0,
      message: 'Batas permintaan harian terlampaui: maksimal 30 permintaan per hari. Silakan coba lagi besok.',
    };
  }

  return {
    allowed: true,
    remainingHourly,
    remainingDaily,
  };
}

/**
 * Catat penggunaan sukses untuk IP tertentu
 */
export function recordRateLimitUsage(ipAddress: string): RateLimitResult {
  const ip = ipAddress || 'unknown_ip';
  const now = Date.now();
  let usage = ipUsageStore.get(ip);

  if (!usage) {
    usage = { timestamps: [] };
    ipUsageStore.set(ip, usage);
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
 * Ambil status kuota saat ini untuk IP tertentu
 */
export function getRateLimitStatus(ipAddress: string): { remainingHourly: number; remainingDaily: number } {
  const ip = ipAddress || 'unknown_ip';
  const now = Date.now();
  const usage = ipUsageStore.get(ip);
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
