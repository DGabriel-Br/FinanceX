/**
 * Funções puras para cálculos de dívidas.
 */

import { Debt } from '@/types/debt';
import { Transaction } from '@/types/transaction';

export interface DebtSummary {
  totalDebt: number;
  totalPaid: number;
  totalRemaining: number;
  debtCount: number;
}

export interface DebtProgress {
  paidValue: number;
  remainingValue: number;
  progress: number;
  estimatedMonthsRemaining: number;
}

/**
 * Calcula valor pago de uma dívida com base nas transações + valor inicial
 */
export const calculateDebtPaidValue = (
  debt: Debt,
  transactions: Transaction[]
): number => {
  const transactionsPaid = transactions
    .filter(t => 
      t.type === 'despesa' && 
      t.category === 'dividas' && 
      t.description.toLowerCase().includes(debt.name.toLowerCase())
    )
    .reduce((sum, t) => sum + t.value, 0);
  
  return debt.paidValue + transactionsPaid;
};

/**
 * Calcula progresso de pagamento de uma dívida
 */
export const calculateDebtProgress = (
  debt: Debt,
  transactions: Transaction[]
): DebtProgress => {
  const paidValue = calculateDebtPaidValue(debt, transactions);
  const remainingValue = Math.max(0, debt.totalValue - paidValue);
  const progress = debt.totalValue > 0 
    ? Math.min((paidValue / debt.totalValue) * 100, 100) 
    : 0;
  
  const estimatedMonthsRemaining = debt.monthlyInstallment > 0
    ? Math.ceil(remainingValue / debt.monthlyInstallment)
    : 0;
  
  return {
    paidValue,
    remainingValue,
    progress,
    estimatedMonthsRemaining,
  };
};

/**
 * Calcula resumo geral de todas as dívidas
 */
export const calculateDebtsSummary = (
  debts: Debt[],
  transactions: Transaction[]
): DebtSummary => {
  let totalDebt = 0;
  let totalPaid = 0;
  let totalRemaining = 0;
  
  for (const debt of debts) {
    const paidValue = calculateDebtPaidValue(debt, transactions);
    totalDebt += debt.totalValue;
    totalPaid += paidValue;
    totalRemaining += Math.max(0, debt.totalValue - paidValue);
  }
  
  return {
    totalDebt,
    totalPaid,
    totalRemaining,
    debtCount: debts.length,
  };
};

/**
 * Retorna dívidas ordenadas por progresso (menor primeiro)
 */
export const sortDebtsByProgress = (
  debts: Debt[],
  transactions: Transaction[]
): Array<Debt & { progress: DebtProgress }> => {
  return debts
    .map(debt => ({
      ...debt,
      progress: calculateDebtProgress(debt, transactions),
    }))
    .sort((a, b) => a.progress.progress - b.progress.progress);
};

/**
 * Retorna dívidas próximas de serem quitadas (>80% pagas)
 */
export const getNearlyPaidDebts = (
  debts: Debt[],
  transactions: Transaction[],
  threshold = 80
): Debt[] => {
  return debts.filter(debt => {
    const { progress } = calculateDebtProgress(debt, transactions);
    return progress >= threshold && progress < 100;
  });
};

/**
 * Retorna dívidas já quitadas (100% pagas)
 */
export const getPaidDebts = (
  debts: Debt[],
  transactions: Transaction[]
): Debt[] => {
  return debts.filter(debt => {
    const { progress } = calculateDebtProgress(debt, transactions);
    return progress >= 100;
  });
};
