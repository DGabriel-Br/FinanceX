import { useState, useEffect, useCallback } from 'react';
import { Debt } from '@/types/debt';
import { supabase } from '@/integrations/supabase/client';
import { db, generateTempId, LocalDebt } from '@/lib/offline/database';
import { syncService } from '@/lib/offline/syncService';
import { toast } from 'sonner';
import { useLiveQuery } from 'dexie-react-hooks';
import { logger } from '@/lib/logger';

export const useOfflineDebts = () => {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

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

  // Inicialização
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          
          if (navigator.onLine) {
            await syncService.syncAll();
          }
        }
      } catch (error) {
        logger.error('Erro ao inicializar:', error);
      } finally {
        setLoading(false);
      }
    };
    
    init();
  }, []);

  // Adicionar dívida
  const addDebt = useCallback(async (debt: Omit<Debt, 'id' | 'createdAt'>) => {
    try {
      if (!userId) throw new Error('Usuário não autenticado');

      const now = Date.now();
      const tempId = generateTempId();
      
      const localDebt: LocalDebt = {
        id: tempId,
        name: debt.name,
        totalValue: debt.totalValue,
        monthlyInstallment: debt.monthlyInstallment,
        startDate: debt.startDate,
        paidValue: debt.paidValue || 0,
        createdAt: now,
        userId,
        syncStatus: 'pending',
        localUpdatedAt: now,
      };

      await db.debts.add(localDebt);

      if (navigator.onLine) {
        const { data, error } = await supabase
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

        if (!error && data) {
          await db.debts.delete(tempId);
          await db.debts.add({
            ...localDebt,
            id: data.id,
            createdAt: Number(data.created_at),
            syncStatus: 'synced',
            serverUpdatedAt: now,
          });
        }
      }

      toast.success(navigator.onLine ? 'Dívida adicionada!' : 'Dívida salva localmente');
      
      return {
        id: tempId,
        ...debt,
        createdAt: now,
      };
    } catch (error) {
      logger.error('Erro ao adicionar dívida:', error);
      toast.error('Erro ao adicionar dívida');
      return null;
    }
  }, [userId]);

  // Atualizar dívida
  const updateDebt = useCallback(async (id: string, updates: Partial<Omit<Debt, 'id' | 'createdAt'>>) => {
    try {
      const now = Date.now();
      
      await db.debts.update(id, {
        ...updates,
        syncStatus: 'pending',
        localUpdatedAt: now,
      });

      if (navigator.onLine) {
        const updateData: Record<string, unknown> = {};
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.totalValue !== undefined) updateData.total_value = updates.totalValue;
        if (updates.monthlyInstallment !== undefined) updateData.monthly_installment = updates.monthlyInstallment;
        if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
        if (updates.paidValue !== undefined) updateData.paid_value = updates.paidValue;

        const { error } = await supabase
          .from('debts')
          .update(updateData)
          .eq('id', id);

        if (!error) {
          await db.debts.update(id, {
            syncStatus: 'synced',
            serverUpdatedAt: now,
          });
        }
      }

      toast.success(navigator.onLine ? 'Dívida atualizada!' : 'Alteração salva localmente');
    } catch (error) {
      logger.error('Erro ao atualizar dívida:', error);
      toast.error('Erro ao atualizar dívida');
    }
  }, []);

  // Excluir dívida
  const deleteDebt = useCallback(async (id: string) => {
    try {
      const now = Date.now();

      await db.debts.update(id, {
        isDeleted: true,
        syncStatus: 'pending',
        localUpdatedAt: now,
      });

      if (navigator.onLine) {
        const { error } = await supabase
          .from('debts')
          .delete()
          .eq('id', id);

        if (!error) {
          await db.debts.delete(id);
        }
      }

      toast.success(navigator.onLine ? 'Dívida excluída!' : 'Exclusão salva localmente');
    } catch (error) {
      logger.error('Erro ao excluir dívida:', error);
      toast.error('Erro ao excluir dívida');
    }
  }, []);

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
