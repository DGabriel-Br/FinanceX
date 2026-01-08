import { useEffect } from 'react';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { syncService } from '@/infra/offline/syncService';

interface AppShellSyncManagerProps {
  userId: string | undefined;
}

/**
 * Responsável por gerenciar sincronização e listeners realtime
 */
export const AppShellSyncManager = ({ userId }: AppShellSyncManagerProps) => {
  // Ativa sincronização em tempo real com o servidor
  useRealtimeSync();

  // Sincronizar quando o usuário logar
  useEffect(() => {
    if (userId && navigator.onLine) {
      syncService.syncAll();
    }
  }, [userId]);

  // Este componente não renderiza nada visualmente
  return null;
};
