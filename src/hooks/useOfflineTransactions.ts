import { useState, useEffect, useCallback } from 'react';
import { Transaction, TransactionCategory } from '@/types/transaction';
import { CustomDateRange } from '@/components/finance/PeriodFilter';
import { startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { db, generateTempId, LocalTransaction } from '@/lib/offline/database';
import { syncService } from '@/lib/offline/syncService';
import { toast } from 'sonner';
import { useLiveQuery } from 'dexie-react-hooks';
import { logger } from '@/lib/logger';

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
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [customRange, setCustomRange] = useState<CustomDateRange | null>(() => {
    const today = new Date();
    return { start: startOfMonth(today), end: endOfMonth(today) };
  });

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

  // Inicialização
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          
          // Se online, sincronizar
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

  // Adicionar transação (funciona offline)
  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      if (!userId) throw new Error('Usuário não autenticado');

      const now = Date.now();
      const tempId = generateTempId();
      
      const localTransaction: LocalTransaction = {
        id: tempId,
        type: transaction.type,
        category: transaction.category,
        date: transaction.date,
        description: transaction.description,
        value: transaction.value,
        createdAt: now,
        userId,
        syncStatus: 'pending',
        localUpdatedAt: now,
      };

      // Salvar localmente
      await db.transactions.add(localTransaction);

      // Se online, sincronizar imediatamente
      if (navigator.onLine) {
        const { data, error } = await supabase
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

        if (!error && data) {
          // Atualizar com ID real
          await db.transactions.delete(tempId);
          await db.transactions.add({
            ...localTransaction,
            id: data.id,
            createdAt: Number(data.created_at),
            syncStatus: 'synced',
            serverUpdatedAt: now,
          });
        }
      }

      toast.success(navigator.onLine ? 'Transação adicionada!' : 'Transação salva localmente');
    } catch (error) {
      logger.error('Erro ao adicionar transação:', error);
      toast.error('Erro ao adicionar transação');
    }
  }, [userId]);

  // Atualizar transação
  const updateTransaction = useCallback(async (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => {
    try {
      const existing = await db.transactions.get(id);
      if (!existing) throw new Error('Transação não encontrada');

      const now = Date.now();
      
      await db.transactions.update(id, {
        ...updates,
        syncStatus: 'pending',
        localUpdatedAt: now,
      });

      // Se online, sincronizar imediatamente
      if (navigator.onLine) {
        const { error } = await supabase
          .from('transactions')
          .update({
            type: updates.type,
            category: updates.category,
            date: updates.date,
            description: updates.description,
            value: updates.value,
          })
          .eq('id', id);

        if (!error) {
          await db.transactions.update(id, {
            syncStatus: 'synced',
            serverUpdatedAt: now,
          });
        }
      }

      toast.success(navigator.onLine ? 'Transação atualizada!' : 'Alteração salva localmente');
    } catch (error) {
      logger.error('Erro ao atualizar transação:', error);
      toast.error('Erro ao atualizar transação');
    }
  }, []);

  // Excluir transação
  const deleteTransaction = useCallback(async (id: string) => {
    try {
      const now = Date.now();

      // Marcar como deletada
      await db.transactions.update(id, {
        isDeleted: true,
        syncStatus: 'pending',
        localUpdatedAt: now,
      });

      // Se online, sincronizar imediatamente
      if (navigator.onLine) {
        const { error } = await supabase
          .from('transactions')
          .delete()
          .eq('id', id);

        if (!error) {
          await db.transactions.delete(id);
        }
      }

      toast.success(navigator.onLine ? 'Transação excluída!' : 'Exclusão salva localmente');
    } catch (error) {
      logger.error('Erro ao excluir transação:', error);
      toast.error('Erro ao excluir transação');
    }
  }, []);

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
    
    const receitas = filtered
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.value, 0);
    
    const despesas = filtered
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.value, 0);
    
    const saldoPeriodo = receitas - despesas;
    
    return {
      receitas,
      despesas,
      saldoAnterior: previousBalance,
      saldoPeriodo,
      saldo: previousBalance + saldoPeriodo,
    };
  }, [getFilteredTransactions, getPreviousBalance]);

  // Forçar refresh
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
