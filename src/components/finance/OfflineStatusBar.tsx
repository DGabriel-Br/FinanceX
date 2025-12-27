import { CloudOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export const OfflineStatusBar = () => {
  const { isOnline, isSyncing } = useOnlineStatus();

  // Só mostra quando offline ou sincronizando
  if (isOnline && !isSyncing) {
    return null;
  }

  return (
    <div 
      className={cn(
        "w-full py-1.5 flex items-center justify-center gap-2 text-xs font-medium",
        !isOnline && "bg-[#3c4043] text-[#e8eaed]",
        isSyncing && "bg-primary text-primary-foreground"
      )}
    >
      {isSyncing ? (
        <>
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Sincronizando dados...</span>
        </>
      ) : !isOnline ? (
        <>
          <CloudOff className="w-3.5 h-3.5" />
          <span>Sem conexão com a Internet</span>
        </>
      ) : null}
    </div>
  );
};
