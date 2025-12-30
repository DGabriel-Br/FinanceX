/**
 * Core Finance Domain
 * 
 * Este módulo centraliza todas as regras de domínio financeiro.
 * As funções aqui são puras e não dependem de estado ou efeitos colaterais.
 * 
 * Uso:
 * import { calculateTotals, aggregateByCategory } from '@/core/finance';
 */

// Balance calculations
export {
  calculatePreviousBalance,
  calculateTotals,
  calculatePreviousYearBalance,
  calculateMonthlyData,
  type FinancialTotals,
  type DateRange as BalanceDateRange,
} from './balance';

// Transaction operations
export {
  filterByDateRange,
  sortByDateDescending,
  filterByType,
  filterByCategory,
  aggregateByCategory,
  calculateTotal,
  filterInvestmentDeposits,
  filterInvestmentWithdrawals,
  type DateRange,
  type CategoryAggregate,
} from './transactions';

// Investment calculations
export {
  aggregateInvestmentsByType,
  getInvestmentSummary,
  calculateInvestmentTotals,
  getInvestmentActivities,
  calculateGoalProgress,
  type InvestmentSummary,
  type InvestmentTotals,
  type InvestmentActivity,
} from './investments';

// Debt calculations
export {
  calculateDebtPaidValue,
  calculateDebtProgress,
  calculateDebtsSummary,
  sortDebtsByProgress,
  getNearlyPaidDebts,
  getPaidDebts,
  type DebtSummary,
  type DebtProgress,
} from './debts';

// Investment metadata (structured description encoding/decoding)
export {
  encodeInvestmentDescription,
  decodeInvestmentDescription,
  getCleanDescription,
  hasStructuredTag,
  type InvestmentMetadata,
} from './investmentMetadata';
