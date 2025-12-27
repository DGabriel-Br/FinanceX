import { useState, useEffect, useCallback } from 'react';
import { syncService } from '@/lib/offline/syncService';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(() => {
    const online = navigator.onLine;
    logger.info('[useOnlineStatus] Initial online status:', online);
    return online;
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);

  useEffect(() => {
    logger.info('[useOnlineStatus] Setting up online/offline listeners');
    
    const handleOnline = () => {
      logger.info('[useOnlineStatus] Online event triggered');
      setIsOnline(true);
      toast.success('Conexão restaurada! Sincronizando dados...');
      // Auto-sync quando voltar online
      triggerSync();
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
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      removeSyncListener();
    };
  }, []);

  const triggerSync = useCallback(async () => {
    if (!navigator.onLine) {
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
  };
};
