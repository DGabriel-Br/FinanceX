import { CloudOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useOfflineModalState } from '@/hooks/useOfflineModalState';

export const OfflineStatusBar = () => {
  const { isOnline, isSyncing } = useOnlineStatus();
  const { modalDismissed } = useOfflineModalState();

  // Mostra a barra apenas se:
  // - Está sincronizando (sempre mostra)
  // - Está offline E o modal já foi fechado pelo usuário
  const showBar = isSyncing || (!isOnline && modalDismissed);

  return (
    <div 
      className={cn(
        "w-full overflow-hidden transition-all duration-300 ease-out",
        showBar ? "max-h-10 opacity-100" : "max-h-0 opacity-0"
      )}
    >
      <div 
        className={cn(
          "w-full py-1.5 flex items-center justify-center gap-2 text-xs font-medium",
          !isOnline && "bg-[#3c4043] text-[#e8eaed]",
          isSyncing && isOnline && "bg-primary text-primary-foreground"
        )}
      >
        {isSyncing && isOnline ? (
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
    </div>
  );
};
