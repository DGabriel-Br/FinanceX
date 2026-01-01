import { ANALYTICS_STORAGE_KEYS } from './types';

/**
 * Generates a UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Gets or creates an anonymous ID for the current user
 * Persisted in localStorage to maintain identity across sessions
 */
export function getAnonymousId(): string {
  try {
    let anonymousId = localStorage.getItem(ANALYTICS_STORAGE_KEYS.ANONYMOUS_ID);
    
    if (!anonymousId) {
      anonymousId = generateUUID();
      localStorage.setItem(ANALYTICS_STORAGE_KEYS.ANONYMOUS_ID, anonymousId);
    }
    
    return anonymousId;
  } catch {
    // Fallback for environments without localStorage
    return generateUUID();
  }
}

/**
 * Checks if the first_value event has already been tracked
 */
export function hasFirstValueEvent(): boolean {
  try {
    return localStorage.getItem(ANALYTICS_STORAGE_KEYS.HAS_FIRST_VALUE_EVENT) === 'true';
  } catch {
    return false;
  }
}

/**
 * Marks that the first_value event has been tracked
 */
export function setFirstValueEventTracked(): void {
  try {
    localStorage.setItem(ANALYTICS_STORAGE_KEYS.HAS_FIRST_VALUE_EVENT, 'true');
  } catch {
    // Silently fail if localStorage is unavailable
  }
}
