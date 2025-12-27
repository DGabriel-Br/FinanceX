import { useState, useEffect, useCallback, useRef } from 'react';
import { syncService } from '@/lib/offline/syncService';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

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
  } catch (error) {
    logger.info('[useOnlineStatus] Connectivity check failed:', error);
    return false;
  }
};

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const isCheckingRef = useRef(false);
  const isOnlineRef = useRef(true);

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

  const checkConnectivity = useCallback(async (showToast = false) => {
    if (isCheckingRef.current) return isOnlineRef.current;
    isCheckingRef.current = true;
    
    const wasOnline = isOnlineRef.current;
    const reallyOnline = await checkRealConnectivity();
    
    logger.info('[useOnlineStatus] Connectivity check:', { wasOnline, reallyOnline });
    
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

  useEffect(() => {
    logger.info('[useOnlineStatus] Setting up connectivity monitoring');
    
    checkConnectivity(false);
    
    const intervalId = setInterval(() => {
      checkConnectivity(true);
    }, 10000);

    const handleOnline = () => {
      logger.info('[useOnlineStatus] Online event triggered');
      checkConnectivity(true);
    };

    const handleOffline = () => {
      logger.info('[useOnlineStatus] Offline event triggered');
      setIsOnline(false);
      toast.warning('Você está offline. As alterações serão salvas localmente.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const removeSyncListener = syncService.addSyncListener(setIsSyncing);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      removeSyncListener();
    };
  }, [checkConnectivity]);

  return {
    isOnline,
    isSyncing,
    lastSyncAt,
    triggerSync,
    checkConnectivity,
  };
};
