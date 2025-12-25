import { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { syncService } from '@/lib/offline/syncService';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export const SyncIndicator = () => {
  const { isOnline, isSyncing, triggerSync, lastSyncAt } = useOnlineStatus();
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

  const getStatusIcon = () => {
    if (isSyncing) {
      return <RefreshCw className="w-4 h-4 animate-spin text-primary" />;
    }
    if (!isOnline) {
      return <CloudOff className="w-4 h-4 text-yellow-500" />;
    }
    if (pendingCount > 0) {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
    return <Check className="w-4 h-4 text-income" />;
  };

  const getStatusText = () => {
    if (isSyncing) return 'Sincronizando...';
    if (!isOnline) return 'Offline';
    if (pendingCount > 0) return `${pendingCount} pendente${pendingCount > 1 ? 's' : ''}`;
    return 'Sincronizado';
  };

  const getTooltipText = () => {
    if (isSyncing) return 'Sincronizando dados com o servidor...';
    if (!isOnline) return 'Você está offline. Alterações serão sincronizadas quando a conexão for restaurada.';
    if (pendingCount > 0) return `${pendingCount} alteração(ões) aguardando sincronização. Clique para sincronizar.`;
    if (lastSyncAt) return `Última sincronização: ${lastSyncAt.toLocaleTimeString()}`;
    return 'Todos os dados estão sincronizados';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={isOnline && !isSyncing ? triggerSync : undefined}
            disabled={!isOnline || isSyncing}
            className={cn(
              "flex items-center gap-2 h-8 px-3 rounded-full transition-all",
              !isOnline && "bg-yellow-500/10 text-yellow-500",
              pendingCount > 0 && isOnline && "bg-yellow-500/10",
              pendingCount === 0 && isOnline && !isSyncing && "bg-income/10 text-income"
            )}
          >
            {getStatusIcon()}
            <span className="text-xs font-medium hidden sm:inline">
              {getStatusText()}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs max-w-[200px]">{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
