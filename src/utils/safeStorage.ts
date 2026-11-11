/**
 * Helper aman untuk localStorage yang selalu dibungkus try/catch
 * Mencegah aplikasi crash di mode privasi ketat, iframe terbatas, atau browser tanpa storage
 */

export function getSafeLocalStorage(key: string, defaultValue: string | null = null): string | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return defaultValue;
    }
    const val = window.localStorage.getItem(key);
    return val !== null ? val : defaultValue;
  } catch (err) {
    console.warn(`[safeStorage] Gagal membaca key "${key}":`, err);
    return defaultValue;
  }
}

export function setSafeLocalStorage(key: string, value: string): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    window.localStorage.setItem(key, value);
    return true;
  } catch (err) {
    console.warn(`[safeStorage] Gagal menyimpan key "${key}":`, err);
    return false;
  }
}

export function removeSafeLocalStorage(key: string): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    window.localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.warn(`[safeStorage] Gagal menghapus key "${key}":`, err);
    return false;
  }
}

// Key khusus untuk onboarding
export const ONBOARDING_COMPLETED_KEY = 'teacharab_onboarding_completed_v1';
