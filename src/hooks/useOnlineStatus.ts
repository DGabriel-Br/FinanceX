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
    // Tenta fazer um fetch com timeout curto para verificar conexão real
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Usa o Supabase URL como endpoint de verificação (já está configurado no app)
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl) {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeoutId);
      return response.ok || response.status === 401; // 401 é esperado sem auth
    }
    
    // Fallback: tenta Google DNS como indicador de conectividade
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
  const [isOnline, setIsOnline] = useState(true); // Assume online inicialmente
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingRef = useRef(false);

  // Função para verificar e atualizar status de conectividade
  const checkConnectivity = useCallback(async (showToast = false) => {
    // Evita verificações simultâneas
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;
    
    const wasOnline = isOnline;
    const reallyOnline = await checkRealConnectivity();
    
    logger.info('[useOnlineStatus] Connectivity check result:', { wasOnline, reallyOnline });
    
    if (reallyOnline !== wasOnline) {
      setIsOnline(reallyOnline);
      
      if (reallyOnline && !wasOnline) {
        if (showToast) {
          toast.success('Conexão restaurada! Sincronizando dados...');
        }
        // Auto-sync quando voltar online
        triggerSync();
      } else if (!reallyOnline && wasOnline) {
        if (showToast) {
          toast.warning('Você está offline. As alterações serão salvas localmente.');
        }
      }
    }
    
    isCheckingRef.current = false;
    return reallyOnline;
  }, [isOnline]);

  useEffect(() => {
    logger.info('[useOnlineStatus] Setting up connectivity monitoring');
    
    // Verificação inicial
    checkConnectivity(false);
    
    // Verificação periódica a cada 10 segundos
    checkIntervalRef.current = setInterval(() => {
      checkConnectivity(true);
    }, 10000);

    // Também escuta os eventos nativos como fallback rápido
    const handleOnline = () => {
      logger.info('[useOnlineStatus] Online event triggered - verifying...');
      checkConnectivity(true);
    };

    const handleOffline = () => {
      logger.info('[useOnlineStatus] Offline event triggered');
      setIsOnline(false);
      toast.warning('Você está offline. As alterações serão salvas localmente.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listener para estado de sincronização
    const removeSyncListener = syncService.addSyncListener(setIsSyncing);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      removeSyncListener();
    };
  }, [checkConnectivity]);

  const triggerSync = useCallback(async () => {
    // Verifica conectividade real antes de sincronizar
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

  return {
    isOnline,
    isSyncing,
    lastSyncAt,
    triggerSync,
    checkConnectivity, // Expõe para verificação manual
  };
};
