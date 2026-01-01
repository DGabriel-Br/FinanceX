import { z } from 'zod';

/**
 * Environment variable schema with Vite-specific handling
 * Validates all required environment variables at runtime
 */
const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url('VITE_SUPABASE_URL must be a valid URL'),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1, 'VITE_SUPABASE_PUBLISHABLE_KEY is required'),
  VITE_SUPABASE_PROJECT_ID: z.string().min(1, 'VITE_SUPABASE_PROJECT_ID is required'),
  VITE_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  DEV: z.boolean(),
  PROD: z.boolean(),
  MODE: z.string(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables without logging sensitive values
 * Throws early if validation fails to prevent runtime errors
 */
function validateEnv(): Env {
  const rawEnv = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    VITE_SUPABASE_PROJECT_ID: import.meta.env.VITE_SUPABASE_PROJECT_ID,
    VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
    MODE: import.meta.env.MODE,
  };

  const result = envSchema.safeParse(rawEnv);

  if (!result.success) {
    // Log only the error messages, never the actual values
    const errorMessages = result.error.issues
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    
    console.error('[Config] Environment validation failed:\n' + errorMessages);
    throw new Error('Invalid environment configuration. Check console for details.');
  }

  return result.data;
}

/**
 * Validated environment variables
 * Import this instead of using import.meta.env directly
 */
export const env = validateEnv();
