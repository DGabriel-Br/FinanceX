/**
 * Funções puras para cálculos de investimentos.
 */

import { Transaction } from '@/types/transaction';
import { 
  InvestmentType, 
  investmentTypeLabels, 
  investmentTypeColors,
  investmentTypeIcons,
  extractInvestmentType 
} from '@/types/investment';
import { filterInvestmentDeposits, filterInvestmentWithdrawals } from './transactions';
import { LucideIcon } from 'lucide-react';

export interface InvestmentSummary {
  type: InvestmentType;
  name: string;
  value: number;
  color: string;
  Icon: LucideIcon;
}

export interface InvestmentTotals {
  totalDeposits: number;
  totalWithdrawals: number;
  netInvested: number;
}

export interface InvestmentActivity {
  id: string;
  type: 'receita' | 'despesa';
  category: string;
  date: string;
  description: string;
  value: number;
  createdAt: number;
  activityType: 'aporte' | 'resgate';
  investmentType: InvestmentType;
}

/**
 * Agrupa investimentos por tipo, subtraindo resgates
 */
export const aggregateInvestmentsByType = (
  transactions: Transaction[]
): Map<InvestmentType, number> => {
  const deposits = filterInvestmentDeposits(transactions);
  const withdrawals = filterInvestmentWithdrawals(transactions);
  
  const grouped = new Map<InvestmentType, number>();
  
  // Soma aportes
  for (const t of deposits) {
    const type = extractInvestmentType(t.description);
    const current = grouped.get(type) || 0;
    grouped.set(type, current + t.value);
  }
  
  // Subtrai resgates
  for (const t of withdrawals) {
    const type = extractInvestmentType(t.description);
    const current = grouped.get(type) || 0;
    grouped.set(type, Math.max(0, current - t.value));
  }
  
  return grouped;
};

/**
 * Retorna resumo de investimentos por tipo para exibição
 */
export const getInvestmentSummary = (
  transactions: Transaction[]
): InvestmentSummary[] => {
  const grouped = aggregateInvestmentsByType(transactions);
  
  return Array.from(grouped.entries())
    .map(([type, value]) => ({
      type,
      name: investmentTypeLabels[type],
      value,
      color: investmentTypeColors[type],
      Icon: investmentTypeIcons[type],
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);
};

/**
 * Calcula totais de investimentos
 */
export const calculateInvestmentTotals = (
  transactions: Transaction[]
): InvestmentTotals => {
  const deposits = filterInvestmentDeposits(transactions);
  const withdrawals = filterInvestmentWithdrawals(transactions);
  
  const totalDeposits = deposits.reduce((sum, t) => sum + t.value, 0);
  const totalWithdrawals = withdrawals.reduce((sum, t) => sum + t.value, 0);
  
  return {
    totalDeposits,
    totalWithdrawals,
    netInvested: Math.max(0, totalDeposits - totalWithdrawals),
  };
};

/**
 * Retorna histórico de atividades de investimento (aportes e resgates)
 */
export const getInvestmentActivities = (
  transactions: Transaction[],
  filter: 'all' | 'aporte' | 'resgate' = 'all'
): InvestmentActivity[] => {
  const deposits = filterInvestmentDeposits(transactions);
  const withdrawals = filterInvestmentWithdrawals(transactions);
  
  const aportes: InvestmentActivity[] = deposits.map(t => ({
    ...t,
    activityType: 'aporte' as const,
    investmentType: extractInvestmentType(t.description),
  }));
  
  const resgates: InvestmentActivity[] = withdrawals.map(t => ({
    ...t,
    activityType: 'resgate' as const,
    investmentType: extractInvestmentType(t.description),
  }));
  
  let activities: InvestmentActivity[];
  
  if (filter === 'aporte') {
    activities = aportes;
  } else if (filter === 'resgate') {
    activities = resgates;
  } else {
    activities = [...aportes, ...resgates];
  }
  
  return activities.sort((a, b) => b.createdAt - a.createdAt);
};

/**
 * Calcula progresso de metas de investimento
 */
export const calculateGoalProgress = (
  invested: number,
  target: number
): { progress: number; remaining: number } => {
  if (target <= 0) {
    return { progress: 0, remaining: 0 };
  }
  
  return {
    progress: Math.min((invested / target) * 100, 100),
    remaining: Math.max(target - invested, 0),
  };
};
