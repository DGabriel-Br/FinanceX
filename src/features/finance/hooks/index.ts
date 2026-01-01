// Shim de compatibilidade - reexportando hooks de finance
// Este arquivo permite que importações de @/features/finance/hooks funcionem
// enquanto os arquivos originais permanecem em src/hooks

// Transaction hooks
export { useTransactions, getLocalDateString, parseLocalDate } from '@/hooks/useTransactions';
export { useOfflineTransactions } from '@/hooks/useOfflineTransactions';

// Debt hooks
export { useDebts } from '@/hooks/useDebts';
export { useOfflineDebts } from '@/hooks/useOfflineDebts';

// Investment hooks
export { useInvestmentGoals } from '@/hooks/useInvestmentGoals';
export type { InvestmentGoal } from '@/hooks/useInvestmentGoals';
export { useOfflineInvestmentGoals } from '@/hooks/useOfflineInvestmentGoals';

// Category hooks
export { useCustomCategories } from '@/hooks/useCustomCategories';

// Sync hooks
export { useRealtimeSync } from '@/hooks/useRealtimeSync';

// Visibility hooks
export { useValuesVisibility } from '@/hooks/useValuesVisibility';
