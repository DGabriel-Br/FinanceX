/**
 * Centralized error logging utility
 * Only logs to console in development mode to prevent information leakage in production
 */

const isDev = import.meta.env.DEV;

export const logger = {
  /**
   * Log error messages - only in development mode
   */
  error: (context: string, error?: unknown) => {
    if (isDev) {
      console.error(context, error);
    }
    // In production, errors could be sent to a server-side logging service
    // but never exposed in the browser console
  },

  /**
   * Log warning messages - only in development mode
   */
  warn: (context: string, data?: unknown) => {
    if (isDev) {
      console.warn(context, data);
    }
  },

  /**
   * Log info messages - only in development mode
   */
  info: (context: string, data?: unknown) => {
    if (isDev) {
      console.info(context, data);
    }
  },

  /**
   * Log debug messages - only in development mode
   */
  debug: (context: string, data?: unknown) => {
    if (isDev) {
      console.log(context, data);
    }
  },
};
