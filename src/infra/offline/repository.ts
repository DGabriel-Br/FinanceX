/**
 * Utilitários centralizados para operações offline-first.
 * Simplifica a lógica de sincronização.
 */
import { db, generateTempId, isTempId, LocalTransaction, LocalDebt, LocalInvestmentGoal } from './database';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

type SyncMessages = {
  added: string;
  addedOffline: string;
  updated: string;
  updatedOffline: string;
  deleted: string;
  deletedOffline: string;
  error: string;
};

/**
 * Executa uma operação de adição com padrão offline-first
 */
export async function offlineAdd<TLocal, TServer>(options: {
  createLocal: (tempId: string, now: number) => TLocal;
  addToDb: (entity: TLocal) => Promise<void>;
  syncToServer: () => Promise<{ data: TServer | null; error: unknown }>;
  onSyncSuccess: (data: TServer, tempId: string, now: number) => Promise<void>;
  messages: SyncMessages;
  tempId: string;
}): Promise<TLocal | null> {
  const { createLocal, addToDb, syncToServer, onSyncSuccess, messages, tempId } = options;
  const now = Date.now();

  try {
    const localEntity = createLocal(tempId, now);

    // Salvar localmente primeiro
    await addToDb(localEntity);

    // Se online, sincronizar imediatamente
    if (navigator.onLine) {
      try {
        const { data, error } = await syncToServer();

        if (!error && data) {
          await onSyncSuccess(data, tempId, now);
        }
        toast.success(messages.added);
      } catch (syncError) {
        logger.error('Erro ao sincronizar:', syncError);
        toast.success(messages.addedOffline);
      }
    } else {
      toast.success(messages.addedOffline);
    }

    return localEntity;
  } catch (error) {
    logger.error('Erro ao adicionar:', error);
    toast.error(messages.error);
    return null;
  }
}

/**
 * Executa uma operação de atualização com padrão offline-first
 */
export async function offlineUpdate(options: {
  id: string;
  updateLocal: (now: number) => Promise<void>;
  syncToServer: () => Promise<{ error: unknown }>;
  onSyncSuccess: (now: number) => Promise<void>;
  messages: SyncMessages;
}): Promise<boolean> {
  const { id, updateLocal, syncToServer, onSyncSuccess, messages } = options;
  const now = Date.now();

  try {
    await updateLocal(now);

    if (navigator.onLine && !isTempId(id)) {
      const { error } = await syncToServer();

      if (!error) {
        await onSyncSuccess(now);
      }
      toast.success(messages.updated);
    } else {
      toast.success(messages.updatedOffline);
    }

    return true;
  } catch (error) {
    logger.error('Erro ao atualizar:', error);
    toast.error(messages.error);
    return false;
  }
}

/**
 * Executa uma operação de deleção com padrão offline-first
 */
export async function offlineDelete(options: {
  id: string;
  markAsDeleted: (now: number) => Promise<void>;
  deleteFromServer: () => Promise<{ error: unknown }>;
  removeFromLocal: () => Promise<void>;
  messages: SyncMessages;
}): Promise<boolean> {
  const { id, markAsDeleted, deleteFromServer, removeFromLocal, messages } = options;
  const now = Date.now();

  try {
    await markAsDeleted(now);

    if (navigator.onLine && !isTempId(id)) {
      const { error } = await deleteFromServer();

      if (!error) {
        await removeFromLocal();
      }
      toast.success(messages.deleted);
    } else {
      toast.success(messages.deletedOffline);
    }

    return true;
  } catch (error) {
    logger.error('Erro ao excluir:', error);
    toast.error(messages.error);
    return false;
  }
}

// Mensagens padrão por entidade
export const transactionMessages: SyncMessages = {
  added: 'Transação adicionada!',
  addedOffline: 'Transação salva localmente',
  updated: 'Transação atualizada!',
  updatedOffline: 'Alteração salva localmente',
  deleted: 'Transação excluída!',
  deletedOffline: 'Exclusão salva localmente',
  error: 'Erro na operação',
};

export const debtMessages: SyncMessages = {
  added: 'Dívida adicionada!',
  addedOffline: 'Dívida salva localmente',
  updated: 'Dívida atualizada!',
  updatedOffline: 'Alteração salva localmente',
  deleted: 'Dívida excluída!',
  deletedOffline: 'Exclusão salva localmente',
  error: 'Erro na operação',
};

export const goalMessages: SyncMessages = {
  added: 'Meta atualizada!',
  addedOffline: 'Meta salva localmente',
  updated: 'Meta atualizada!',
  updatedOffline: 'Meta salva localmente',
  deleted: 'Meta removida!',
  deletedOffline: 'Remoção salva localmente',
  error: 'Erro na operação',
};

// Re-export utilities for convenience
export { db, generateTempId, isTempId } from './database';
export type { LocalTransaction, LocalDebt, LocalInvestmentGoal };
