import { useState, useEffect, useCallback } from 'react';
import { Transaction, TransactionCategory } from '@/types/transaction';
import { CustomDateRange } from '@/components/finance/PeriodFilter';
import { startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { db, generateTempId, LocalTransaction } from '@/infra/offline/database';
import { syncService } from '@/infra/offline/syncService';
import { offlineAdd, offlineUpdate, offlineDelete, transactionMessages } from '@/infra/offline/repository';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAuthContext } from '@/contexts/AuthContext';

// Função para obter data local no formato YYYY-MM-DD
export const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Função para criar Date a partir de string YYYY-MM-DD sem problemas de fuso
export const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const useOfflineTransactions = () => {
  const { user, loading: authLoading } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [customRange, setCustomRange] = useState<CustomDateRange | null>(() => {
    const today = new Date();
    return { start: startOfMonth(today), end: endOfMonth(today) };
  });

  const userId = user?.id || null;

  // Observar transações do IndexedDB em tempo real
  const localTransactions = useLiveQuery(
    async () => {
      if (!userId) return [];
      return db.transactions
        .where('userId')
        .equals(userId)
        .filter(t => !t.isDeleted)
        .toArray();
    },
    [userId],
    []
  );

  // Converter para formato de Transaction
  const transactions: Transaction[] = (localTransactions || []).map(t => ({
    id: t.id,
    type: t.type as 'receita' | 'despesa',
    category: t.category as TransactionCategory,
    date: t.date,
    description: t.description,
    value: t.value,
    createdAt: t.createdAt,
  }));

  useEffect(() => {
    if (authLoading) return;
    setLoading(false);
  }, [authLoading]);

  // Adicionar transação
  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!userId) return;

    const tempId = generateTempId();

    await offlineAdd<LocalTransaction, { id: string; created_at: number }>({
      tempId,
      messages: transactionMessages,
      createLocal: (id, now) => ({
        id,
        type: transaction.type,
        category: transaction.category,
        date: transaction.date,
        description: transaction.description,
        value: transaction.value,
        createdAt: now,
        userId: userId!,
        syncStatus: 'pending',
        localUpdatedAt: now,
        version: 1,
      }),
      addToDb: async (entity) => {
        await db.transactions.add(entity);
      },
      syncToServer: async () => {
        const result = await supabase
          .from('transactions')
          .insert({
            type: transaction.type,
            category: transaction.category,
            date: transaction.date,
            description: transaction.description,
            value: transaction.value,
            user_id: userId,
          })
          .select()
          .single();
        return { data: result.data, error: result.error };
      },
      onSyncSuccess: async (data, tempId, now) => {
        await db.transaction('rw', db.transactions, async () => {
          const tempItem = await db.transactions.get(tempId);
          if (tempItem) {
            await db.transactions.delete(tempId);
            await db.transactions.put({
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
  }, [userId]);

  // Atualizar transação
  const updateTransaction = useCallback(async (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => {
    if (!userId) return;
    
    await offlineUpdate({
      id,
      messages: transactionMessages,
      updateLocal: async (now) => {
        await db.transactions.update(id, {
          ...updates,
          syncStatus: 'pending',
          localUpdatedAt: now,
        });
      },
      syncToServer: async () => {
        // SECURITY: Always include user_id filter for defense in depth
        const result = await supabase
          .from('transactions')
          .update({
            type: updates.type,
            category: updates.category,
            date: updates.date,
            description: updates.description,
            value: updates.value,
          })
          .eq('id', id)
          .eq('user_id', userId);
        return { error: result.error };
      },
      onSyncSuccess: async (now) => {
        await db.transactions.update(id, {
          syncStatus: 'synced',
          serverUpdatedAt: now,
        });
      },
    });
  }, [userId]);

  // Excluir transação
  const deleteTransaction = useCallback(async (id: string) => {
    if (!userId) return;
    
    await offlineDelete({
      id,
      messages: transactionMessages,
      markAsDeleted: async (now) => {
        await db.transactions.update(id, {
          isDeleted: true,
          syncStatus: 'pending',
          localUpdatedAt: now,
        });
      },
      deleteFromServer: async () => {
        // SECURITY: Always include user_id filter for defense in depth
        const result = await supabase.from('transactions').delete().eq('id', id).eq('user_id', userId);
        return { error: result.error };
      },
      removeFromLocal: async () => {
        await db.transactions.delete(id);
      },
    });
  }, [userId]);

  // Filtrar transações por período
  const getFilteredTransactions = useCallback(() => {
    let filtered = transactions;
    
    if (customRange) {
      filtered = transactions.filter(t => {
        const transactionDate = parseLocalDate(t.date);
        const startDate = new Date(customRange.start);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(customRange.end);
        endDate.setHours(23, 59, 59, 999);
        
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    return filtered.sort((a, b) => {
      const dateA = parseLocalDate(a.date);
      const dateB = parseLocalDate(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [transactions, customRange]);

  // Calcular saldo anterior
  const getPreviousBalance = useCallback(() => {
    if (!customRange) return 0;
    
    const startDate = new Date(customRange.start);
    startDate.setHours(0, 0, 0, 0);
    
    const previousTransactions = transactions.filter(t => {
      const transactionDate = parseLocalDate(t.date);
      return transactionDate < startDate;
    });
    
    const previousReceitas = previousTransactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.value, 0);
    
    const previousDespesas = previousTransactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.value, 0);
    
    return previousReceitas - previousDespesas;
  }, [transactions, customRange]);

  // Calcular totais
  const getTotals = useCallback(() => {
    const filtered = getFilteredTransactions();
    const previousBalance = getPreviousBalance();
    
    const receitasPeriodo = filtered
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.value, 0);
    
    const despesasPeriodo = filtered
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.value, 0);
    
    const receitas = receitasPeriodo + (previousBalance > 0 ? previousBalance : 0);
    const despesas = despesasPeriodo + (previousBalance < 0 ? Math.abs(previousBalance) : 0);
    
    const saldoPeriodo = receitasPeriodo - despesasPeriodo;
    
    return {
      receitas,
      despesas,
      saldoAnterior: previousBalance,
      saldoPeriodo,
      saldo: receitas - despesas,
    };
  }, [getFilteredTransactions, getPreviousBalance]);

  const refetch = useCallback(async () => {
    if (navigator.onLine) {
      await syncService.syncAll();
    }
  }, []);

  return {
    transactions,
    loading,
    customRange,
    setCustomRange,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getFilteredTransactions,
    getTotals,
    refetch,
  };
};
