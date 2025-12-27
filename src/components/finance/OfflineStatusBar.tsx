import { WifiOff, RefreshCw, Cloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useAuthContext } from '@/contexts/AuthContext';
import { syncService } from '@/lib/offline/syncService';
import { useEffect, useState } from 'react';

export const OfflineStatusBar = () => {
  const { isOnline, isSyncing } = useOnlineStatus();
  const { user } = useAuthContext();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const checkPending = async () => {
      if (user) {
        const count = await syncService.getPendingCount(user.id);
        setPendingCount(count);
      }
    };
    checkPending();
    const interval = setInterval(checkPending, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // Só mostra quando offline ou sincronizando
  if (isOnline && !isSyncing) {
    return null;
  }

  return (
    <div 
      className={cn(
        "w-full py-2 px-4 flex items-center justify-center gap-2 text-sm font-medium transition-all",
        !isOnline && "bg-yellow-600 text-yellow-50",
        isSyncing && "bg-primary text-primary-foreground"
      )}
    >
      {isSyncing ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Sincronizando dados...</span>
        </>
      ) : !isOnline ? (
        <>
          <WifiOff className="w-4 h-4" />
          <span>Sem conexão com a Internet</span>
          {pendingCount > 0 && (
            <span className="bg-yellow-800/50 px-2 py-0.5 rounded-full text-xs">
              {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
            </span>
          )}
        </>
      ) : null}
    </div>
  );
};
