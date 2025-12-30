/**
 * Funções puras para filtragem e agregação de transações.
 */

import { Transaction, TransactionCategory } from '@/types/transaction';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface CategoryAggregate {
  category: TransactionCategory;
  total: number;
  count: number;
  percentage: number;
}

/**
 * Filtra transações por período
 */
export const filterByDateRange = (
  transactions: Transaction[],
  range: DateRange | null
): Transaction[] => {
  if (!range) return transactions;

  const startDate = new Date(range.start);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(range.end);
  endDate.setHours(23, 59, 59, 999);

  return transactions.filter(t => {
    const transactionDate = parseLocalDate(t.date);
    return transactionDate >= startDate && transactionDate <= endDate;
  });
};

/**
 * Ordena transações por data (mais recentes primeiro)
 */
export const sortByDateDescending = (transactions: Transaction[]): Transaction[] => {
  return [...transactions].sort((a, b) => {
    const dateA = parseLocalDate(a.date);
    const dateB = parseLocalDate(b.date);
    return dateB.getTime() - dateA.getTime();
  });
};

/**
 * Filtra transações por tipo (receita/despesa)
 */
export const filterByType = (
  transactions: Transaction[],
  type: 'receita' | 'despesa'
): Transaction[] => {
  return transactions.filter(t => t.type === type);
};

/**
 * Filtra transações por categoria
 */
export const filterByCategory = (
  transactions: Transaction[],
  category: TransactionCategory
): Transaction[] => {
  return transactions.filter(t => t.category === category);
};

/**
 * Agrupa transações por categoria e calcula totais
 */
export const aggregateByCategory = (
  transactions: Transaction[],
  type?: 'receita' | 'despesa'
): CategoryAggregate[] => {
  const filtered = type ? filterByType(transactions, type) : transactions;
  const total = filtered.reduce((sum, t) => sum + t.value, 0);
  
  const grouped = new Map<TransactionCategory, { total: number; count: number }>();
  
  for (const t of filtered) {
    const current = grouped.get(t.category) || { total: 0, count: 0 };
    grouped.set(t.category, {
      total: current.total + t.value,
      count: current.count + 1,
    });
  }
  
  return Array.from(grouped.entries())
    .map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      percentage: total > 0 ? (data.total / total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
};

/**
 * Calcula soma total de transações
 */
export const calculateTotal = (transactions: Transaction[]): number => {
  return transactions.reduce((sum, t) => sum + t.value, 0);
};

/**
 * Filtra transações de investimentos (despesas com categoria 'investimentos')
 */
export const filterInvestmentDeposits = (transactions: Transaction[]): Transaction[] => {
  return transactions.filter(t => t.type === 'despesa' && t.category === 'investimentos');
};

/**
 * Filtra resgates de investimento
 * Suporta tanto o novo formato estruturado [RES:tipo] quanto o legado com 'resgate' no texto
 */
export const filterInvestmentWithdrawals = (transactions: Transaction[]): Transaction[] => {
  const WITHDRAWAL_TAG_REGEX = /^\[RES:[a-z_]+\]/i;
  
  return transactions.filter(t => {
    if (t.type !== 'receita') return false;
    
    // Verifica o novo formato estruturado
    if (WITHDRAWAL_TAG_REGEX.test(t.description)) return true;
    
    // Fallback: formato legado
    return t.description.toLowerCase().includes('resgate');
  });
};

// Helper para criar Date a partir de string YYYY-MM-DD sem problemas de fuso
const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};
