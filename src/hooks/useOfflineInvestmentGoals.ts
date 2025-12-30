import { useState, useEffect, useCallback } from 'react';
import { InvestmentType } from '@/types/investment';
import { supabase } from '@/integrations/supabase/client';
import { db, generateTempId, LocalInvestmentGoal } from '@/lib/offline/database';
import { syncService } from '@/lib/offline/syncService';
import { offlineAdd, offlineUpdate, offlineDelete, goalMessages } from '@/lib/offline/repository';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAuthContext } from '@/contexts/AuthContext';

export interface InvestmentGoal {
  type: InvestmentType;
  targetValue: number;
}

export const useOfflineInvestmentGoals = () => {
  const { user, loading: authLoading } = useAuthContext();
  const [loading, setLoading] = useState(true);

  const userId = user?.id || null;

  // Observar metas do IndexedDB em tempo real
  const localGoals = useLiveQuery(
    async () => {
      if (!userId) return [];
      return db.investmentGoals
        .where('userId')
        .equals(userId)
        .filter(g => !g.isDeleted)
        .toArray();
    },
    [userId],
    []
  );

  // Converter para formato de InvestmentGoal
  const goals: InvestmentGoal[] = (localGoals || []).map(g => ({
    type: g.type as InvestmentType,
    targetValue: g.targetValue,
  }));

  useEffect(() => {
    if (authLoading) return;
    setLoading(false);
  }, [authLoading]);

  // Adicionar ou atualizar meta
  const setGoal = useCallback(async (type: InvestmentType, targetValue: number) => {
    if (!userId) return;

    const now = Date.now();
    
    // Verificar se já existe localmente
    const existingLocal = await db.investmentGoals
      .where('userId')
      .equals(userId)
      .filter(g => g.type === type && !g.isDeleted)
      .first();
    
    if (existingLocal) {
      // Atualizar existente
      await offlineUpdate({
        id: existingLocal.id,
        messages: goalMessages,
        updateLocal: async (now) => {
          await db.investmentGoals.update(existingLocal.id, {
            targetValue,
            syncStatus: 'pending',
            localUpdatedAt: now,
          });
        },
        syncToServer: async () => {
          const result = await supabase
            .from('investment_goals')
            .update({ target_value: targetValue })
            .eq('id', existingLocal.id);
          return { error: result.error };
        },
        onSyncSuccess: async (now) => {
          await db.investmentGoals.update(existingLocal.id, {
            syncStatus: 'synced',
            serverUpdatedAt: now,
          });
        },
      });
    } else {
      // Inserir nova
      const tempId = generateTempId();

      await offlineAdd<LocalInvestmentGoal, { id: string; created_at: string }>({
        tempId,
        messages: goalMessages,
        createLocal: (id, now) => ({
          id,
          type,
          targetValue,
          createdAt: now,
          userId: userId!,
          syncStatus: 'pending',
          localUpdatedAt: now,
          version: 1,
        }),
        addToDb: async (entity) => {
          await db.investmentGoals.add(entity);
        },
        syncToServer: async () => {
          const result = await supabase
            .from('investment_goals')
            .insert({ type, target_value: targetValue, user_id: userId })
            .select()
            .single();
          return { data: result.data, error: result.error };
        },
        onSyncSuccess: async (data, tempId, now) => {
          await db.transaction('rw', db.investmentGoals, async () => {
            const tempItem = await db.investmentGoals.get(tempId);
            if (tempItem) {
              await db.investmentGoals.delete(tempId);
              await db.investmentGoals.put({
                ...tempItem,
                id: data.id,
                createdAt: new Date(data.created_at).getTime(),
                syncStatus: 'synced',
                serverUpdatedAt: now,
              });
            }
          });
        },
      });
    }
  }, [userId]);

  // Remover meta
  const removeGoal = useCallback(async (type: InvestmentType) => {
    if (!userId) return;

    const existingLocal = await db.investmentGoals
      .where('userId')
      .equals(userId)
      .filter(g => g.type === type && !g.isDeleted)
      .first();

    if (existingLocal) {
      await offlineDelete({
        id: existingLocal.id,
        messages: goalMessages,
        markAsDeleted: async (now) => {
          await db.investmentGoals.update(existingLocal.id, {
            isDeleted: true,
            syncStatus: 'pending',
            localUpdatedAt: now,
          });
        },
        deleteFromServer: async () => {
          const result = await supabase
            .from('investment_goals')
            .delete()
            .eq('id', existingLocal.id);
          return { error: result.error };
        },
        removeFromLocal: async () => {
          await db.investmentGoals.delete(existingLocal.id);
        },
      });
    }
  }, [userId]);

  // Obter meta por tipo
  const getGoal = useCallback((type: InvestmentType): number | undefined => {
    return goals.find(g => g.type === type)?.targetValue;
  }, [goals]);

  const refetch = useCallback(async () => {
    if (navigator.onLine) {
      await syncService.syncAll();
    }
  }, []);

  return {
    goals,
    loading,
    setGoal,
    removeGoal,
    getGoal,
    refetch,
  };
};
