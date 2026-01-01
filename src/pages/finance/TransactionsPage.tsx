import { Transactions } from '@/features/finance/components';
import { useFinanceData } from '@/features/finance/state';

const TransactionsPage = () => {
  const {
    getFilteredTransactions,
    customRange,
    setCustomRange,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    formatValue,
    showValues,
    toggleValuesVisibility,
  } = useFinanceData();

  return (
    <Transactions
      transactions={getFilteredTransactions()}
      customRange={customRange}
      onCustomRangeChange={setCustomRange}
      onAdd={addTransaction}
      onUpdate={updateTransaction}
      onDelete={deleteTransaction}
      formatValue={formatValue}
      showValues={showValues}
      onToggleValues={toggleValuesVisibility}
    />
  );
};

export default TransactionsPage;
