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
import { db } from '@/lib/offline/database';
import { logger } from '@/lib/logger';

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
  isAdmin: boolean;
  adminLoading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<LoginResult>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  refreshUser: () => Promise<void>;
  checkLoginBlocked: () => Promise<{ blocked: boolean; remainingSeconds: number }>;
  checkIsAdmin: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MAX_LOGIN_ATTEMPTS = 5;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

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

  const checkIsAdmin = useCallback(async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('is_admin');
      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }
      return data === true;
    } catch (error) {
      console.error('Error checking admin role:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Check admin status after auth state changes
        if (session?.user) {
          setTimeout(async () => {
            setAdminLoading(true);
            const adminStatus = await checkIsAdmin();
            setIsAdmin(adminStatus);
            setAdminLoading(false);
          }, 0);
        } else {
          setIsAdmin(false);
          setAdminLoading(false);
        }
      }
    );

    // THEN check for existing session (funciona offline - usa localStorage)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        const adminStatus = await checkIsAdmin();
        setIsAdmin(adminStatus);
      }
      setAdminLoading(false);
    }).catch(() => {
      // Se falhar (improvável), ainda assim parar loading
      setLoading(false);
      setAdminLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [checkIsAdmin]);

  const signUp = async (email: string, password: string, name?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: name
        }
      }
    });
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
    
    // Success - reset attempt counter
    await resetLoginAttempts();
    return { error: null };
  };

  const signOut = async () => {
    // SECURITY: Clear ALL user data on logout to prevent data leakage
    try {
      // Get current user ID before signing out
      const currentUserId = user?.id;
      
      // Clear secure storage (email, login attempts)
      await clearAllSecureItems();
      
      // CRITICAL: Clear IndexedDB offline data to prevent next user seeing previous user's data
      if (currentUserId) {
        await db.clearUserData(currentUserId);
        logger.info('Cleared offline data for user on logout');
      }
    } catch (error) {
      logger.error('Error clearing user data on logout:', error);
      // Continue with logout even if cleanup fails
    }
    
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
      isAdmin,
      adminLoading,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updatePassword,
      refreshUser,
      checkLoginBlocked,
      checkIsAdmin,
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
