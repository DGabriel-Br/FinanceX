import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { 
  resetLoginAttempts, 
  recordFailedAttempt, 
  isLoginBlocked, 
  getProgressiveDelay,
  clearAllSecureItems 
} from '@/lib/secureStorage';
import { db } from '@/infra/offline/database';
import { logger } from '@/lib/logger';
import { identify, trackAndIdentify, resetIdentity } from '@/infra/analytics';

interface LoginResult {
  error: any;
  blocked?: boolean;
  remainingSeconds?: number;
  attemptsRemaining?: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<LoginResult>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  refreshUser: () => Promise<void>;
  checkLoginBlocked: () => Promise<{ blocked: boolean; remainingSeconds: number }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MAX_LOGIN_ATTEMPTS = 5;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      // Usar getSession que funciona offline (usa cache local)
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setSession(session);
      }
    } catch (error) {
      // Ignorar erros de rede quando offline
      console.warn('Erro ao atualizar usuário (pode estar offline):', error);
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session (funciona offline - usa localStorage)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(() => {
      // Se falhar (improvável), ainda assim parar loading
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name?: string) => {
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: name
        }
      }
    });
    
    // Track signup_completed and identify user on success
    if (!error && data.user) {
      await trackAndIdentify('signup_completed', data.user.id, { 
        signup_method: 'email' 
      });
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string): Promise<LoginResult> => {
    // Check if login is blocked due to too many attempts
    const blockStatus = await isLoginBlocked();
    if (blockStatus.blocked) {
      return { 
        error: { message: `Muitas tentativas. Aguarde ${blockStatus.remainingSeconds} segundos.` },
        blocked: true,
        remainingSeconds: blockStatus.remainingSeconds
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      // Record failed attempt and apply progressive delay
      const attemptData = await recordFailedAttempt();
      const delay = getProgressiveDelay(attemptData.count);
      
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const attemptsRemaining = MAX_LOGIN_ATTEMPTS - attemptData.count;
      
      return { 
        error, 
        blocked: attemptData.lockedUntil !== null,
        remainingSeconds: attemptData.lockedUntil ? Math.ceil((attemptData.lockedUntil - Date.now()) / 1000) : 0,
        attemptsRemaining: Math.max(0, attemptsRemaining)
      };
    }

    // Check if user is blocked using secure function
    if (data.user) {
      const { data: isBlocked } = await supabase.rpc('check_user_blocked', {
        user_id: data.user.id
      });
      
      if (isBlocked) {
        // Sign out the blocked user
        await supabase.auth.signOut();
        return { 
          error: { message: 'Sua conta foi bloqueada. Entre em contato com o suporte.' }
        };
      }

      // Update last_sign_in_at
      await supabase
        .from('profiles')
        .update({ last_sign_in_at: new Date().toISOString() })
        .eq('id', data.user.id);
    }
    
    // Identify user for analytics
    if (data.user) {
      identify(data.user.id);
    }
    
    // Success - reset attempt counter
    await resetLoginAttempts();
    return { error: null };
  };

  const signOut = async () => {
    // SECURITY: Clear ALL user data on logout to prevent data leakage
    // This is defense in depth - critical for shared device scenarios
    const currentUserId = user?.id;
    
    try {
      // Clear secure storage (email, login attempts)
      await clearAllSecureItems();
      
      // CRITICAL: Clear IndexedDB offline data to prevent next user seeing previous user's data
      if (currentUserId) {
        await db.clearUserData(currentUserId);
        logger.info('Cleared offline data for user on logout');
      }
    } catch (error) {
      logger.error('Error clearing user data on logout (primary method):', error);
      
      // SECURITY FALLBACK: Nuclear option - delete entire database if user-specific cleanup fails
      // This ensures no data leakage even if clearUserData fails
      try {
        logger.warn('Attempting nuclear database cleanup as fallback');
        await db.delete();
        logger.info('Nuclear database cleanup successful');
      } catch (nuclearError) {
        logger.error('Nuclear database cleanup also failed:', nuclearError);
        // At this point, we've tried everything. Log for monitoring but continue logout.
        // The app will recreate the database on next login.
      }
    }
    
    // Reset analytics identity on logout
    resetIdentity();
    
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  };

  const checkLoginBlocked = async () => {
    return await isLoginBlocked();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updatePassword,
      refreshUser,
      checkLoginBlocked,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
