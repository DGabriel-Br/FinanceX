/**
 * Analytics event types for funnel tracking
 */

export const ANALYTICS_EVENTS = [
  'landing_viewed',
  'signup_started',
  'signup_completed',
  'first_value',
  'paywall_viewed',
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

/**
 * Sensitive keys that should never be tracked
 */
export const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'key',
  'email',
  'phone',
  'cpf',
  'credit_card',
  'card_number',
  'cvv',
  'authorization',
  'bearer',
] as const;

/**
 * Maximum string length for property values
 */
export const MAX_PROPERTY_STRING_LENGTH = 500;

/**
 * Event payload structure
 */
export interface AnalyticsEventPayload {
  anonymous_id: string;
  user_id?: string;
  event_name: AnalyticsEventName;
  properties: Record<string, unknown>;
  page_url: string;
  user_agent: string;
  created_at: string;
}

/**
 * Local storage keys
 */
export const ANALYTICS_STORAGE_KEYS = {
  ANONYMOUS_ID: 'finance_anonymous_id',
  HAS_FIRST_VALUE_EVENT: 'finance_has_first_value_event',
} as const;
