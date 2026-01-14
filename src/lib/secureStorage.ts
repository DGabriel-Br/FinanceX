/**
 * Secure Storage Service for FinanceX
 * 
 * SECURITY NOTES:
 * - NEVER store passwords or sensitive credentials
 * - For mobile: Uses Capacitor Preferences (backed by iOS Keychain/Android SharedPreferences)
 * - For web: Uses localStorage (with awareness of XSS risks)
 * - Email storage is allowed for UX convenience
 * - Tokens are managed by Supabase Auth client (auto-stored securely)
 * 
 * FUTURE IMPROVEMENTS:
 * - For highly sensitive data, consider @nicholasbraun/capacitor-secure-storage-plugin
 *   which uses iOS Keychain and Android Keystore with encryption
 */

import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

// Keys for stored data
const STORAGE_KEYS = {
  SAVED_EMAIL: 'financex_saved_email',
  LOGIN_ATTEMPTS: 'financex_login_attempts',
  LAST_ATTEMPT_TIME: 'financex_last_attempt_time',
} as const;

// Blacklisted keys - NEVER allow these to be stored
const BLACKLISTED_PATTERNS = [
  'password',
  'senha',
  'secret',
  'token',
  'key',
  'credential',
];

function isBlacklistedKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return BLACKLISTED_PATTERNS.some(pattern => lowerKey.includes(pattern));
}

/**
 * Get a value from secure storage
 */
export async function getSecureItem(key: string): Promise<string | null> {
  if (isBlacklistedKey(key)) {
    console.warn(`Security: Attempted to read blacklisted key pattern: ${key}`);
    return null;
  }

  if (Capacitor.isNativePlatform()) {
    try {
      const { value } = await Preferences.get({ key });
      return value;
    } catch (error) {
      console.error('SecureStorage get error:', error);
      return null;
    }
  } else {
    return localStorage.getItem(key);
  }
}

/**
 * Set a value in secure storage
 */
export async function setSecureItem(key: string, value: string): Promise<void> {
  if (isBlacklistedKey(key)) {
    console.error(`Security: BLOCKED attempt to store blacklisted key pattern: ${key}`);
    throw new Error('Cannot store sensitive data');
  }

  if (Capacitor.isNativePlatform()) {
    try {
      await Preferences.set({ key, value });
    } catch (error) {
      console.error('SecureStorage set error:', error);
    }
  } else {
    localStorage.setItem(key, value);
  }
}

/**
 * Remove a value from secure storage
 */
export async function removeSecureItem(key: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await Preferences.remove({ key });
    } catch (error) {
      console.error('SecureStorage remove error:', error);
    }
  } else {
    localStorage.removeItem(key);
  }
}

/**
 * Clear all stored data (for logout)
 */
export async function clearAllSecureItems(): Promise<void> {
  const savedEmail = await getSecureItem(STORAGE_KEYS.SAVED_EMAIL);
  if (Capacitor.isNativePlatform()) {
    try {
      await Preferences.clear();
      if (savedEmail) {
        await Preferences.set({ key: STORAGE_KEYS.SAVED_EMAIL, value: savedEmail });
      }
    } catch (error) {
      console.error('SecureStorage clear error:', error);
    }
  } else {
    // Only clear our app-specific keys, not all localStorage
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    if (savedEmail) {
      localStorage.setItem(STORAGE_KEYS.SAVED_EMAIL, savedEmail);
    }
  }
}

// ============================================
// LOGIN ATTEMPT TRACKING (Rate Limiting)
// ============================================

interface LoginAttemptData {
  count: number;
  lastAttempt: number;
  lockedUntil: number | null;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Get current login attempt data
 */
export async function getLoginAttempts(): Promise<LoginAttemptData> {
  const attemptsStr = await getSecureItem(STORAGE_KEYS.LOGIN_ATTEMPTS);
  const lastTimeStr = await getSecureItem(STORAGE_KEYS.LAST_ATTEMPT_TIME);
  
  const now = Date.now();
  const lastAttempt = lastTimeStr ? parseInt(lastTimeStr, 10) : 0;
  const count = attemptsStr ? parseInt(attemptsStr, 10) : 0;
  
  // Reset if window expired
  if (now - lastAttempt > ATTEMPT_WINDOW_MS) {
    return { count: 0, lastAttempt: now, lockedUntil: null };
  }
  
  // Check if locked
  const lockedUntil = count >= MAX_ATTEMPTS ? lastAttempt + LOCKOUT_DURATION_MS : null;
  
  return { count, lastAttempt, lockedUntil };
}

/**
 * Record a failed login attempt
 */
export async function recordFailedAttempt(): Promise<LoginAttemptData> {
  const current = await getLoginAttempts();
  const now = Date.now();
  
  const newCount = current.count + 1;
  
  await setSecureItem(STORAGE_KEYS.LOGIN_ATTEMPTS, newCount.toString());
  await setSecureItem(STORAGE_KEYS.LAST_ATTEMPT_TIME, now.toString());
  
  const lockedUntil = newCount >= MAX_ATTEMPTS ? now + LOCKOUT_DURATION_MS : null;
  
  return { count: newCount, lastAttempt: now, lockedUntil };
}

/**
 * Reset login attempts (on successful login)
 */
export async function resetLoginAttempts(): Promise<void> {
  await removeSecureItem(STORAGE_KEYS.LOGIN_ATTEMPTS);
  await removeSecureItem(STORAGE_KEYS.LAST_ATTEMPT_TIME);
}

/**
 * Check if login is currently blocked
 */
export async function isLoginBlocked(): Promise<{ blocked: boolean; remainingSeconds: number }> {
  const { lockedUntil } = await getLoginAttempts();
  
  if (!lockedUntil) {
    return { blocked: false, remainingSeconds: 0 };
  }
  
  const now = Date.now();
  if (now >= lockedUntil) {
    // Lockout expired, reset
    await resetLoginAttempts();
    return { blocked: false, remainingSeconds: 0 };
  }
  
  return { 
    blocked: true, 
    remainingSeconds: Math.ceil((lockedUntil - now) / 1000) 
  };
}

/**
 * Calculate progressive delay based on failed attempts
 */
export function getProgressiveDelay(attemptCount: number): number {
  // Exponential backoff: 0, 1, 2, 4, 8 seconds
  if (attemptCount <= 1) return 0;
  return Math.min(Math.pow(2, attemptCount - 2) * 1000, 8000);
}

// Export storage keys for use elsewhere
export { STORAGE_KEYS };
