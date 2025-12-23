import { useState, useEffect, useCallback } from 'react';
import { Transaction, PeriodFilter } from '@/types/transaction';
import { CustomDateRange } from '@/components/finance/AdvancedPeriodFilter';

const STORAGE_KEY = 'financeiro-pessoal-transactions';

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
  const [filter, setFilter] = useState<PeriodFilter>('mes');
  const [customRange, setCustomRange] = useState<CustomDateRange | null>(null);

  // Carregar do localStorage ao iniciar
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTransactions(parsed);
      } catch (error) {
        console.error('Erro ao carregar transações:', error);
      }
    }
  }, []);

  // Salvar no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  // Adicionar nova transação
  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  }, []);

  // Atualizar transação existente
  const updateTransaction = useCallback((id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => {
    setTransactions(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  // Excluir transação
  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  // Filtrar transações por período
  const getFilteredTransactions = useCallback(() => {
    if (filter === 'todos') return transactions;

    // Se há um customRange, use-o
    if (customRange) {
      return transactions.filter(t => {
        const transactionDate = parseLocalDate(t.date);
        const startDate = new Date(customRange.start);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(customRange.end);
        endDate.setHours(23, 59, 59, 999);
        
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }

    // Fallback para o filtro padrão (período atual)
    const today = new Date();
    const todayStr = getLocalDateString(today);

    return transactions.filter(t => {
      const transactionDate = parseLocalDate(t.date);
      
      switch (filter) {
        case 'dia':
          return t.date === todayStr;
        
        case 'semana': {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23, 59, 59, 999);
          
          return transactionDate >= startOfWeek && transactionDate <= endOfWeek;
        }
        
        case 'mes':
          return (
            transactionDate.getMonth() === today.getMonth() &&
            transactionDate.getFullYear() === today.getFullYear()
          );
        
        case 'ano':
          return transactionDate.getFullYear() === today.getFullYear();
        
        default:
          return true;
      }
    });
  }, [transactions, filter, customRange]);

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
    filter,
    setFilter,
    customRange,
    setCustomRange,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getFilteredTransactions,
    getTotals,
  };
};
