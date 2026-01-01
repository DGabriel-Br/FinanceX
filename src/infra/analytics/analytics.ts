import { supabase } from '@/integrations/supabase/client';
import type { AnalyticsEventName, AnalyticsEventPayload } from './types';
import { getAnonymousId, hasFirstValueEvent, setFirstValueEventTracked } from './anonymousId';
import { sanitizeProperties } from './sanitize';
import { logger } from '@/lib/logger';

let currentUserId: string | null = null;

/**
 * Sets the current user ID for analytics
 * Called on login/signup to link anonymous events to user
 */
export function identify(userId: string): void {
  currentUserId = userId;
  logger.info('[Analytics] User identified');
}

/**
 * Clears the current user ID (on logout)
 */
export function resetIdentity(): void {
  currentUserId = null;
}

/**
 * Tracks an analytics event
 * 
 * @param eventName - The event name (must be one of the supported events)
 * @param properties - Optional properties to attach to the event
 */
export async function track(
  eventName: AnalyticsEventName,
  properties: Record<string, unknown> = {}
): Promise<void> {
  try {
    // Special handling for first_value to prevent duplicates
    if (eventName === 'first_value') {
      if (hasFirstValueEvent()) {
        logger.debug('[Analytics] first_value already tracked, skipping');
        return;
      }
      setFirstValueEventTracked();
    }

    const payload: Omit<AnalyticsEventPayload, 'created_at'> = {
      anonymous_id: getAnonymousId(),
      user_id: currentUserId ?? undefined,
      event_name: eventName,
      properties: sanitizeProperties(properties),
      page_url: typeof window !== 'undefined' ? window.location.href : '',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };

    const { error } = await supabase
      .from('analytics_events')
      .insert(payload);

    if (error) {
      logger.error('[Analytics] Failed to track event', { eventName, error: error.message });
    } else {
      logger.debug('[Analytics] Event tracked', { eventName });
    }
  } catch (err) {
    // Never throw from analytics - it should not break the app
    logger.error('[Analytics] Unexpected error', { eventName });
  }
}

/**
 * Convenience function to track and identify in one call
 * Used for signup_completed and login
 */
export async function trackAndIdentify(
  eventName: AnalyticsEventName,
  userId: string,
  properties: Record<string, unknown> = {}
): Promise<void> {
  identify(userId);
  await track(eventName, properties);
}
