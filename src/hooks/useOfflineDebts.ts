import { useState, useEffect, useCallback } from 'react';
import { Debt } from '@/types/debt';
import { supabase } from '@/integrations/supabase/client';
import { db, generateTempId, LocalDebt } from '@/lib/offline/database';
import { syncService } from '@/lib/offline/syncService';
import { offlineAdd, offlineUpdate, offlineDelete, debtMessages } from '@/lib/offline/repository';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAuthContext } from '@/contexts/AuthContext';

export const useOfflineDebts = () => {
  const { user, loading: authLoading } = useAuthContext();
  const [loading, setLoading] = useState(true);

  const userId = user?.id || null;

  // Observar dívidas do IndexedDB em tempo real
  const localDebts = useLiveQuery(
    async () => {
      if (!userId) return [];
      return db.debts
        .where('userId')
        .equals(userId)
        .filter(d => !d.isDeleted)
        .toArray();
    },
    [userId],
    []
  );

  // Converter para formato de Debt
  const debts: Debt[] = (localDebts || []).map(d => ({
    id: d.id,
    name: d.name,
    totalValue: d.totalValue,
    monthlyInstallment: d.monthlyInstallment,
    startDate: d.startDate,
    paidValue: d.paidValue,
    createdAt: d.createdAt,
  }));

  useEffect(() => {
    if (authLoading) return;
    setLoading(false);
  }, [authLoading]);

  // Adicionar dívida
  const addDebt = useCallback(async (debt: Omit<Debt, 'id' | 'createdAt'>) => {
    if (!userId) return null;

    const tempId = generateTempId();

    const result = await offlineAdd<LocalDebt, { id: string; created_at: number }>({
      tempId,
      messages: debtMessages,
      createLocal: (id, now) => ({
        id,
        name: debt.name,
        totalValue: debt.totalValue,
        monthlyInstallment: debt.monthlyInstallment,
        startDate: debt.startDate,
        paidValue: debt.paidValue || 0,
        createdAt: now,
        userId: userId!,
        syncStatus: 'pending',
        localUpdatedAt: now,
        version: 1,
      }),
      addToDb: async (entity) => {
        await db.debts.add(entity);
      },
      syncToServer: async () => {
        const result = await supabase
          .from('debts')
          .insert({
            name: debt.name,
            total_value: debt.totalValue,
            monthly_installment: debt.monthlyInstallment,
            start_date: debt.startDate,
            paid_value: debt.paidValue || 0,
            user_id: userId,
          })
          .select()
          .single();
        return { data: result.data, error: result.error };
      },
      onSyncSuccess: async (data, tempId, now) => {
        await db.transaction('rw', db.debts, async () => {
          const tempItem = await db.debts.get(tempId);
          if (tempItem) {
            await db.debts.delete(tempId);
            await db.debts.put({
              ...tempItem,
              id: data.id,
              createdAt: Number(data.created_at),
              syncStatus: 'synced',
              serverUpdatedAt: now,
            });
          }
        });
      },
    });

    return result ? {
      id: result.id,
      ...debt,
      createdAt: result.createdAt,
    } : null;
  }, [userId]);

  // Atualizar dívida
  const updateDebt = useCallback(async (id: string, updates: Partial<Omit<Debt, 'id' | 'createdAt'>>) => {
    if (!userId) return;
    
    await offlineUpdate({
      id,
      messages: debtMessages,
      updateLocal: async (now) => {
        await db.debts.update(id, {
          ...updates,
          syncStatus: 'pending',
          localUpdatedAt: now,
        });
      },
      syncToServer: async () => {
        const updateData: Record<string, unknown> = {};
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.totalValue !== undefined) updateData.total_value = updates.totalValue;
        if (updates.monthlyInstallment !== undefined) updateData.monthly_installment = updates.monthlyInstallment;
        if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
        if (updates.paidValue !== undefined) updateData.paid_value = updates.paidValue;

        // SECURITY: Always include user_id filter for defense in depth
        const result = await supabase.from('debts').update(updateData).eq('id', id).eq('user_id', userId);
        return { error: result.error };
      },
      onSyncSuccess: async (now) => {
        await db.debts.update(id, {
          syncStatus: 'synced',
          serverUpdatedAt: now,
        });
      },
    });
  }, [userId]);

  // Excluir dívida
  const deleteDebt = useCallback(async (id: string) => {
    if (!userId) return;
    
    await offlineDelete({
      id,
      messages: debtMessages,
      markAsDeleted: async (now) => {
        await db.debts.update(id, {
          isDeleted: true,
          syncStatus: 'pending',
          localUpdatedAt: now,
        });
      },
      deleteFromServer: async () => {
        // SECURITY: Always include user_id filter for defense in depth
        const result = await supabase.from('debts').delete().eq('id', id).eq('user_id', userId);
        return { error: result.error };
      },
      removeFromLocal: async () => {
        await db.debts.delete(id);
      },
    });
  }, [userId]);

  const refetch = useCallback(async () => {
    if (navigator.onLine) {
      await syncService.syncAll();
    }
  }, []);

  return {
    debts,
    loading,
    addDebt,
    updateDebt,
    deleteDebt,
    refetch,
  };
};
