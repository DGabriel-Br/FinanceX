import { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, Check, AlertCircle, Database, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { syncService } from '@/lib/offline/syncService';
import { db } from '@/lib/offline/database';
import { useAuthContext } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface SyncStats {
  pendingCount: number;
  hasConflicts: boolean;
  lastSyncAt: Date | null;
  totalLocal: number;
}

export const SyncIndicator = ({ compact = false }: { compact?: boolean }) => {
  const { isOnline, isSyncing, triggerSync, lastSyncAt } = useOnlineStatus();
  const { user } = useAuthContext();
  const [stats, setStats] = useState<SyncStats>({
    pendingCount: 0,
    hasConflicts: false,
    lastSyncAt: null,
    totalLocal: 0,
  });

  useEffect(() => {
    const checkStats = async () => {
      if (user) {
        const [pendingCount, hasConflicts, dbStats] = await Promise.all([
          syncService.getPendingCount(user.id),
          db.hasConflicts(user.id),
          db.getStats(user.id),
        ]);
        setStats({
          pendingCount,
          hasConflicts,
          lastSyncAt,
          totalLocal: dbStats.transactions + dbStats.debts + dbStats.goals,
        });
      }
    };

    checkStats();
    const interval = setInterval(checkStats, 3000);
    return () => clearInterval(interval);
  }, [user, lastSyncAt]);

  const getStatusIcon = () => {
    if (isSyncing) {
      return <RefreshCw className="w-4 h-4 animate-spin text-primary" />;
    }
    if (stats.hasConflicts) {
      return <AlertCircle className="w-4 h-4 text-expense" />;
    }
    if (!isOnline) {
      return <WifiOff className="w-4 h-4 text-yellow-500" />;
    }
    if (stats.pendingCount > 0) {
      return <Cloud className="w-4 h-4 text-yellow-500" />;
    }
    return <Check className="w-4 h-4 text-income" />;
  };

  const getStatusColor = () => {
    if (stats.hasConflicts) return 'bg-expense/10 text-expense border-expense/20';
    if (!isOnline) return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
    if (stats.pendingCount > 0) return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
    if (isSyncing) return 'bg-primary/10 text-primary border-primary/20';
    return 'bg-income/10 text-income border-income/20';
  };

  const getStatusText = () => {
    if (isSyncing) return 'Sincronizando...';
    if (stats.hasConflicts) return 'Conflitos';
    if (!isOnline) return 'Offline';
    if (stats.pendingCount > 0) return `${stats.pendingCount} pendente${stats.pendingCount > 1 ? 's' : ''}`;
    return 'Sincronizado';
  };

  const getDetailedStatus = () => {
    const lines: string[] = [];
    
    if (!isOnline) {
      lines.push('📴 Sem conexão com a internet');
      lines.push('💾 Seus dados estão salvos localmente');
      lines.push('🔄 Sincronizará automaticamente ao reconectar');
    } else if (isSyncing) {
      lines.push('🔄 Sincronizando com o servidor...');
    } else if (stats.hasConflicts) {
      lines.push('⚠️ Existem conflitos de sincronização');
      lines.push('Alguns dados precisam de revisão manual');
    } else if (stats.pendingCount > 0) {
      lines.push(`📤 ${stats.pendingCount} alteração(ões) aguardando`);
      lines.push('Clique para sincronizar agora');
    } else {
      lines.push('✅ Todos os dados sincronizados');
    }
    
    if (stats.totalLocal > 0) {
      lines.push(`📊 ${stats.totalLocal} registros armazenados localmente`);
    }
    
    if (lastSyncAt) {
      lines.push(`🕐 Última sync: ${lastSyncAt.toLocaleTimeString()}`);
    }
    
    return lines;
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full border transition-all",
              getStatusColor()
            )}>
              {getStatusIcon()}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-[250px]">
            <div className="space-y-1">
              {getDetailedStatus().map((line, i) => (
                <p key={i} className="text-xs">{line}</p>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={isOnline && !isSyncing ? () => triggerSync() : undefined}
            disabled={!isOnline || isSyncing}
            className={cn(
              "flex items-center gap-2 h-8 px-3 rounded-full border transition-all",
              getStatusColor()
            )}
          >
            {getStatusIcon()}
            <span className="text-xs font-medium hidden sm:inline">
              {getStatusText()}
            </span>
            {stats.pendingCount > 0 && (
              <Badge 
                variant="secondary" 
                className="h-5 min-w-5 flex items-center justify-center p-0 text-[10px] bg-yellow-500/20"
              >
                {stats.pendingCount}
              </Badge>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[250px]">
          <div className="space-y-1">
            {getDetailedStatus().map((line, i) => (
              <p key={i} className="text-xs">{line}</p>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Componente compacto para mobile
export const SyncBadge = () => {
  const { isOnline, isSyncing } = useOnlineStatus();
  const { user } = useAuthContext();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const check = async () => {
      if (user) {
        const count = await syncService.getPendingCount(user.id);
        setPendingCount(count);
      }
    };
    check();
    const interval = setInterval(check, 5000);
    return () => clearInterval(interval);
  }, [user]);

  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null; // Não mostrar quando tudo está ok
  }

  return (
    <div className={cn(
      "fixed top-2 right-2 z-50 flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium shadow-lg",
      !isOnline && "bg-yellow-500/90 text-yellow-950",
      isOnline && pendingCount > 0 && "bg-primary/90 text-primary-foreground",
      isSyncing && "bg-primary/90 text-primary-foreground"
    )}>
      {isSyncing ? (
        <>
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>Sincronizando</span>
        </>
      ) : !isOnline ? (
        <>
          <WifiOff className="w-3 h-3" />
          <span>Offline</span>
          {pendingCount > 0 && (
            <Badge variant="secondary" className="h-4 min-w-4 p-0 text-[10px]">
              {pendingCount}
            </Badge>
          )}
        </>
      ) : pendingCount > 0 ? (
        <>
          <Cloud className="w-3 h-3" />
          <span>{pendingCount} pendente{pendingCount > 1 ? 's' : ''}</span>
        </>
      ) : null}
    </div>
  );
};
