import { useState, useEffect, useCallback, useRef } from 'react';
import { syncService } from '@/lib/offline/syncService';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

/**
 * Verifica conectividade real fazendo um ping para um endpoint confiável
 * navigator.onLine não é confiável em WebViews/Capacitor
 */
const checkRealConnectivity = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl) {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeoutId);
      return response.ok || response.status === 401;
    }
    
    const response = await fetch('https://dns.google/resolve?name=google.com', {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Verifica conectividade com retry para casos de retorno do background
 * onde a conexão pode demorar um pouco para restabelecer
 */
const checkConnectivityWithRetry = async (retries = 3, delayMs = 1000): Promise<boolean> => {
  for (let i = 0; i < retries; i++) {
    const isConnected = await checkRealConnectivity();
    if (isConnected) return true;
    
    // Aguarda antes de tentar novamente (exceto na última tentativa)
    if (i < retries - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  return false;
};

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const isCheckingRef = useRef(false);
  const isOnlineRef = useRef(true);
  const isResumingRef = useRef(false);

  // Mantém ref atualizada
  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);

  const triggerSync = useCallback(async () => {
    const reallyOnline = await checkRealConnectivity();
    if (!reallyOnline) {
      toast.error('Sem conexão com a internet');
      return;
    }

    const result = await syncService.syncAll();
    
    if (result.success) {
      setLastSyncAt(new Date());
      const total = result.syncedTransactions + result.syncedDebts + result.syncedGoals;
      if (total > 0) {
        toast.success(`${total} alterações sincronizadas!`);
      }
    } else if (result.errors.length > 0) {
      toast.error(`Alguns itens não foram sincronizados`);
    }

    return result;
  }, []);

  const checkConnectivity = useCallback(async (showToast = false, useRetry = false) => {
    if (isCheckingRef.current) return isOnlineRef.current;
    isCheckingRef.current = true;
    
    const wasOnline = isOnlineRef.current;
    const reallyOnline = useRetry 
      ? await checkConnectivityWithRetry() 
      : await checkRealConnectivity();
    
    if (reallyOnline !== wasOnline) {
      setIsOnline(reallyOnline);
      
      if (reallyOnline && !wasOnline) {
        if (showToast) {
          toast.success('Conexão restaurada! Sincronizando dados...');
        }
        triggerSync();
      } else if (!reallyOnline && wasOnline) {
        if (showToast) {
          toast.warning('Você está offline. As alterações serão salvas localmente.');
        }
      }
    }
    
    isCheckingRef.current = false;
    return reallyOnline;
  }, [triggerSync]);

  // Handler para quando o app volta do background
  const handleAppResume = useCallback(async () => {
    if (isResumingRef.current) return;
    isResumingRef.current = true;
    
    // Aguarda um momento para a conexão restabelecer após sair do background
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Usa retry para lidar com a reconexão gradual
    await checkConnectivity(false, true);
    
    isResumingRef.current = false;
  }, [checkConnectivity]);

  useEffect(() => {
    checkConnectivity(false);
    
    const intervalId = setInterval(() => {
      // Não verifica durante o processo de resume
      if (!isResumingRef.current) {
        checkConnectivity(true);
      }
    }, 10000);

    const handleOnline = () => {
      checkConnectivity(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Você está offline. As alterações serão salvas localmente.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listener para quando o app volta do background (nativo)
    let appStateListener: { remove: () => void } | null = null;
    
    if (Capacitor.isNativePlatform()) {
      App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          handleAppResume();
        }
      }).then(listener => {
        appStateListener = listener;
      });
    }

    // Listener para visibilidade da página (web)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleAppResume();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const removeSyncListener = syncService.addSyncListener(setIsSyncing);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      appStateListener?.remove();
      removeSyncListener();
    };
  }, [checkConnectivity, handleAppResume]);

  return {
    isOnline,
    isSyncing,
    lastSyncAt,
    triggerSync,
    checkConnectivity,
  };
};
