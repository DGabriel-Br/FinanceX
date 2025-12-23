import { useState, useEffect, useCallback } from 'react';
import { Transaction, TransactionCategory } from '@/types/transaction';
import { CustomDateRange } from '@/components/finance/PeriodFilter';
import { startOfMonth, endOfMonth } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [customRange, setCustomRange] = useState<CustomDateRange | null>(() => {
    const today = new Date();
    return { start: startOfMonth(today), end: endOfMonth(today) };
  });

  // Carregar do Supabase ao iniciar
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedData: Transaction[] = (data || []).map((t) => ({
        id: t.id,
        type: t.type as 'receita' | 'despesa',
        category: t.category as TransactionCategory,
        date: t.date,
        description: t.description,
        value: Number(t.value),
        createdAt: Number(t.created_at),
      }));

      setTransactions(mappedData);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      toast.error('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  // Adicionar nova transação
  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          type: transaction.type,
          category: transaction.category,
          date: transaction.date,
          description: transaction.description,
          value: transaction.value,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      const newTransaction: Transaction = {
        id: data.id,
        type: data.type as 'receita' | 'despesa',
        category: data.category as TransactionCategory,
        date: data.date,
        description: data.description,
        value: Number(data.value),
        createdAt: Number(data.created_at),
      };

      setTransactions(prev => [newTransaction, ...prev]);
      toast.success('Transação adicionada!');
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      toast.error('Erro ao adicionar transação');
    }
  }, []);

  // Atualizar transação existente
  const updateTransaction = useCallback(async (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => {
    try {
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

      if (error) throw error;

      setTransactions(prev =>
        prev.map(t => (t.id === id ? { ...t, ...updates } : t))
      );
      toast.success('Transação atualizada!');
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      toast.error('Erro ao atualizar transação');
    }
  }, []);

  // Excluir transação
  const deleteTransaction = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTransactions(prev => prev.filter(t => t.id !== id));
      toast.success('Transação excluída!');
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      toast.error('Erro ao excluir transação');
    }
  }, []);

  // Filtrar transações por período e ordenar por data (mais recente primeiro)
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

    // Ordenar por data (mais recente primeiro)
    return filtered.sort((a, b) => {
      const dateA = parseLocalDate(a.date);
      const dateB = parseLocalDate(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [transactions, customRange]);

  // Calcular totais
  const getTotals = useCallback(() => {
    const filtered = getFilteredTransactions();
    
    const receitas = filtered
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.value, 0);
    
    const despesas = filtered
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.value, 0);
    
    return {
      receitas,
      despesas,
      saldo: receitas - despesas,
    };
  }, [getFilteredTransactions]);

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
    refetch: fetchTransactions,
  };
};
