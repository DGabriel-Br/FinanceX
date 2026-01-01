import { SENSITIVE_KEYS, MAX_PROPERTY_STRING_LENGTH } from './types';

/**
 * Checks if a key is sensitive and should be blocked
 */
function isSensitiveKey(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive));
}

/**
 * Truncates a string to the maximum allowed length
 */
function truncateString(value: string): string {
  if (value.length > MAX_PROPERTY_STRING_LENGTH) {
    return value.substring(0, MAX_PROPERTY_STRING_LENGTH) + '...';
  }
  return value;
}

/**
 * Sanitizes a single value
 */
function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    return truncateString(value);
  }
  
  if (Array.isArray(value)) {
    return value.slice(0, 10).map(sanitizeValue);
  }
  
  if (typeof value === 'object' && value !== null) {
    return sanitizeProperties(value as Record<string, unknown>);
  }
  
  return value;
}

/**
 * Sanitizes event properties by:
 * - Removing sensitive keys (password, token, email, etc.)
 * - Truncating long strings
 * - Limiting array sizes
 */
export function sanitizeProperties(
  properties: Record<string, unknown>
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(properties)) {
    // Skip sensitive keys
    if (isSensitiveKey(key)) {
      continue;
    }
    
    sanitized[key] = sanitizeValue(value);
  }
  
  return sanitized;
}
