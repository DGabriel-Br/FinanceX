import { createContext, useContext, ReactNode, useCallback } from 'react';
import { Transaction, TransactionType } from '@/types/transaction';
import { Debt } from '@/types/debt';
import { CustomDateRange } from '@/components/finance/PeriodFilter';
import { useTransactions } from '@/hooks/useTransactions';
import { useDebts } from '@/hooks/useDebts';
import { useValuesVisibility } from '@/hooks/useValuesVisibility';

interface FinanceDataContextValue {
  // Transactions
  transactions: Transaction[];
  transactionsLoading: boolean;
  customRange: CustomDateRange | null;
  setCustomRange: (range: CustomDateRange | null) => void;
  addTransaction: (transaction: { type: TransactionType; category: string; date: string; description: string; value: number }) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getFilteredTransactions: () => Transaction[];
  getTotals: () => { receitas: number; despesas: number; saldoAnterior: number; saldoPeriodo: number; saldo: number };
  refetchTransactions: () => Promise<void>;

  // Debts
  debts: Debt[];
  debtsLoading: boolean;
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt'>) => void;
  updateDebt: (id: string, updates: Partial<Omit<Debt, 'id' | 'createdAt'>>) => void;
  deleteDebt: (id: string) => void;
  refetchDebts: () => Promise<void>;

  // Values visibility
  showValues: boolean;
  toggleValuesVisibility: () => void;
  formatValue: (value: number) => string;

  // Refresh all
  refreshAll: () => Promise<void>;
}

const FinanceDataContext = createContext<FinanceDataContextValue | null>(null);

export const useFinanceData = () => {
  const context = useContext(FinanceDataContext);
  if (!context) {
    throw new Error('useFinanceData must be used within a FinanceDataProvider');
  }
  return context;
};

interface FinanceDataProviderProps {
  children: ReactNode;
}

export const FinanceDataProvider = ({ children }: FinanceDataProviderProps) => {
  const {
    transactions,
    loading: transactionsLoading,
    customRange,
    setCustomRange,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getFilteredTransactions,
    getTotals,
    refetch: refetchTransactions,
  } = useTransactions();

  const {
    debts,
    loading: debtsLoading,
    addDebt,
    updateDebt,
    deleteDebt,
    refetch: refetchDebts,
  } = useDebts();

  const { showValues, toggleValuesVisibility, formatValue } = useValuesVisibility();

  const refreshAll = useCallback(async () => {
    await Promise.all([
      refetchTransactions(),
      refetchDebts(),
    ]);
  }, [refetchTransactions, refetchDebts]);

  return (
    <FinanceDataContext.Provider
      value={{
        transactions,
        transactionsLoading,
        customRange,
        setCustomRange,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getFilteredTransactions,
        getTotals,
        refetchTransactions,
        debts,
        debtsLoading,
        addDebt,
        updateDebt,
        deleteDebt,
        refetchDebts,
        showValues,
        toggleValuesVisibility,
        formatValue,
        refreshAll,
      }}
    >
      {children}
    </FinanceDataContext.Provider>
  );
};
